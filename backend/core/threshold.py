from __future__ import annotations

from typing import Literal


Decision = Literal["ACCEPT", "REJECT"]


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
