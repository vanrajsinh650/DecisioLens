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


def _fallback_explanation(context: Mapping[str, Any]) -> str:
    original = context.get("original", {})
    analysis = context.get("analysis", {})
    instability = analysis.get("instability", {})
    bias = analysis.get("bias", {})

    decision = original.get("decision", "UNKNOWN")
    score = original.get("score", "N/A")
    sensitivity = instability.get("sensitivity", "UNKNOWN")
    bias_flags = bias.get("flag_count", 0)

    return (
        f"Decision result: {decision} (score={score}). "
        f"Threshold sensitivity: {sensitivity}. "
        f"Bias flags detected: {bias_flags}. "
        "This explanation was generated using local fallback because Gemini output was unavailable."
    )


def _fallback_appeal(context: Mapping[str, Any]) -> str:
    original = context.get("original", {})
    analysis = context.get("analysis", {})
    instability = analysis.get("instability", {})
    bias = analysis.get("bias", {})

    decision = original.get("decision", "UNKNOWN")
    score = original.get("score", "N/A")
    sensitivity = instability.get("sensitivity", "UNKNOWN")
    flags = bias.get("flag_count", 0)

    return (
        "Subject: Request for Review of Automated Decision\n\n"
        "Dear Review Committee,\n\n"
        "I respectfully request a formal review of my automated evaluation result. "
        f"The current outcome is {decision} with score {score}. "
        f"The analysis indicates threshold sensitivity level {sensitivity} "
        f"and {flags} potential bias-related flag(s). "
        "Given these indicators, I request a manual reassessment to confirm fairness and consistency.\n\n"
        "Thank you for your time and consideration.\n"
    )


def generate_explanation(context: Mapping[str, Any]) -> str:
    """
    Convert structured pipeline context into a human-readable explanation.

    Performs exactly one Gemini generation call.
    """

    prompt = (
        "You are an AI audit assistant. Explain the decision result clearly to a non-technical user.\n"
        "Focus on: score, decision, threshold behavior, instability, and bias flags.\n"
        "Keep it factual, concise, and easy to understand.\n\n"
        f"Context:\n{_context_to_json(context)}"
    )
    output = _call_gemini_once(
        system_instruction=(
            "Write plain, transparent decision explanations. Avoid legal claims and speculation."
        ),
        prompt=prompt,
        max_output_tokens=400,
        temperature=0.2,
    )
    return output if output is not None else _fallback_explanation(context)


def generate_appeal(context: Mapping[str, Any]) -> str:
    """
    Generate a formal appeal draft from structured pipeline context.

    Performs exactly one Gemini generation call.
    """

    prompt = (
        "Draft a formal appeal letter requesting manual review of an automated decision.\n"
        "Include: decision outcome, score, threshold sensitivity, instability/bias indicators, "
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
