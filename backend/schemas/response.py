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


class ThresholdAnalysisItem(BaseModel):
    """One row from the threshold-sensitivity sweep."""

    threshold: float
    decision: Decision


class VariationResult(BaseModel):
    """Outcome of a single counterfactual variation."""

    variation: str = Field(description="Variation label, e.g. gender_swap")
    score: float
    decision: Decision


class RiskAssessment(BaseModel):
    """Normalized risk score with human-readable band label."""

    score: int = Field(ge=0, le=100)
    level: str = Field(description="Low / Medium / High")


class Insights(BaseModel):
    """Aggregated flags for the frontend trust-verdict banner."""

    instability: bool
    bias_detected: bool
    confidence_zone: str
    risk_score: int = Field(ge=0, le=100)
    risk_level: str
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


class HumanReview(BaseModel):
    """Human oversight recommendation based on risk analysis."""

    level: str = Field(description="REQUIRED / RECOMMENDED / NOT_REQUIRED")
    reason: str = Field(description="Plain-language justification")


class AuditResponse(BaseModel):
    """
    Complete audit result returned by ``POST /audit/run``.

    Shape matches the frontend ``AuditResult`` TypeScript interface so
    no client-side changes are required.
    """

    original: OriginalDecision
    threshold_analysis: list[ThresholdAnalysisItem]
    variations: list[VariationResult]
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

