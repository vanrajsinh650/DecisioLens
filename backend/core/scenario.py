from __future__ import annotations

from typing import Any, Mapping, Sequence

from core.model import compute_score_from_validated
from core.threshold import Decision, make_decision
from schemas.request import validate_profile


ALTERNATE_LOCATIONS: tuple[str, ...] = (
    "Bengaluru",
    "Mumbai",
    "Delhi",
    "Pune",
    "Hyderabad",
)
ALTERNATE_COLLEGES: tuple[str, ...] = (
    "IIT Bombay",
    "IIT Delhi",
    "BITS Pilani",
    "NIT Trichy",
    "IISc Bengaluru",
)
GENDER_SWAP_MAP: dict[str, str] = {
    "male": "female",
    "female": "male",
    "man": "woman",
    "woman": "man",
    "m": "f",
    "f": "m",
}


def _require_text_field(profile: Mapping[str, Any], field_name: str) -> str:
    value = profile.get(field_name)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} is required for variation testing")
    return value


def _swap_gender(gender: str) -> str:
    return GENDER_SWAP_MAP.get(gender.lower(), "female")


def _rotate_value(current: str, options: tuple[str, ...]) -> str:
    if not options:
        raise ValueError("options cannot be empty")

    normalized_current = current.strip().lower()
    lowered_options = [item.lower() for item in options]
    if normalized_current in lowered_options:
        index = lowered_options.index(normalized_current)
        return options[(index + 1) % len(options)]

    return options[0]


def generate_variations(profile: Mapping[str, Any]) -> list[dict[str, Any]]:
    """
    Create controlled counterfactual profile variations for bias checks.
    """

    baseline_profile = validate_profile(profile)

    gender = _require_text_field(baseline_profile, "gender")
    location = _require_text_field(baseline_profile, "location")
    college = _require_text_field(baseline_profile, "college")

    return [
        {"variation": "baseline", "profile": dict(baseline_profile)},
        {
            "variation": "gender_swap",
            "profile": {**baseline_profile, "gender": _swap_gender(gender)},
        },
        {
            "variation": "location_change",
            "profile": {**baseline_profile, "location": _rotate_value(location, ALTERNATE_LOCATIONS)},
        },
        {
            "variation": "college_change",
            "profile": {**baseline_profile, "college": _rotate_value(college, ALTERNATE_COLLEGES)},
        },
    ]


def evaluate_variations(
    variations: Sequence[Mapping[str, Any]], threshold: float
) -> dict[str, dict[str, Any]]:
    """
    Score and decide each generated variation using shared core logic.
    """

    if not 0.0 <= threshold <= 1.0:
        raise ValueError("threshold must be between 0 and 1")

    results: dict[str, dict[str, Any]] = {}
    for variation in variations:
        name = variation.get("variation")
        candidate_profile = variation.get("profile")

        if not isinstance(name, str) or not name.strip():
            raise ValueError("variation name must be a non-empty string")
        if not isinstance(candidate_profile, Mapping):
            raise ValueError("variation profile must be a mapping")

        normalized_profile = validate_profile(candidate_profile)
        score = compute_score_from_validated(normalized_profile)
        decision: Decision = make_decision(score=score, threshold=threshold)
        results[name] = {
            "score": score,
            "decision": decision,
            "profile": normalized_profile,
        }

    return results
