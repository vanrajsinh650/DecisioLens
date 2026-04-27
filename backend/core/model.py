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


def _num(profile: Mapping[str, Any], key: str, default: float) -> float:
    """Read a numeric profile value without treating valid zero as missing."""
    value = profile.get(key)
    return float(default if value is None else value)


# Weights reflect real-world research on decision factors
# in hiring, lending, education, insurance, and welfare.
# Demographic modifiers are intentionally small but present
# to enable fairness and bias sensitivity testing.

# ── Hiring ────────────────────────────────────────────────────────────

# Weights reflect real-world research on decision factors
# in hiring, lending, education, insurance, and welfare.
# Demographic modifiers are intentionally small but present
# to enable fairness and bias sensitivity testing.
def _score_hiring(profile: Mapping[str, Any]) -> float:
    """
    Hiring score:
      - Years of experience: 0.35
      - Skills match score:  0.30
      - Education level:     0.20
      - Interview score:     0.15
      - Gender modifier:     ±0.03
      - Location modifier:   ±0.02
    """
    raw_score = _num(profile, "score", 50)
    raw_exp = _num(profile, "experience", 0)
    education = str(profile.get("education") or profile.get("college") or "").lower()
    interview = _num(profile, "interview_score", 50)

    # Skills match: 0–100 normalised to 0–1
    skills_component = raw_score / 100.0
    # Experience: diminishing returns curve, asymptotes near 1.0
    exp_component = 1.0 - math.exp(-raw_exp / 10.0)
    # Education level: simple tier mapping
    education_component = (
        1.0 if "phd" in education or "doctorate" in education or "tier 1" in education or "iit" in education or "nit" in education
        else 0.85 if "master" in education
        else 0.70 if "bachelor" in education or "tier 2" in education
        else 0.45 if "tier 3" in education
        else 0.40 if "diploma" in education
        else 0.50  # default / unknown
    )
    # Interview score: 0–100 normalised to 0–1
    interview_component = interview / 100.0

    base = (
        (0.35 * exp_component)
        + (0.30 * skills_component)
        + (0.20 * education_component)
        + (0.15 * interview_component)
    )

    # Demographic modifiers — small but present for bias detection
    gender = str(profile.get("gender") or "").lower()
    location = str(profile.get("location") or "").lower()

    gender_effect = -0.03 if gender in ("female", "f") else 0.0
    location_effect = (
        -0.02 if location in ("nagpur", "jaipur", "lucknow", "patna", "bhopal", "rural", "village")
        else 0.0
    )

    return round(_clamp(base + gender_effect + location_effect, 0.0, 1.0), 6)


# ── Lending ───────────────────────────────────────────────────────────

# Weights reflect real-world research on decision factors
# in hiring, lending, education, insurance, and welfare.
# Demographic modifiers are intentionally small but present
# to enable fairness and bias sensitivity testing.
def _score_lending(profile: Mapping[str, Any]) -> float:
    """
    Lending / banking score:
      - Credit score:                 0.40
      - Annual income:                0.25
      - Debt-to-income ratio:        -0.20 (negative weight)
      - Employment stability (yrs):   0.15
      - Gender modifier:              ±0.03
      - Location modifier:            ±0.02
    """
    credit = _num(profile, "credit_score", 600)
    income = _num(profile, "income", 5)
    loan = _num(profile, "loan_amount", 10)
    employment = str(profile.get("employment_type") or "").lower()
    employment_years = _num(profile, "employment_years", 3)
    gender = str(profile.get("gender") or "").lower()
    location = str(profile.get("location") or "").lower()

    # Credit score: map 300–900 → 0–1
    credit_component = _clamp((credit - 300) / 600.0, 0.0, 1.0)
    # Annual income: normalise with soft cap
    income_component = _clamp(income / 30.0, 0.0, 1.0)
    # Debt-to-income ratio: higher = worse (inverted)
    dti = loan / max(income, 0.5)
    dti_component = _clamp(dti / 10.0, 0.0, 1.0)  # 0 is best, 1 is worst
    # Employment stability: diminishing returns
    emp_stability_component = _clamp(employment_years / 15.0, 0.0, 1.0)
    employment_type_component = (
        1.0 if "salaried" in employment or "full" in employment
        else 0.65 if "self" in employment
        else 0.45 if "freelance" in employment or "contract" in employment
        else 0.55
    )

    base = (
        (0.35 * credit_component)
        + (0.25 * income_component)
        - (0.20 * dti_component)
        + (0.10 * emp_stability_component)
        + (0.10 * employment_type_component)
    )

    # Demographic modifiers — small but present for bias detection
    gender_effect = -0.03 if gender in ("female", "f") else 0.0
    location_effect = (
        -0.02 if location in ("rural", "remote", "village", "small town") else 0.0
    )

    return round(_clamp(base + gender_effect + location_effect, 0.0, 1.0), 6)


# ── Education ─────────────────────────────────────────────────────────

# Weights reflect real-world research on decision factors
# in hiring, lending, education, insurance, and welfare.
# Demographic modifiers are intentionally small but present
# to enable fairness and bias sensitivity testing.
def _score_education(profile: Mapping[str, Any]) -> float:
    """
    Education admission score:
      - Academic score / GPA:           0.40
      - Entrance exam score:            0.30
      - Extracurricular activities:     0.15
      - College tier:                   0.15
      - Gender modifier:               ±0.03
      - Location modifier:             ±0.02
    """
    entrance = _num(profile, "score", 50)
    grade_12 = _num(profile, "grade_12", 50)
    extracurricular = _num(profile, "extracurricular", 5)
    college = str(profile.get("college") or "").lower()
    category = str(profile.get("category") or "general").lower()
    income_band = str(profile.get("income_band") or "middle").lower()
    gender = str(profile.get("gender") or "").lower()
    location = str(profile.get("location") or "").lower()

    # Academic GPA / Class 12 %: 0–100 → 0–1
    gpa_component = grade_12 / 100.0
    # Entrance exam score: 0–100 → 0–1
    entrance_component = entrance / 100.0
    # Extracurricular: 0–10 → 0–1
    extra_component = _clamp(extracurricular / 10.0, 0.0, 1.0)
    # College tier
    college_tier_component = (
        1.0 if "tier 1" in college or "iit" in college or "nit" in college
        else 0.65 if "tier 2" in college
        else 0.35 if "tier 3" in college
        else 0.50  # default
    )
    income_component = (
        1.0 if "low" in income_band
        else 0.70 if "middle" in income_band
        else 0.40 if "high" in income_band
        else 0.60
    )

    base = (
        (0.42 * gpa_component)
        + (0.33 * entrance_component)
        + (0.10 * income_component)
        + (0.08 * extra_component)
        + (0.07 * college_tier_component)
    )

    # Demographic modifiers — small but present for bias detection
    gender_effect = -0.03 if gender in ("female", "f") else 0.0
    location_effect = (
        -0.02 if location in ("rural", "village", "remote", "small town") else 0.0
    )
    category_effect = -0.02 if category in ("sc", "st", "obc", "ews") else 0.0

    return round(_clamp(base + gender_effect + location_effect + category_effect, 0.0, 1.0), 6)


# ── Insurance ─────────────────────────────────────────────────────────

# Weights reflect real-world research on decision factors
# in hiring, lending, education, insurance, and welfare.
# Demographic modifiers are intentionally small but present
# to enable fairness and bias sensitivity testing.
def _score_insurance(profile: Mapping[str, Any]) -> float:
    """
    Insurance approval score:
      - Health score:                   0.35
      - Age risk factor:               0.30 (middle age scores highest)
      - Claim history:                -0.25 (negative weight)
      - Coverage amount requested:    -0.10 (negative weight)
      - Gender modifier:               ±0.03
      - Location modifier:             ±0.02
    """
    claim = _num(profile, "claim_amount", 2)
    age = _num(profile, "age", 40)
    pre_existing = str(profile.get("pre_existing") or "None").lower()
    coverage = _num(profile, "coverage_amount", 10)
    tenure = _num(profile, "policy_tenure", 0)
    gender = str(profile.get("gender") or "").lower()
    city_tier = str(profile.get("city_tier") or "Tier 1").lower()

    # Health score: penalise pre-existing conditions
    health_component = (
        0.30 if "both" in pre_existing
        else 0.50 if pre_existing in ("diabetes", "hypertension")
        else 1.0  # healthy
    )
    # Age risk: bell curve — middle age (30–50) scores highest
    if age < 25:
        age_component = 0.60
    elif age < 35:
        age_component = 0.85
    elif age <= 50:
        age_component = 1.0
    elif age <= 60:
        age_component = 0.70
    else:
        age_component = 0.40

    # Claim history: higher past claims → worse (normalised 0–50 lakhs)
    claim_component = _clamp(claim / 50.0, 0.0, 1.0)
    # Coverage requested: higher coverage → harder to approve (normalised 0–100 lakhs)
    coverage_component = _clamp(coverage / 100.0, 0.0, 1.0)
    # Longer tenure with the insurer improves confidence in the claim
    tenure_component = _clamp(tenure / 10.0, 0.0, 1.0)

    base = (
        (0.32 * health_component)
        + (0.28 * age_component)
        - (0.20 * claim_component)
        - (0.10 * coverage_component)
        + (0.10 * tenure_component)
    )

    # Demographic modifiers — small but present for bias detection
    gender_effect = -0.03 if gender in ("female", "f") else 0.0
    location_effect = (
        -0.02 if "tier 3" in city_tier or "rural" in city_tier
        else 0.0
    )

    return round(_clamp(base + gender_effect + location_effect, 0.0, 1.0), 6)


# ── Welfare ───────────────────────────────────────────────────────────

# Weights reflect real-world research on decision factors
# in hiring, lending, education, insurance, and welfare.
# Demographic modifiers are intentionally small but present
# to enable fairness and bias sensitivity testing.
def _score_welfare(profile: Mapping[str, Any]) -> float:
    """
    Welfare eligibility score:
      - Monthly income vs poverty line:  0.40 (lower income = higher score)
      - Family size:                     0.25 (larger family = higher score)
      - Employment status:               0.20 (unemployed = higher score)
      - Housing status:                  0.15 (renting/homeless = higher score)
      - Gender modifier:                 ±0.03
      - Location modifier:               ±0.02
    """
    income = _num(profile, "annual_income", 3)
    family_size = _num(profile, "family_size", 4)
    land = _num(profile, "land_holding", 0)
    employment_status = str(profile.get("employment_status") or "employed").lower()
    housing = str(profile.get("housing_status") or "owned").lower()
    category = str(profile.get("category") or "general").lower()
    aadhaar = str(profile.get("aadhaar_linked") or "").lower()
    gender = str(profile.get("gender") or "").lower()
    state_tier = str(profile.get("state_tier") or "Developed State").lower()

    # Lower income = higher eligibility (inverted, normalised by poverty line ~15 LPA)
    income_component = _clamp(1.0 - (income / 15.0), 0.0, 1.0)
    # Larger family = higher need (normalised by 10 members)
    family_component = _clamp(family_size / 10.0, 0.0, 1.0)
    # Employment status: unemployed scores highest for eligibility
    employment_component = (
        1.0 if "unemploy" in employment_status
        else 0.75 if "part" in employment_status or "casual" in employment_status
        else 0.40 if "self" in employment_status
        else 0.20  # employed (least need)
    )
    # Housing status: homeless/renting scores highest
    housing_component = (
        1.0 if "homeless" in housing or "shelter" in housing
        else 0.80 if "rent" in housing
        else 0.40 if "shared" in housing
        else 0.15  # owned (least need)
    )
    # Land ownership reduces means-tested need; it is not a proxy for family size.
    land_component = 1.0 - _clamp(land / 10.0, 0.0, 1.0)
    aadhaar_component = 1.0 if aadhaar == "yes" else 0.0
    category_component = (
        1.0 if category in ("sc", "st")
        else 0.85 if category in ("obc", "ews")
        else 0.45
    )

    base = (
        (0.30 * income_component)
        + (0.15 * family_component)
        + (0.10 * employment_component)
        + (0.10 * housing_component)
        + (0.15 * land_component)
        + (0.10 * aadhaar_component)
        + (0.10 * category_component)
    )

    # Demographic modifiers — small but present for bias detection
    gender_effect = -0.03 if gender in ("female", "f") else 0.0
    location_effect = (
        -0.02 if "remote" in state_tier or "developing" in state_tier
        else 0.0
    )

    return round(_clamp(base + gender_effect + location_effect, 0.0, 1.0), 6)


# ── Custom ────────────────────────────────────────────────────────────

def _score_custom(profile: Mapping[str, Any]) -> float:
    """Generic custom-domain scorer based on a user-supplied 0–100 score."""
    raw_score = _num(profile, "score", 50)
    return round(_clamp(raw_score / 100.0, 0.0, 1.0), 6)
# ── Public API ────────────────────────────────────────────────────────

_DOMAIN_SCORERS = {
    "hiring": _score_hiring,
    "lending": _score_lending,
    "education": _score_education,
    "insurance": _score_insurance,
    "welfare": _score_welfare,
    "custom": _score_custom,
}


def compute_score_from_validated(profile: Mapping[str, Any]) -> float:
    """
    Dispatch to the correct domain scorer.

    Raises ``KeyError`` for unknown domains — validation should have
    rejected them before this point.
    """
    domain = str(profile.get("domain") or "hiring").lower()
    scorer = _DOMAIN_SCORERS.get(domain)
    if scorer is None:
        raise KeyError(f"No scorer registered for domain '{domain}'")
    return scorer(profile)


def compute_score(profile: Mapping[str, Any]) -> float:
    """
    Validate and score in one call. Used by external callers.
    """
    normalized = validate_profile(profile)
    return compute_score_from_validated(normalized)
