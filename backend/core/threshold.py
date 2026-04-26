from __future__ import annotations

from typing import Literal


Decision = Literal["ACCEPT", "REJECT"]
_BASE_SENSITIVITY_THRESHOLDS: tuple[float, ...] = (
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

# Local neighborhood radius for instability detection.
# Only threshold switches within this distance of the active threshold
# are counted — global sweep extremes do not inflate switch counts.
LOCAL_INSTABILITY_RADIUS: float = 0.10


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


def analyze_threshold_sensitivity(
    score: float,
    user_threshold: float | None = None,
) -> dict[float, Decision]:
    """
    Evaluate how one score behaves across multiple threshold cutoffs.

    Always includes 0.0 and 1.0 endpoints.  When *user_threshold* is
    provided it is added to the sweep so configurations near the
    extremes (e.g. 0.95) are never missed.

    Returns a deterministic threshold → decision map sorted by threshold.
    """

    if not 0.0 <= score <= 1.0:
        raise ValueError("score must be between 0 and 1")

    # Build a unique, sorted set of thresholds
    thresholds: set[float] = {0.0, 1.0}
    thresholds.update(_BASE_SENSITIVITY_THRESHOLDS)
    if user_threshold is not None:
        if not 0.0 <= user_threshold <= 1.0:
            raise ValueError("user_threshold must be between 0 and 1")
        thresholds.add(round(user_threshold, 6))

    return {
        threshold: make_decision(score=score, threshold=threshold)
        for threshold in sorted(thresholds)
    }


def count_local_threshold_switches(
    threshold_results: dict[float, Decision],
    user_threshold: float,
    radius: float = LOCAL_INSTABILITY_RADIUS,
) -> int:
    """
    Count decision switches only within a local neighborhood of the
    active threshold.

    Only considering switches within ±radius prevents the global [0,1]
    sweep from marking nearly every non-extreme score as unstable.
    """
    local = sorted(
        (t, d) for t, d in threshold_results.items()
        if abs(t - user_threshold) <= radius
    )
    switches = 0
    prev: Decision | None = None
    for _, decision in local:
        if prev is not None and decision != prev:
            switches += 1
        prev = decision
    return switches
