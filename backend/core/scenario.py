"""
Domain-aware counterfactual variation generator.

Each domain has its own set of controlled swaps — the fields that are
most likely to cause demographic bias in real-world AI systems.
When a variation is scored, a different outcome proves the system is
sensitive to that demographic variable.
"""

from __future__ import annotations

from typing import Any, Mapping, Sequence

from core.model import compute_score_from_validated
from core.threshold import Decision, make_decision
from schemas.request import validate_profile


# ── Variation catalogues per domain ──────────────────────────────────

_HIRING_LOCATIONS = ("Bengaluru", "Mumbai", "Delhi", "Pune", "Hyderabad")
_HIRING_COLLEGES = ("IIT Bombay", "IIT Delhi", "BITS Pilani", "NIT Trichy", "IISc Bengaluru")
_LENDING_LOCATIONS = ("Mumbai", "Pune", "Delhi", "Bengaluru", "Chennai")
_EDUCATION_LOCATIONS = ("Bengaluru", "Hyderabad", "Mumbai", "Delhi", "Pune")
_INSURANCE_CITY_TIERS = ("Tier 1", "Tier 2", "Tier 3")
_WELFARE_STATE_TIERS = ("Metro State", "Developed State", "Developing State", "Remote Region")
_WELFARE_CATEGORIES = ("General", "OBC", "SC", "ST", "EWS")

_GENDER_SWAP_MAP: dict[str, str] = {
    "male": "female", "female": "male",
    "man": "woman", "woman": "man",
    "m": "f", "f": "m",
}


def _swap_gender(gender: str) -> str:
    return _GENDER_SWAP_MAP.get(gender.lower(), "female")


def _rotate(current: str, options: tuple[str, ...]) -> str:
    if not options:
        return current
    low = current.strip().lower()
    lowered = [o.lower() for o in options]
    if low in lowered:
        idx = lowered.index(low)
        return options[(idx + 1) % len(options)]
    return options[0]


# ── Domain-specific variation generators ─────────────────────────────

def _variations_hiring(base: dict[str, Any]) -> list[dict[str, Any]]:
    gender = str(base.get("gender") or "male")
    location = str(base.get("location") or "Bengaluru")
    college = str(base.get("college") or "Tier 1")
    return [
        {"variation": "baseline", "profile": dict(base)},
        {"variation": "gender_swap",
         "profile": {**base, "gender": _swap_gender(gender)}},
        {"variation": "location_change",
         "profile": {**base, "location": _rotate(location, _HIRING_LOCATIONS)}},
        {"variation": "college_change",
         "profile": {**base, "college": _rotate(college, _HIRING_COLLEGES)}},
    ]


def _variations_lending(base: dict[str, Any]) -> list[dict[str, Any]]:
    gender = str(base.get("gender") or "male")
    location = str(base.get("location") or "Mumbai")
    employment = str(base.get("employment_type") or "Salaried")
    employment_opts = ("Salaried", "Self-Employed", "Freelancer")
    return [
        {"variation": "baseline", "profile": dict(base)},
        {"variation": "gender_swap",
         "profile": {**base, "gender": _swap_gender(gender)}},
        {"variation": "location_change",
         "profile": {**base, "location": _rotate(location, _LENDING_LOCATIONS)}},
        {"variation": "employment_change",
         "profile": {**base, "employment_type": _rotate(employment, employment_opts)}},
    ]


def _variations_education(base: dict[str, Any]) -> list[dict[str, Any]]:
    gender = str(base.get("gender") or "female")
    location = str(base.get("location") or "Bengaluru")
    category = str(base.get("category") or "General")
    category_opts = ("General", "OBC", "SC", "ST", "EWS")
    return [
        {"variation": "baseline", "profile": dict(base)},
        {"variation": "gender_swap",
         "profile": {**base, "gender": _swap_gender(gender)}},
        {"variation": "location_change",
         "profile": {**base, "location": _rotate(location, _EDUCATION_LOCATIONS)}},
        {"variation": "category_change",
         "profile": {**base, "category": _rotate(category, category_opts)}},
    ]


def _variations_insurance(base: dict[str, Any]) -> list[dict[str, Any]]:
    gender = str(base.get("gender") or "female")
    city_tier = str(base.get("city_tier") or "Tier 1")
    age = float(base.get("age") or 40)
    # Age group swap: if <55 → simulate senior, if >=55 → simulate younger
    alt_age = 67.0 if age < 55 else 35.0
    return [
        {"variation": "baseline", "profile": dict(base)},
        {"variation": "gender_swap",
         "profile": {**base, "gender": _swap_gender(gender)}},
        {"variation": "location_change",
         "profile": {**base, "city_tier": _rotate(city_tier, _INSURANCE_CITY_TIERS)}},
        {"variation": "age_change",
         "profile": {**base, "age": alt_age}},
    ]


def _variations_welfare(base: dict[str, Any]) -> list[dict[str, Any]]:
    gender = str(base.get("gender") or "female")
    state_tier = str(base.get("state_tier") or "Developed State")
    category = str(base.get("category") or "General")
    return [
        {"variation": "baseline", "profile": dict(base)},
        {"variation": "gender_swap",
         "profile": {**base, "gender": _swap_gender(gender)}},
        {"variation": "location_change",
         "profile": {**base, "state_tier": _rotate(state_tier, _WELFARE_STATE_TIERS)}},
        {"variation": "category_change",
         "profile": {**base, "category": _rotate(category, _WELFARE_CATEGORIES)}},
    ]


_DOMAIN_VARIATION_GENERATORS = {
    "hiring": _variations_hiring,
    "lending": _variations_lending,
    "education": _variations_education,
    "insurance": _variations_insurance,
    "welfare": _variations_welfare,
}


# ── Public API ────────────────────────────────────────────────────────

def generate_variations(profile: Mapping[str, Any]) -> list[dict[str, Any]]:
    """
    Create controlled counterfactual profile variations for bias checks.

    Dispatches to the correct domain-specific generator.
    """
    base = validate_profile(profile)
    domain = str(base.get("domain") or "hiring").lower()
    generator = _DOMAIN_VARIATION_GENERATORS.get(domain, _variations_hiring)
    return generator(base)


def evaluate_variations(
    variations: Sequence[Mapping[str, Any]], threshold: float
) -> dict[str, dict[str, Any]]:
    """
    Score and decide each generated variation using domain-specific scoring.
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
