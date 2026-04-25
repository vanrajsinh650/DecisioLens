"""
Gemini AI integration — async service layer.

Provides ``GeminiService``, a singleton class that:
- Builds the Gemini client **once** at construction (not per call)
- Exposes ``async`` methods for explanation and appeal generation
- Wraps the synchronous SDK via ``asyncio.to_thread`` to avoid blocking
- Falls back to deterministic templates when the API is unreachable
- Enforces a hard context-size budget to prevent prompt-size DoS
- Uses a bounded semaphore to limit concurrent Gemini calls
"""

from __future__ import annotations

import asyncio
import json
from functools import lru_cache
from typing import Any, Mapping

from google import genai
from google.genai import types

from core.config import Settings, get_settings
from core.logging import get_logger

logger = get_logger("gemini")


# ── Constants ────────────────────────────────────────────────────────

_EXPLANATION_REQUIRED_SECTIONS = ("Summary:", "Key Reason:", "Risk:", "Recommendation:")

# Hard cap on serialized context sent to Gemini (characters).  ~8 KB
# prevents runaway token costs from oversized payloads that slip
# through the request-level size guard.
_MAX_CONTEXT_CHARS = 8_192

# Maximum concurrent Gemini API calls across all requests.
_GEMINI_CONCURRENCY_LIMIT = 10

# Per-call timeout in seconds. If Gemini doesn't respond in time,
# the call returns None and the service uses the fallback template.
_GEMINI_CALL_TIMEOUT_SECONDS = 15


# ── GeminiService ────────────────────────────────────────────────────

class GeminiService:
    """Singleton wrapper around the Google Generative AI SDK."""

    _instance: GeminiService | None = None

    def __init__(self, settings: Settings) -> None:
        self._model = settings.GEMINI_MODEL
        api_key = settings.gemini_api_key_resolved
        self._client: genai.Client | None = None
        # Bounded semaphore limits concurrent Gemini calls across all
        # in-flight requests, preventing threadpool saturation.
        self._semaphore = asyncio.Semaphore(_GEMINI_CONCURRENCY_LIMIT)
        if api_key:
            try:
                self._client = genai.Client(api_key=api_key)
                logger.info("Gemini client initialized (model=%s)", self._model)
            except Exception:
                logger.warning("Failed to initialize Gemini client — fallback mode active")
        else:
            logger.warning("No Gemini API key configured — fallback mode active")

    @classmethod
    def instance(cls) -> GeminiService:
        """Return a lazily-created singleton."""
        if cls._instance is None:
            cls._instance = cls(get_settings())
        return cls._instance

    # ── Public async API ─────────────────────────────────────────────

    async def generate_explanation(self, context: Mapping[str, Any]) -> str:
        """Generate a structured explanation (one Gemini call + fallback)."""
        prompt = (
            "You are an AI audit assistant. Return a structured explanation for judges.\n"
            "Use plain text and follow this exact format:\n"
            "Summary: <one-line summary>\n\n"
            "Key Reason:\n"
            "- <reason 1>\n"
            "- <reason 2>\n\n"
            "Risk: <Low|Medium|High>\n\n"
            "Recommendation:\n"
            "<one concise recommendation>\n\n"
            "Rules:\n"
            "- Keep Summary to exactly one line.\n"
            "- Provide 2 to 4 bullet points under Key Reason.\n"
            "- Mention threshold/location/profile sensitivity when present in context.\n"
            "- Do not output JSON or additional headings.\n\n"
            f"Context:\n{_context_to_json(context)}"
        )
        output = await self._call_once(
            system_instruction="Produce concise, structured, judge-friendly explanations. Avoid legal claims and speculation.",
            prompt=prompt,
            max_output_tokens=400,
            temperature=0.2,
        )
        if output and _looks_structured_explanation(output):
            return output
        return _fallback_explanation(context)

    async def generate_appeal(self, context: Mapping[str, Any]) -> str:
        """Generate a formal appeal draft (one Gemini call + fallback)."""
        prompt = (
            "Draft a formal appeal letter requesting manual review of an automated decision.\n"
            "Include: decision outcome, score, confidence zone, risk score, threshold sensitivity, instability/bias indicators, reason tags, "
            "and a polite request for reassessment.\n"
            "Use professional tone and concise language.\n\n"
            f"Context:\n{_context_to_json(context)}"
        )
        output = await self._call_once(
            system_instruction="You write concise professional appeals for AI-assisted decision reviews.",
            prompt=prompt,
            max_output_tokens=500,
            temperature=0.2,
        )
        return output if output is not None else _fallback_appeal(context)

    async def generate_explanation_request(self, context: Mapping[str, Any]) -> str:
        """Generate a formal right-to-explanation request letter (GDPR/DPDP-aligned)."""
        profile = context.get("original", {}).get("profile", {})
        name = str(profile.get("name", "the applicant"))
        domain = str(profile.get("domain", "this decision"))
        decision = context.get("original", {}).get("decision", "REJECT")
        prompt = (
            f"Write a formal Right-to-Explanation request letter for {name} regarding an "
            f"automated {domain} decision with outcome {decision}.\n"
            "The letter must request:\n"
            "1. Meaningful information about the automated decision-making logic used\n"
            "2. The main factors and their relative weights that influenced the outcome\n"
            "3. Disclosure of whether human oversight was applied\n"
            "4. The right to request human review of this specific decision\n"
            "5. The data categories used and their sources\n"
            "Use formal, professional language. Keep it under 250 words. No markdown.\n"
            f"Context:\n{_context_to_json(context)}"
        )
        output = await self._call_once(
            system_instruction="You draft formal right-to-explanation letters aligned with data protection regulations.",
            prompt=prompt,
            max_output_tokens=400,
            temperature=0.1,
        )
        return output if output is not None else _fallback_explanation_request(context)

    # ── Private helpers ──────────────────────────────────────────────

    async def _call_once(
        self,
        *,
        system_instruction: str,
        prompt: str,
        max_output_tokens: int,
        temperature: float,
    ) -> str | None:
        """Make a single Gemini generation call on a background thread.

        Acquires a bounded semaphore first to cap global concurrency and
        prevent threadpool exhaustion under burst traffic.
        """
        if self._client is None:
            return None

        async with self._semaphore:
            try:
                response = await asyncio.wait_for(
                    asyncio.to_thread(
                        self._client.models.generate_content,
                        model=self._model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            systemInstruction=system_instruction,
                            temperature=temperature,
                            maxOutputTokens=max_output_tokens,
                        ),
                    ),
                    timeout=_GEMINI_CALL_TIMEOUT_SECONDS,
                )
            except asyncio.TimeoutError:
                logger.warning("Gemini call timed out after %ds — using fallback", _GEMINI_CALL_TIMEOUT_SECONDS)
                return None
            except Exception as exc:
                logger.warning("Gemini API call failed — using fallback: %s", exc)
                return None

        text = getattr(response, "text", None)
        if not isinstance(text, str):
            return None

        cleaned = text.strip()
        return cleaned or None


# ── Module-level helpers (preserved from original) ───────────────────

def _context_to_json(context: Mapping[str, Any]) -> str:
    serialized = json.dumps(context, ensure_ascii=True, sort_keys=True, default=str, indent=2)
    if len(serialized) > _MAX_CONTEXT_CHARS:
        serialized = serialized[:_MAX_CONTEXT_CHARS] + "\n... [TRUNCATED — context exceeded budget]"
    return serialized


def _looks_structured_explanation(text: str) -> bool:
    return all(section in text for section in _EXPLANATION_REQUIRED_SECTIONS)


def _structured_recommendation(risk_level: str) -> str:
    normalized = risk_level.upper()
    if normalized == "HIGH":
        return "Prioritize human review before finalizing this decision."
    if normalized == "MEDIUM":
        return "Consider human review before final action."
    return "Decision can proceed with routine monitoring and audit logging."


def _collect_structured_reasons(context: Mapping[str, Any]) -> list[str]:
    analysis = context.get("analysis", {})
    instability = analysis.get("instability", {})
    bias = analysis.get("bias", {})
    reason_tags = context.get("decision_quality", {}).get("reason_tags", [])

    reasons: list[str] = []

    if int(instability.get("threshold_switch_count", 0)) > 0:
        reasons.append("Outcome changes with threshold.")
    if int(instability.get("variation_flip_count", 0)) > 0:
        reasons.append("Outcome changes with profile variations.")

    suspicious_patterns = bias.get("suspicious_patterns", [])
    if isinstance(suspicious_patterns, list):
        variation_names = {
            row.get("variation")
            for row in suspicious_patterns
            if isinstance(row, Mapping)
        }
        if "location_change" in variation_names:
            reasons.append("Sensitive to location variation.")
        if "gender_swap" in variation_names:
            reasons.append("Sensitive to demographic variation.")
        if "college_change" in variation_names:
            reasons.append("Sensitive to education-profile variation.")

    if bool(bias.get("has_bias_flags")):
        reasons.append("Counterfactual checks flagged bias-sensitive behavior.")

    if not reasons and isinstance(reason_tags, list):
        tag_reason_map = {
            "location_sensitive": "Sensitive to location variation.",
            "threshold_sensitive": "Outcome changes with threshold.",
            "profile_instability": "Outcome changes with profile variations.",
            "demographic_sensitive": "Sensitive to demographic variation.",
            "education_sensitive": "Sensitive to education-profile variation.",
            "score_instability": "Score is close to the decision boundary.",
            "bias_detected": "Bias-sensitive behavior was detected.",
        }
        for tag in reason_tags:
            mapped = tag_reason_map.get(str(tag))
            if mapped:
                reasons.append(mapped)

    if not reasons:
        reasons.append("No major instability or bias flags were detected.")

    return list(dict.fromkeys(reasons))


def _fallback_explanation(context: Mapping[str, Any]) -> str:
    original = context.get("original", {})
    analysis = context.get("analysis", {})
    decision_quality = context.get("decision_quality", {})
    instability = analysis.get("instability", {})

    decision = original.get("decision", "UNKNOWN")
    score = original.get("score", "N/A")
    confidence_zone = decision_quality.get("confidence_zone", "Unknown")
    risk = decision_quality.get("risk", {})
    risk_level = str(risk.get("level", "UNKNOWN"))
    risk_score = risk.get("score", "N/A")
    is_unstable = bool(instability.get("is_unstable"))

    # Human-readable verdict
    decision_word = "accepted" if str(decision).upper() == "ACCEPT" else "rejected"
    score_pct = f"{float(score) * 100:.0f}%" if isinstance(score, (int, float)) else score

    if confidence_zone == "Unstable" or is_unstable:
        summary = (
            f"Your application was {decision_word} with a score of {score_pct}, "
            f"but the decision is unstable — small changes to the evaluation criteria "
            f"could flip the outcome."
        )
    elif confidence_zone == "Borderline":
        summary = (
            f"Your application was {decision_word} with a score of {score_pct}. "
            f"This puts you in a borderline zone — the decision could easily go the other way."
        )
    else:
        summary = (
            f"Your application was {decision_word} with a score of {score_pct}. "
            f"The decision appears stable and consistent across different conditions."
        )

    reasons = _collect_structured_reasons(context)
    reason_lines = "\n".join(f"- {reason}" for reason in reasons[:4])
    recommendation = _structured_recommendation(risk_level)

    return (
        f"Summary: {summary}\n\n"
        "Key Drivers:\n"
        f"{reason_lines}\n\n"
        f"Risk: {risk_level.title()} ({risk_score}/100)\n\n"
        "Recommendation:\n"
        f"{recommendation}"
    )


def _fallback_appeal(context: Mapping[str, Any]) -> str:
    original = context.get("original", {})
    analysis = context.get("analysis", {})
    decision_quality = context.get("decision_quality", {})
    instability = analysis.get("instability", {})
    bias = analysis.get("bias", {})

    decision = original.get("decision", "UNKNOWN")
    score = original.get("score", "N/A")
    sensitivity = instability.get("sensitivity", "UNKNOWN")
    flags = bias.get("flag_count", 0)
    confidence_zone = decision_quality.get("confidence_zone", "Unknown")
    risk = decision_quality.get("risk", {})
    risk_score = risk.get("score", "N/A")
    risk_level = risk.get("level", "UNKNOWN")

    decision_word = "accepted" if str(decision).upper() == "ACCEPT" else "rejected"
    score_pct = f"{float(score) * 100:.0f}%" if isinstance(score, (int, float)) else score

    # Build concern list
    concerns: list[str] = []
    if str(sensitivity).upper() in ("HIGH", "MEDIUM"):
        concerns.append(
            "the decision is sensitive to threshold changes — "
            "a small shift in evaluation strictness would produce a different outcome"
        )
    if int(flags) > 0:
        concerns.append(
            f"the analysis detected {flags} potential fairness concern(s) "
            "when the same profile was tested with swapped demographic attributes"
        )
    if str(confidence_zone) in ("Unstable", "Borderline"):
        concerns.append(
            f"the confidence zone is classified as \"{confidence_zone}\", "
            "indicating the result may not be reliable"
        )

    concern_text = ""
    if concerns:
        formatted = "; ".join(concerns)
        concern_text = (
            f"\n\nAn independent analysis of this decision has raised the following concerns: "
            f"{formatted}. The overall risk score is {risk_score} out of 100 ({risk_level})."
        )

    return (
        "Subject: Request for Review of Automated Decision\n\n"
        "Dear Review Committee,\n\n"
        "I am writing to respectfully request a formal review of an automated decision "
        f"that affected my application. My application was {decision_word} with a score "
        f"of {score_pct}."
        f"{concern_text}\n\n"
        "Based on these findings, I believe the decision warrants human review to ensure "
        "it was made fairly and consistently. I kindly request a reassessment.\n\n"
        "Thank you for your time and consideration.\n"
    )


def _fallback_explanation_request(context: Mapping[str, Any]) -> str:
    original = context.get("original", {})
    profile = original.get("profile", {})
    name = str(profile.get("name", "the applicant"))
    domain = str(profile.get("domain", "automated system"))
    decision = str(original.get("decision", "REJECT"))
    decision_quality = context.get("decision_quality", {})
    risk = decision_quality.get("risk", {})
    risk_level = str(risk.get("level", "Unknown"))

    return (
        f"Subject: Right to Explanation — Automated {domain.title()} Decision\n\n"
        "Dear Sir or Madam,\n\n"
        f"I am writing to formally request a meaningful explanation of the automated decision "
        f"made regarding my {domain} application, which resulted in a {decision} outcome.\n\n"
        "Under applicable data protection regulations, I am entitled to:\n\n"
        "1. A clear explanation of the logic and criteria applied by the automated system\n"
        "2. Disclosure of the main factors and their relative weights that led to this outcome\n"
        "3. Information on whether any human oversight was applied before finalizing the decision\n"
        "4. The right to contest this decision and request human review\n"
        "5. Details of the personal data categories used and their sources\n\n"
        f"The independent audit of this decision flagged it as {risk_level} risk. "
        "I respectfully request a formal response within 30 days.\n\n"
        f"Applicant: {name}\n\n"
        "Thank you for your attention to this matter.\n"
    )

