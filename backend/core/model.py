from __future__ import annotations

import math
from typing import Any, Mapping

from schemas.request import validate_profile


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(value, upper))


def compute_score(profile: Mapping[str, Any]) -> float:
    """
    Convert an input profile into a deterministic probability score (0.0 to 1.0).

    Steps:
    1) validate + normalize profile payload
    2) transform features to [0, 1]
    3) apply weighted deterministic rules
    """

    normalized = validate_profile(profile)

    score_component = normalized["score"] / 100.0

    # Experience contributes with diminishing returns to avoid overpowering score.
    experience_component = 1.0 - math.exp(-normalized["experience"] / 12.0)

    weighted_probability = (0.75 * score_component) + (0.25 * experience_component)
    return round(_clamp(weighted_probability, 0.0, 1.0), 6)
