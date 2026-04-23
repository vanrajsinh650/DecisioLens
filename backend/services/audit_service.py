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

import asyncio
from typing import Any, Mapping

from ai.gemini import GeminiService
from core.analysis import (
    build_reason_tags,
    classify_confidence,
    compute_risk_score,
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
    Insights,
    OriginalDecision,
    RiskAssessment,
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
        cache_key = profile_cache_key(validated_profile)
        original_score: float | None = self._cache.get(cache_key)
        if original_score is None:
            original_score = compute_score_from_validated(validated_profile)
            self._cache.set(cache_key, original_score)
            logger.debug("Score computed: %.6f", original_score)
        else:
            logger.debug("Score cache hit: %.6f", original_score)

        # ── 3. Original decision ─────────────────────────────────────
        original_decision = make_decision(score=original_score, threshold=threshold)
        original_result = {"score": original_score, "decision": original_decision}

        # ── 4. Threshold sensitivity (reuses baseline score) ─────────
        threshold_results = analyze_threshold_sensitivity(original_score)
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

        variation_output = [
            VariationResult(
                variation=v["variation"],
                score=all_variation_results[v["variation"]]["score"],
                decision=all_variation_results[v["variation"]]["decision"],
            )
            for v in generated_variations
        ]

        # ── 6. Instability & bias detection ──────────────────────────
        instability_report = detect_instability(
            original=all_variation_results["baseline"],
            variations=all_variation_results,
            threshold_results=threshold_results,
        )
        bias_report = detect_bias_patterns(
            original=all_variation_results["baseline"],
            variations=all_variation_results,
        )

        # ── 7. Confidence / risk / reason tags ───────────────────────
        confidence_zone = classify_confidence(original_score)
        risk_assessment = compute_risk_score(
            instability=instability_report,
            bias_detected=bool(bias_report.get("has_bias_flags")),
        )
        reason_tags = build_reason_tags(
            instability_report=instability_report,
            bias_report=bias_report,
            confidence_zone=confidence_zone,
        )

        ai_jury_view = AIJuryView(
            auditor="bias detected",
            challenger="uncertain",
            judge="moderate risk",
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

        explanation, appeal = await asyncio.gather(
            self._gemini.generate_explanation(context),
            self._gemini.generate_appeal(context),
        )
        logger.info(
            "Audit complete: decision=%s score=%.4f risk=%s",
            original_decision,
            original_score,
            risk_assessment["level"],
        )

        # ── 9. Assemble response ─────────────────────────────────────
        return AuditResponse(
            original=OriginalDecision(score=original_score, decision=original_decision),
            threshold_analysis=threshold_analysis,
            variations=variation_output,
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
        )

    # ── Private ──────────────────────────────────────────────────────

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
        """Build the context dict sent to Gemini for explanation / appeal."""
        return {
            "original": {
                **original_result,
                "profile": dict(validated_profile),
            },
            "threshold": threshold,
            "threshold_analysis": threshold_analysis_raw,
            "variations": variation_output,
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
