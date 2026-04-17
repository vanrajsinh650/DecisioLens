from __future__ import annotations

import json
import os
from typing import Any, Mapping

from google import genai
from google.genai import types


DEFAULT_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def _context_to_json(context: Mapping[str, Any]) -> str:
    return json.dumps(context, ensure_ascii=True, sort_keys=True, default=str, indent=2)


def _build_client() -> genai.Client | None:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None
    return genai.Client(api_key=api_key)


def _call_gemini_once(
    *,
    system_instruction: str,
    prompt: str,
    max_output_tokens: int,
    temperature: float = 0.2,
) -> str | None:
    client = _build_client()
    if client is None:
        return None

    try:
        response = client.models.generate_content(
            model=DEFAULT_GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                systemInstruction=system_instruction,
                temperature=temperature,
                maxOutputTokens=max_output_tokens,
            ),
        )
    except Exception:
        return None

    text = getattr(response, "text", None)
    if not isinstance(text, str):
        return None

    cleaned = text.strip()
    return cleaned or None


def _structured_recommendation(risk_level: str) -> str:
    normalized = risk_level.upper()
    if normalized == "HIGH":
        return "Prioritize human review before finalizing this decision."
    if normalized == "MEDIUM":
        return "Consider human review before final action."
    return "Decision can proceed with routine monitoring and audit logging."


def _looks_structured_explanation(text: str) -> bool:
    required_sections = ("Summary:", "Key Reason:", "Risk:", "Recommendation:")
    return all(section in text for section in required_sections)


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

    if confidence_zone == "Unstable" or is_unstable:
        summary = f"Decision is unstable ({decision}, score={score})."
    elif confidence_zone == "Borderline":
        summary = f"Decision is borderline and sensitive ({decision}, score={score})."
    else:
        summary = f"Decision is in a high-confidence zone ({decision}, score={score})."

    reasons = _collect_structured_reasons(context)
    reason_lines = "\n".join(f"- {reason}" for reason in reasons[:4])
    recommendation = _structured_recommendation(risk_level)

    return (
        f"Summary: {summary}\n\n"
        "Key Reason:\n"
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
    reason_tags = decision_quality.get("reason_tags", [])

    return (
        "Subject: Request for Review of Automated Decision\n\n"
        "Dear Review Committee,\n\n"
        "I respectfully request a formal review of my automated evaluation result. "
        f"The current outcome is {decision} with score {score}. "
        f"The confidence zone is {confidence_zone}. "
        f"The computed risk score is {risk_score} ({risk_level}). "
        f"The analysis indicates threshold sensitivity level {sensitivity} "
        f"and {flags} potential bias-related flag(s). "
        f"Reason tags include {reason_tags}. "
        "Given these indicators, I request a manual reassessment to confirm fairness and consistency.\n\n"
        "Thank you for your time and consideration.\n"
    )


def generate_explanation(context: Mapping[str, Any]) -> str:
    """
    Convert structured pipeline context into a human-readable explanation.

    Performs exactly one Gemini generation call.
    """

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
    output = _call_gemini_once(
        system_instruction=(
            "Produce concise, structured, judge-friendly explanations. Avoid legal claims and speculation."
        ),
        prompt=prompt,
        max_output_tokens=400,
        temperature=0.2,
    )
    if output is None:
        return _fallback_explanation(context)
    if not _looks_structured_explanation(output):
        return _fallback_explanation(context)
    return output


def generate_appeal(context: Mapping[str, Any]) -> str:
    """
    Generate a formal appeal draft from structured pipeline context.

    Performs exactly one Gemini generation call.
    """

    prompt = (
        "Draft a formal appeal letter requesting manual review of an automated decision.\n"
        "Include: decision outcome, score, confidence zone, risk score, threshold sensitivity, instability/bias indicators, reason tags, "
        "and a polite request for reassessment.\n"
        "Use professional tone and concise language.\n\n"
        f"Context:\n{_context_to_json(context)}"
    )
    output = _call_gemini_once(
        system_instruction=(
            "You write concise professional appeals for AI-assisted decision reviews."
        ),
        prompt=prompt,
        max_output_tokens=500,
        temperature=0.2,
    )
    return output if output is not None else _fallback_appeal(context)
