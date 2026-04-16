from __future__ import annotations

from typing import Literal


Decision = Literal["ACCEPT", "REJECT"]
SENSITIVITY_THRESHOLDS: tuple[float, ...] = (
    0.1,
    0.2,
    0.3,
    0.4,
    0.5,
    0.6,
    0.7,
    0.8,
    0.9,
)


def make_decision(score: float, threshold: float) -> Decision:
    """
    Convert a probability score into a final binary decision.

    Rule:
    - ACCEPT when score >= threshold
    - REJECT otherwise
    """

    if not 0.0 <= score <= 1.0:
        raise ValueError("score must be between 0 and 1")
    if not 0.0 <= threshold <= 1.0:
        raise ValueError("threshold must be between 0 and 1")

    return "ACCEPT" if score >= threshold else "REJECT"


def analyze_threshold_sensitivity(score: float) -> dict[float, Decision]:
    """
    Evaluate how one score behaves across multiple threshold cutoffs.

    Returns a deterministic threshold -> decision map.
    """

    if not 0.0 <= score <= 1.0:
        raise ValueError("score must be between 0 and 1")

    return {
        threshold: make_decision(score=score, threshold=threshold)
        for threshold in SENSITIVITY_THRESHOLDS
    }
