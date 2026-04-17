from __future__ import annotations

from typing import Any, Mapping

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ai.gemini import generate_appeal, generate_explanation
from core.analysis import (
    build_reason_tags,
    classify_confidence,
    compute_risk_score,
    detect_bias_patterns,
    detect_instability,
)
from core.model import compute_score_from_validated
from core.scenario import evaluate_variations, generate_variations
from core.threshold import analyze_threshold_sensitivity, make_decision
from schemas.request import validate_profile


router = APIRouter(prefix="/audit", tags=["audit"])


class AuditRequest(BaseModel):
    profile: dict[str, Any]
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)


def run_audit(profile: Mapping[str, Any], threshold: float = 0.5) -> dict[str, Any]:
    """
    Run the complete audit pipeline and return a structured API response.
    """

    if not 0.0 <= threshold <= 1.0:
        raise ValueError("threshold must be between 0 and 1")

    validated_profile = validate_profile(profile)
    original_score = compute_score_from_validated(validated_profile)
    original_decision = make_decision(score=original_score, threshold=threshold)
    original_result = {"score": original_score, "decision": original_decision}

    threshold_results = analyze_threshold_sensitivity(original_score)
    threshold_analysis = [
        {"threshold": threshold_value, "decision": decision}
        for threshold_value, decision in threshold_results.items()
    ]

    generated_variations = generate_variations(validated_profile)
    counterfactual_variations = [
        item for item in generated_variations if item.get("variation") != "baseline"
    ]
    counterfactual_results = evaluate_variations(counterfactual_variations, threshold)

    all_variation_results: dict[str, dict[str, Any]] = {
        "baseline": {**original_result, "profile": dict(validated_profile)},
        **counterfactual_results,
    }

    instability_report = detect_instability(
        original=all_variation_results["baseline"],
        variations=all_variation_results,
        threshold_results=threshold_results,
    )
    bias_report = detect_bias_patterns(
        original=all_variation_results["baseline"],
        variations=all_variation_results,
    )
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

    variation_output = [
        {
            "variation": variation["variation"],
            "score": all_variation_results[variation["variation"]]["score"],
            "decision": all_variation_results[variation["variation"]]["decision"],
        }
        for variation in generated_variations
    ]

    context = {
        "original": {
            **original_result,
            "profile": dict(validated_profile),
        },
        "threshold": threshold,
        "threshold_analysis": threshold_analysis,
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
    }
    explanation = generate_explanation(context)
    appeal = generate_appeal(context)

    return {
        "original": original_result,
        "threshold_analysis": threshold_analysis,
        "variations": variation_output,
        "confidence_zone": confidence_zone,
        "risk": risk_assessment,
        "reason_tags": reason_tags,
        "insights": {
            "instability": bool(instability_report.get("is_unstable")),
            "bias_detected": bool(bias_report.get("has_bias_flags")),
            "confidence_zone": confidence_zone,
            "risk_score": risk_assessment["score"],
            "risk_level": risk_assessment["level"],
            "reason_tags": reason_tags,
        },
        "explanation": explanation,
        "appeal": appeal,
    }


@router.post("/run")
def run_audit_endpoint(request: AuditRequest) -> dict[str, Any]:
    try:
        return run_audit(request.profile, threshold=request.threshold)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
