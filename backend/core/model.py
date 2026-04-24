"""
Multi-domain deterministic scoring engine.

Each domain has its own scoring formula where demographic variables
(gender, location, category, etc.) **do** influence the score — making
counterfactual bias detection meaningful rather than theatrical.

All scores are in [0.0, 1.0].
"""

from __future__ import annotations

import math
from typing import Any, Mapping

from schemas.request import validate_profile


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(value, upper))


# ── Hiring ────────────────────────────────────────────────────────────

def _score_hiring(profile: Mapping[str, Any]) -> float:
    """
    Hiring score: skills + experience + small demographic modifiers.

    Demographic sensitivity is intentionally introduced so that
    counterfactual testing can detect location/gender/college bias.
    """
    raw_score = float(profile.get("score") or 50)
    raw_exp = float(profile.get("experience") or 0)

    skill_component = raw_score / 100.0
    exp_component = 1.0 - math.exp(-raw_exp / 12.0)

    base = (0.72 * skill_component) + (0.22 * exp_component)

    # Demographic modifiers — simulate systemic bias
    gender = str(profile.get("gender") or "").lower()
    location = str(profile.get("location") or "").lower()
    college = str(profile.get("college") or "").lower()

    gender_effect = -0.03 if gender in ("female", "f") else 0.0
    location_penalty = (
        -0.04 if location in ("nagpur", "jaipur", "lucknow", "patna", "bhopal") else 0.0
    )
    college_penalty = (
        -0.05 if "tier 3" in college
        else -0.02 if "tier 2" in college
        else 0.0
    )

    return round(_clamp(base + gender_effect + location_penalty + college_penalty, 0.0, 1.0), 6)


# ── Lending ───────────────────────────────────────────────────────────

def _score_lending(profile: Mapping[str, Any]) -> float:
    """
    Lending score: credit score + income-to-loan ratio + employment type.

    Freelancers and people from certain cities get a penalty,
    making the counterfactual employment-type and city swap meaningful.
    """
    credit = float(profile.get("credit_score") or 600)
    income = float(profile.get("income") or 5)
    loan = float(profile.get("loan_amount") or 10)
    employment = str(profile.get("employment_type") or "").lower()
    gender = str(profile.get("gender") or "").lower()
    location = str(profile.get("location") or "").lower()

    credit_component = _clamp((credit - 300) / 600.0, 0.0, 1.0)
    ratio = income / max(loan, 1)
    ratio_component = _clamp(ratio / 5.0, 0.0, 1.0)

    base = (0.60 * credit_component) + (0.30 * ratio_component)

    # Employment type penalty
    employment_effect = (
        -0.06 if "freelan" in employment
        else -0.03 if "self" in employment
        else 0.0
    )
    gender_effect = -0.03 if gender in ("female", "f") else 0.0
    location_penalty = (
        -0.04 if location in ("rural", "remote", "village", "small town") else 0.0
    )

    return round(_clamp(base + employment_effect + gender_effect + location_penalty, 0.0, 1.0), 6)


# ── Education ─────────────────────────────────────────────────────────

def _score_education(profile: Mapping[str, Any]) -> float:
    """
    Education score: entrance score + Class 12 % + category and income modifiers.

    Category and income-band affect the score to simulate private
    institution algorithmic bias against reserved/low-income applicants.
    """
    entrance = float(profile.get("score") or 50)
    grade_12 = float(profile.get("grade_12") or 50)
    category = str(profile.get("category") or "General").upper()
    income_band = str(profile.get("income_band") or "Middle").lower()
    gender = str(profile.get("gender") or "").lower()
    location = str(profile.get("location") or "").lower()

    entrance_component = entrance / 100.0
    grade_component = grade_12 / 100.0
    base = (0.65 * entrance_component) + (0.28 * grade_component)

    # Category penalty (simulates private university bias)
    category_penalty = (
        -0.06 if category == "ST"
        else -0.05 if category == "SC"
        else -0.03 if category in ("OBC", "EWS")
        else 0.0
    )
    income_penalty = -0.04 if income_band == "low" else 0.0
    gender_effect = -0.02 if gender in ("female", "f") else 0.0
    location_penalty = (
        -0.03 if location in ("rural", "village", "remote", "small town") else 0.0
    )

    return round(_clamp(base + category_penalty + income_penalty + gender_effect + location_penalty, 0.0, 1.0), 6)


# ── Insurance ─────────────────────────────────────────────────────────

def _score_insurance(profile: Mapping[str, Any]) -> float:
    """
    Insurance claim approval score: policy tenure + claim ratio + health risk.

    Pre-existing conditions, age, and city tier affect the score,
    simulating the systematic disadvantage faced by older or chronically
    ill patients in algorithmic claim processing.
    """
    claim = float(profile.get("claim_amount") or 2)
    tenure = float(profile.get("policy_tenure") or 1)
    age = float(profile.get("age") or 40)
    city_tier = str(profile.get("city_tier") or "Tier 1").lower()
    pre_existing = str(profile.get("pre_existing") or "None").lower()
    gender = str(profile.get("gender") or "").lower()

    # Long tenure = trust; low claim = easier approval
    tenure_component = _clamp(tenure / 10.0, 0.0, 1.0)
    claim_component = _clamp(1.0 - (claim / 50.0), 0.0, 1.0)  # lower claim → better
    base = (0.50 * tenure_component) + (0.40 * claim_component)

    # Age penalty — older patients face higher algorithmic rejection
    age_penalty = (
        -0.08 if age >= 65
        else -0.05 if age >= 55
        else -0.02 if age >= 45
        else 0.0
    )
    # Pre-existing condition penalty
    condition_penalty = (
        -0.10 if "both" in pre_existing
        else -0.06 if pre_existing in ("diabetes", "hypertension")
        else 0.0
    )
    # City tier penalty (rural = less access = higher rejection likelihood)
    city_penalty = (
        -0.05 if "tier 3" in city_tier
        else -0.02 if "tier 2" in city_tier
        else 0.0
    )
    gender_effect = -0.02 if gender in ("female", "f") else 0.0

    return round(_clamp(base + age_penalty + condition_penalty + city_penalty + gender_effect, 0.0, 1.0), 6)


# ── Welfare ───────────────────────────────────────────────────────────

def _score_welfare(profile: Mapping[str, Any]) -> float:
    """
    Welfare eligibility score: income + land + Aadhaar + region.

    Region tier and social category affect the score, simulating
    the administrative friction that disadvantages remote and
    marginalized applicants in automated benefit disbursement.
    """
    income = float(profile.get("annual_income") or 3)
    land = float(profile.get("land_holding") or 2)
    aadhaar = str(profile.get("aadhaar_linked") or "Yes").lower()
    state_tier = str(profile.get("state_tier") or "Developed State").lower()
    category = str(profile.get("category") or "General").upper()
    gender = str(profile.get("gender") or "").lower()

    # Lower income and land = higher eligibility
    income_component = _clamp(1.0 - (income / 15.0), 0.0, 1.0)
    land_component = _clamp(1.0 - (land / 20.0), 0.0, 1.0)
    base = (0.50 * income_component) + (0.30 * land_component)

    # Aadhaar linked is required — missing link severely reduces score
    aadhaar_penalty = -0.12 if aadhaar in ("no", "false") else 0.0

    # Remote/developing regions face more algorithmic friction
    region_penalty = (
        -0.07 if "remote" in state_tier
        else -0.04 if "developing" in state_tier
        else 0.0
    )

    # Marginalized categories face higher rejection rates despite equal eligibility
    category_penalty = (
        -0.05 if category == "GENERAL"  # General gets less benefit-of-doubt
        else 0.0
    )
    gender_effect = -0.03 if gender in ("female", "f") else 0.0

    return round(_clamp(base + aadhaar_penalty + region_penalty + category_penalty + gender_effect, 0.0, 1.0), 6)


# ── Public API ────────────────────────────────────────────────────────

_DOMAIN_SCORERS = {
    "hiring": _score_hiring,
    "lending": _score_lending,
    "education": _score_education,
    "insurance": _score_insurance,
    "welfare": _score_welfare,
}


def compute_score_from_validated(profile: Mapping[str, Any]) -> float:
    """
    Dispatch to the correct domain scorer.

    Falls back to the hiring scorer for unknown domains.
    """
    domain = str(profile.get("domain") or "hiring").lower()
    scorer = _DOMAIN_SCORERS.get(domain, _score_hiring)
    return scorer(profile)


def compute_score(profile: Mapping[str, Any]) -> float:
    """
    Validate and score in one call. Used by external callers.
    """
    normalized = validate_profile(profile)
    return compute_score_from_validated(normalized)
