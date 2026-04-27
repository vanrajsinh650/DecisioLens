"""
Audit pipeline orchestrator.

``AuditService`` wires together every pipeline module into a single
``run_audit`` coroutine.  It owns no business logic of its own — each
step is delegated to a dedicated module in ``core/``.

Performance optimisations
-------------------------
* Baseline score is computed **once** and reused for threshold analysis,
  decision making, and as the "baseline" entry in variation results.
* Gemini explanation and appeal calls are fired **concurrently** via
  ``asyncio.gather``, saving one full round-trip of API latency.
* Computed scores are cached in an in-memory LRU cache so repeated
  profiles skip the scoring step entirely.
"""

from __future__ import annotations

from typing import Any, Mapping

from ai.gemini import (
    GeminiService,
)
from core.analysis import (
    build_reason_tags,
    classify_confidence,
    compute_human_review_recommendation,
    compute_impact_analysis,
    compute_recourse_suggestions,
    compute_risk_score,
    compute_stability_zone,
    detect_bias_patterns,
    detect_instability,
)
from core.cache import Cache, profile_cache_key
from core.logging import get_logger
from core.model import compute_score_from_validated
from core.scenario import evaluate_variations, generate_variations
from core.threshold import analyze_threshold_sensitivity, make_decision
from schemas.request import validate_profile
from schemas.response import (
    AIJuryView,
    AuditResponse,
    HumanReview,
    ImpactItem,
    Insights,
    OriginalDecision,
    RecourseItem,
    RiskAssessment,
    StabilityZone,
    StabilityZoneResult,
    ThresholdAnalysisItem,
    VariationResult,
)

logger = get_logger("audit_service")


class AuditService:
    """Stateless audit pipeline orchestrator."""

    def __init__(self, gemini: GeminiService, cache: Cache) -> None:
        self._gemini = gemini
        self._cache = cache

    async def run_audit(
        self,
        profile: Mapping[str, Any],
        threshold: float = 0.5,
    ) -> AuditResponse:
        """
        Execute the full audit pipeline and return a typed response.

        Steps
        -----
        1. Validate & normalise the profile
        2. Compute the baseline score (cached)
        3. Make the original decision
        4. Run threshold sensitivity analysis (reuses baseline score)
        5. Generate counterfactual variations & evaluate them
        6. Detect instability and bias patterns
        7. Classify confidence / compute risk / build reason tags
        8. Generate Gemini explanation + appeal **concurrently**
        9. Assemble and return ``AuditResponse``
        """

        if not 0.0 <= threshold <= 1.0:
            raise ValueError("threshold must be between 0 and 1")

        # ── 1. Validation ────────────────────────────────────────────
        validated_profile = validate_profile(profile)
        logger.debug("Profile validated", extra={"audit_id": id(validated_profile)})

        # ── 2. Baseline score (cached) ───────────────────────────────
        import math as _math
        cache_key = profile_cache_key(validated_profile)
        original_score: float | None = self._cache.get(cache_key)
        if original_score is None:
            original_score = compute_score_from_validated(validated_profile)
            # Only cache finite, valid scores — prevents cache poisoning
            if _math.isfinite(original_score) and 0.0 <= original_score <= 1.0:
                self._cache.set(cache_key, original_score)
            else:
                raise ValueError(
                    f"Scoring produced invalid value {original_score} — refusing to cache"
                )
            logger.debug("Score computed: %.6f", original_score)
        else:
            logger.debug("Score cache hit: %.6f", original_score)

        # ── 3. Original decision ─────────────────────────────────────
        original_decision = make_decision(score=original_score, threshold=threshold)
        original_result = {"score": original_score, "decision": original_decision}

        # ── 4. Threshold sensitivity (reuses baseline score) ─────────
        threshold_results = analyze_threshold_sensitivity(original_score, user_threshold=threshold)
        threshold_analysis = [
            ThresholdAnalysisItem(threshold=tv, decision=d)
            for tv, d in threshold_results.items()
        ]

        # ── 5. Variation generation & evaluation ─────────────────────
        generated_variations = generate_variations(validated_profile)
        counterfactual_variations = [
            item for item in generated_variations if item.get("variation") != "baseline"
        ]
        counterfactual_results = evaluate_variations(counterfactual_variations, threshold)

        all_variation_results: dict[str, dict[str, Any]] = {
            "baseline": {**original_result, "profile": dict(validated_profile)},
            **counterfactual_results,
        }

        # Human-readable label mapping for variation keys
        _VARIATION_LABELS = {
            "baseline": "Baseline (original)",
            "gender_swap": "Gender swap",
            "location_change": "Location change",
            "college_change": "College / Education tier",
            "employment_change": "Employment type change",
            "category_change": "Social category change",
            "age_change": "Age group change",
            "income_change": "Income level change",
            "score_bump": "Qualification score bump",
        }

        variation_output = []
        for v in generated_variations:
            vname = v["variation"]
            vdata = all_variation_results[vname]
            vdecision = vdata["decision"]
            variation_output.append(
                VariationResult(
                    variation=vname,
                    label=_VARIATION_LABELS.get(vname, vname.replace("_", " ").title()),
                    score=vdata["score"],
                    decision=vdecision,
                    changed=vdecision != original_decision,
                    profile=v.get("profile"),
                )
            )

        # ── 6. Instability & bias detection ──────────────────────────
        instability_report = detect_instability(
            original=all_variation_results["baseline"],
            variations=all_variation_results,
            threshold_results=threshold_results,
            user_threshold=threshold,
        )
        bias_report = detect_bias_patterns(
            original=all_variation_results["baseline"],
            variations=all_variation_results,
        )

        # ── 7. Confidence / risk / reason tags ───────────────────────
        confidence_zone = classify_confidence(original_score, threshold)
        risk_assessment = compute_risk_score(
            instability=instability_report,
            bias_detected=bool(bias_report.get("has_bias_flags")),
            bias_flag_count=int(bias_report.get("flag_count", 0)),
        )
        reason_tags = build_reason_tags(
            instability_report=instability_report,
            bias_report=bias_report,
            confidence_zone=confidence_zone,
        )

        # ── 7b. Stability zone + impact analysis ─────────────────────
        stability_zone_data = compute_stability_zone(
            score=original_score,
            threshold_results=threshold_results,
        )
        impact_analysis_data = compute_impact_analysis(
            original_score=original_score,
            variation_outcomes=all_variation_results,
            threshold=threshold,
            original_decision=original_decision,
        )

        auditor_verdict = (
            f"bias detected ({bias_report.get('flag_count', 0)} flag(s))"
            if bool(bias_report.get("has_bias_flags"))
            else "no bias flags"
        )

        instability_data = instability_report if isinstance(instability_report, dict) else {}
        challenger_verdict = "unstable" if instability_data.get("is_unstable") else "stable"

        judge_verdict = (
            f"{risk_assessment.get('level', 'unknown').lower()} risk"
            f" (score={risk_assessment.get('score', 0)})"
        )

        ai_jury_view = AIJuryView(
            auditor=auditor_verdict,
            challenger=challenger_verdict,
            judge=judge_verdict,
        )

        # ── 8. Gemini calls (concurrent) ─────────────────────────────
        context = self._build_gemini_context(
            original_result=original_result,
            validated_profile=validated_profile,
            threshold=threshold,
            threshold_analysis_raw=[
                {"threshold": tv, "decision": d}
                for tv, d in threshold_results.items()
            ],
            variation_output=[v.model_dump() for v in variation_output],
            instability_report=instability_report,
            bias_report=bias_report,
            confidence_zone=confidence_zone,
            risk_assessment=risk_assessment,
            reason_tags=reason_tags,
            ai_jury_view=ai_jury_view.model_dump(),
        )

        explanation, appeal, explanation_request = await self._gemini.generate_audit_artifacts(context)

        # Deterministically format the applicant name after generation. The LLM
        # sees only sanitized context and is asked to use a structured placeholder;
        # if it omits the placeholder, append a canonical Applicant line instead
        # of relying on a literal global replacement of redaction text.
        real_name = str(validated_profile.get("name", "the applicant"))
        explanation_request = _format_explanation_request_letter(explanation_request, real_name)
        # ── 9. Recourse + human review ───────────────────────────────
        recourse_list = compute_recourse_suggestions(
            original_score=original_score,
            original_decision=original_decision,
            threshold=threshold,
            instability_report=instability_report,
            bias_report=bias_report,
        )
        human_review = compute_human_review_recommendation(
            risk_score=risk_assessment["score"],
            instability_report=instability_report,
            bias_report=bias_report,
            confidence_zone=confidence_zone,
        )

        logger.info(
            "Audit complete: decision=%s score=%.4f risk=%s review=%s",
            original_decision,
            original_score,
            risk_assessment["level"],
            human_review["level"],
        )

        # ── 10. Assemble response ────────────────────────────────────
        return AuditResponse(
            original=OriginalDecision(
                score=original_score,
                decision=original_decision,
                threshold=threshold,
                confidence_zone=confidence_zone,
            ),
            threshold_analysis=threshold_analysis,
            variations=variation_output,
            stability_zone=StabilityZoneResult(
                zones=[StabilityZone(**z) for z in stability_zone_data["zones"]],
                summary=stability_zone_data["summary"],
            ),
            impact_analysis=[ImpactItem(**item) for item in impact_analysis_data],
            confidence_zone=confidence_zone,
            risk=RiskAssessment(**risk_assessment),
            reason_tags=reason_tags,
            ai_jury_view=ai_jury_view,
            insights=Insights(
                instability=bool(instability_report.get("is_unstable")),
                bias_detected=bool(bias_report.get("has_bias_flags")),
                confidence_zone=confidence_zone,
                risk_score=risk_assessment["score"],
                risk_level=risk_assessment["level"],
                reason_tags=reason_tags,
            ),
            explanation=explanation,
            appeal=appeal,
            explanation_request=explanation_request,
            recourse=[RecourseItem(**r) for r in recourse_list],
            human_review=HumanReview(**human_review),
        )

    # ── Private ──────────────────────────────────────────────────────

    @staticmethod
    def _sanitize_profile_for_llm(profile: dict) -> dict:
        """Strip PII and free-text fields before sending to Gemini.

        Only structured, non-sensitive fields are forwarded.  The
        ``name`` field is replaced with a placeholder so the LLM
        never sees real PII.  All string values are truncated and
        stripped of characters that could act as prompt delimiters
        or injection vectors.
        """
        import re

        # Fields safe to send to external LLM (no PII, no free text).  Free-text
        # fields such as name/location are not forwarded; structured strings are
        # only included when they match known enum-style values.
        _SAFE_FIELDS = {
            "domain", "gender", "score", "experience", "college",
            "credit_score", "income", "loan_amount", "employment_type",
            "grade_12", "category", "income_band", "age", "claim_amount",
            "policy_tenure", "city_tier", "pre_existing", "annual_income",
            "land_holding", "aadhaar_linked", "state_tier",
            "interview_score", "employment_years",
            "extracurricular", "coverage_amount", "family_size",
            "employment_status", "housing_status",
        }
        _SAFE_STRING_VALUES = {
            "domain": {"hiring", "lending", "education", "insurance", "welfare", "custom"},
            "gender": {"male", "female", "m", "f", "man", "woman", "other", "non-binary", "prefer not to say"},
            "college": {"tier 1", "tier 2", "tier 3", "iit", "nit"},
            "employment_type": {"salaried", "self-employed", "self employed", "freelancer", "contract", "full-time", "full time"},
            "category": {"general", "obc", "sc", "st", "ews"},
            "income_band": {"low", "middle", "high"},
            "city_tier": {"tier 1", "tier 2", "tier 3"},
            "pre_existing": {"none", "diabetes", "hypertension", "both"},
            "aadhaar_linked": {"yes", "no"},
            "state_tier": {"metro state", "developed state", "developing state", "remote region"},
            "employment_status": {"employed", "self-employed", "self employed", "daily wage", "part-time", "part time", "casual", "unemployed"},
            "housing_status": {"owns home", "owned", "renting", "homeless", "shared", "shelter"},
        }
        # Aggressive character stripping regex —
        # Only allow alphanumeric, spaces, hyphens, periods, commas
        _SAFE_CHARS = re.compile(r"[^a-zA-Z0-9\s.,\-]")

        sanitized: dict = {"name": "[REDACTED]"}
        for key, value in profile.items():
            if key not in _SAFE_FIELDS:
                continue
            if isinstance(value, str):
                # Truncate, strip injection markers, and allow only safe chars
                clean = value[:80]
                clean = _SAFE_CHARS.sub("", clean).strip()
                allowed_values = _SAFE_STRING_VALUES.get(key)
                if clean and allowed_values and clean.lower() in allowed_values:
                    sanitized[key] = clean
            elif isinstance(value, bool):
                sanitized[key] = value
            elif isinstance(value, (int, float)):
                sanitized[key] = value
        return sanitized

    @staticmethod
    def _build_gemini_context(
        *,
        original_result: dict,
        validated_profile: dict,
        threshold: float,
        threshold_analysis_raw: list[dict],
        variation_output: list[dict],
        instability_report: dict,
        bias_report: dict,
        confidence_zone: str,
        risk_assessment: dict,
        reason_tags: list[str],
        ai_jury_view: dict,
    ) -> dict[str, Any]:
        """Build the context dict sent to Gemini for explanation / appeal.

        Profile is sanitized — PII stripped, free-text removed — before
        inclusion so user-controlled content cannot influence the LLM.
        """
        safe_profile = AuditService._sanitize_profile_for_llm(validated_profile)
        safe_variations: list[dict[str, Any]] = []
        for item in variation_output:
            copied = dict(item)
            profile = copied.get("profile")
            copied["profile"] = (
                AuditService._sanitize_profile_for_llm(profile)
                if isinstance(profile, dict)
                else None
            )
            safe_variations.append(copied)
        return {
            "original": {
                **original_result,
                "profile": safe_profile,
            },
            "threshold": threshold,
            "threshold_analysis": threshold_analysis_raw,
            "variations": safe_variations,
            "analysis": {
                "instability": instability_report,
                "bias": bias_report,
            },
            "decision_quality": {
                "confidence_zone": confidence_zone,
                "risk": risk_assessment,
                "reason_tags": reason_tags,
            },
            "ai_jury_view": ai_jury_view,
        }


_APPLICANT_NAME_PLACEHOLDERS = (
    "{{APPLICANT_NAME}}",
    "{APPLICANT_NAME}",
    "<APPLICANT_NAME>",
)


def _format_explanation_request_letter(letter: str, applicant_name: str) -> str:
    """Inject applicant identity deterministically without exposing PII to the LLM."""
    name = applicant_name.strip() or "the applicant"
    formatted = letter.strip()

    for placeholder in _APPLICANT_NAME_PLACEHOLDERS:
        formatted = formatted.replace(placeholder, name)

    # If the model copied the sanitized context token, keep prose readable without
    # depending on that token as the mechanism for inserting the real identity.
    formatted = formatted.replace("[REDACTED]", "the applicant")

    if name != "the applicant" and name.lower() not in formatted.lower():
        formatted = f"{formatted}\n\nApplicant: {name}"

    return formatted
