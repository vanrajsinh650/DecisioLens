"""
Pydantic response models for the audit API.

These models enforce the exact JSON contract the frontend expects,
providing compile-time documentation and runtime validation of every
outgoing response.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


Decision = Literal["ACCEPT", "REJECT"]


class OriginalDecision(BaseModel):
    """Baseline scoring result for the submitted profile."""

    score: float = Field(description="Probability score between 0 and 1")
    decision: Decision = Field(description="Binary ACCEPT / REJECT outcome")
    threshold: float = Field(description="Decision threshold used for the audit")
    confidence_zone: str | None = Field(default=None, description="Distance-to-boundary confidence band")


class ThresholdAnalysisItem(BaseModel):
    """One row from the threshold-sensitivity sweep."""

    threshold: float
    decision: Decision


class VariationResult(BaseModel):
    """Outcome of a single counterfactual variation.

    Issue #7 fix: Now includes label, changed, and profile fields
    to match the frontend VariationResult interface exactly.
    """

    variation: str = Field(description="Variation key, e.g. gender_swap")
    label: str = Field(description="Human-readable label for the variation")
    score: float
    decision: Decision
    changed: bool = Field(description="Whether the decision differs from baseline")
    profile: dict[str, str | int | float | bool | None] | None = Field(
        default=None,
        description="The modified profile fields for this variation",
    )


class StabilityZone(BaseModel):
    """One range band in the decision stability map."""

    model_config = {"extra": "ignore"}

    start: float
    end: float
    label: str = Field(description="ACCEPT or REJECT")
    # Issue #5 fix: non-overlapping boundary semantics.
    # inclusive_start/end encode which endpoint the band owns so the boundary
    # value cannot simultaneously belong to both ACCEPT and REJECT.
    inclusive_start: bool = Field(default=True)
    inclusive_end: bool = Field(default=True)


class StabilityZoneResult(BaseModel):
    """Full stability zone output — range bands + human summary."""

    zones: list[StabilityZone]
    summary: str


class ImpactItem(BaseModel):
    """Score impact from a single counterfactual variable change."""

    variable: str
    delta: float
    direction: Literal["positive", "negative", "none"]
    decision_changed: bool


class RiskAssessment(BaseModel):
    """Normalized risk score with 3-tier lab label and reasons."""

    score: int = Field(ge=0, le=100)
    level: Literal["SAFE", "BORDERLINE", "HIGH_RISK"]
    reasons: list[str] = Field(default_factory=list)


class Insights(BaseModel):
    """Aggregated flags for the frontend trust-verdict banner."""

    instability: bool
    bias_detected: bool
    confidence_zone: str
    risk_score: int = Field(ge=0, le=100)
    risk_level: Literal["SAFE", "BORDERLINE", "HIGH_RISK"]
    reason_tags: list[str]


class AIJuryView(BaseModel):
    """Simulated multi-agent perspective on the decision."""

    auditor: str
    challenger: str
    judge: str


class RecourseItem(BaseModel):
    """One actionable recourse suggestion."""

    action: str = Field(description="What the person can do")
    impact: str = Field(description="What effect that action would have")


class FactorImportanceItem(BaseModel):
    """Normalized contribution of a single decision factor."""

    factor: str
    weight: float = Field(description="Relative importance of this factor (0-1)")
    contribution: float = Field(description="Actual impact on final score")


class HumanReview(BaseModel):
    """Human oversight recommendation based on risk analysis."""

    level: Literal["REQUIRED", "RECOMMENDED", "NOT_REQUIRED"]
    reason: str = Field(description="Plain-language justification")


class AuditResponse(BaseModel):
    """
    Complete audit result returned by ``POST /audit/run``.

    Shape matches the frontend ``AuditResult`` TypeScript interface.
    """

    original: OriginalDecision
    threshold_analysis: list[ThresholdAnalysisItem]
    variations: list[VariationResult]
    stability_zone: StabilityZoneResult
    impact_analysis: list[ImpactItem]
    confidence_zone: str
    risk: RiskAssessment
    reason_tags: list[str]
    ai_jury_view: AIJuryView
    insights: Insights
    explanation: str
    appeal: str
    explanation_request: str
    recourse: list[RecourseItem]
    human_review: HumanReview
    factor_importance: list[FactorImportanceItem] = Field(default_factory=list)
