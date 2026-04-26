"""
Multi-domain profile schema.

Each domain sends different fields.  A per-domain allowlist controls
which fields are accepted — unknown fields are silently stripped so
they never reach the scoring layer or LLM prompts.

Payload size, string length, and numeric ranges are enforced here
to prevent malformed or malicious inputs from propagating.
"""

from __future__ import annotations

import math
from typing import Any, Mapping

from pydantic import BaseModel, ConfigDict, Field


SUPPORTED_DOMAINS = {"hiring", "lending", "education", "insurance", "welfare"}

# Maximum size for any single string field value (bytes)
_MAX_STRING_FIELD_LENGTH = 500

# Maximum total serialized payload size (bytes) — ~64 KB
_MAX_PAYLOAD_SIZE = 65_536

# Per-domain allowlists of accepted profile fields.
# IMPORTANT: Every field consumed by a domain scorer in core/model.py
# MUST appear here — otherwise it is silently stripped before scoring.
_DOMAIN_ALLOWED_FIELDS: dict[str, set[str]] = {
    "hiring": {
        "name", "domain", "gender", "score", "experience", "location", "college",
        "education", "interview_score",  # consumed by _score_hiring
    },
    "lending": {
        "name", "domain", "gender", "credit_score", "income", "loan_amount",
        "employment_type", "location",
        "employment_years",  # consumed by _score_lending
    },
    "education": {
        "name", "domain", "gender", "score", "grade_12", "category",
        "income_band", "location",
        "extracurricular", "college",  # consumed by _score_education
    },
    "insurance": {
        "name", "domain", "gender", "claim_amount", "policy_tenure", "age",
        "city_tier", "pre_existing",
        "coverage_amount",  # consumed by _score_insurance
    },
    "welfare": {
        "name", "domain", "gender", "annual_income", "land_holding",
        "aadhaar_linked", "state_tier", "category",
        "family_size", "employment_status", "housing_status",  # consumed by _score_welfare
    },
}
# Union of all allowed fields for initial acceptance before domain is resolved
_ALL_ALLOWED_FIELDS = set().union(*_DOMAIN_ALLOWED_FIELDS.values())


class ProfileSchema(BaseModel):
    """Strict, normalized profile payload used by the service."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=120)
    domain: str = Field(default="hiring")
    gender: str | None = Field(default=None)


def _normalize_name(value: Any) -> str:
    if not isinstance(value, str):
        raise ValueError("name must be a string")
    normalized = " ".join(value.strip().split())
    if not normalized:
        raise ValueError("name cannot be blank")
    return normalized


def _normalize_gender(value: Any) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        return None
    cleaned = value.strip().lower().replace("_", "-")
    return cleaned or None


def _coerce_number(value: Any, field: str) -> float:
    if isinstance(value, bool):
        raise ValueError(f"{field} must be numeric, got bool")
    if isinstance(value, (int, float)):
        result = float(value)
    elif isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            raise ValueError(f"{field} cannot be empty")
        result = float(stripped)
    else:
        raise ValueError(f"{field} must be numeric, got {type(value).__name__}")

    # Issue #4 fix: reject NaN, Inf, -Inf
    if not math.isfinite(result):
        raise ValueError(f"{field} must be a finite number, got {result}")
    return result


def _normalize_profile(data: Mapping[str, Any]) -> dict[str, Any]:
    # ── Payload size guard ───────────────────────────────────────
    import json as _json
    raw_size = len(_json.dumps(dict(data), default=str))
    if raw_size > _MAX_PAYLOAD_SIZE:
        raise ValueError(
            f"Profile payload too large ({raw_size} bytes, max {_MAX_PAYLOAD_SIZE})"
        )

    normalized: dict[str, Any] = dict(data)

    # ── String field length guard ────────────────────────────────
    for key, val in normalized.items():
        if isinstance(val, str) and len(val) > _MAX_STRING_FIELD_LENGTH:
            raise ValueError(
                f"Field '{key}' exceeds maximum length of {_MAX_STRING_FIELD_LENGTH} characters"
            )

    # Name
    normalized["name"] = _normalize_name(normalized.get("name", ""))

    # Domain
    domain = str(normalized.get("domain", "hiring")).strip().lower()
    if domain not in SUPPORTED_DOMAINS:
        raise ValueError(
            f"Unsupported domain '{domain}'. "
            f"Valid domains: {', '.join(sorted(SUPPORTED_DOMAINS))}"
        )
    normalized["domain"] = domain

    # Gender (common across all domains)
    normalized["gender"] = _normalize_gender(normalized.get("gender"))

    # Coerce numeric fields that are present (domain-specific)
    _NUMERIC_FIELDS = [
        "score", "experience", "income", "credit_score", "loan_amount",
        "grade_12", "age", "claim_amount", "policy_tenure",
        "annual_income", "land_holding",
        # Fields added for scorer consistency (Issue #1)
        "interview_score", "employment_years", "extracurricular",
        "coverage_amount", "family_size",
    ]
    for field in _NUMERIC_FIELDS:
        if field in normalized and normalized[field] is not None:
            normalized[field] = _coerce_number(normalized[field], field)

    # ── Domain-specific range validation ─────────────────────────
    _RANGE_RULES: dict[str, tuple[float, float]] = {
        "score": (0, 100),
        "experience": (0, 80),
        "income": (0, 1e9),
        "credit_score": (0, 900),
        "loan_amount": (0.01, 1e12),   # must be positive (avoids div-by-1 exploit)
        "grade_12": (0, 100),
        "age": (0, 150),
        "claim_amount": (0, 1e12),
        "policy_tenure": (0, 100),
        "annual_income": (0, 1e12),
        "land_holding": (0, 1e6),
        # Added for scorer consistency (Issue #1)
        "interview_score": (0, 100),
        "employment_years": (0, 80),
        "extracurricular": (0, 10),
        "coverage_amount": (0, 1e12),
        "family_size": (0, 50),
    }
    for field, (lo, hi) in _RANGE_RULES.items():
        if field in normalized and normalized[field] is not None:
            val = normalized[field]
            if not isinstance(val, (int, float)):
                continue  # already caught above
            if val < lo or val > hi:
                raise ValueError(
                    f"{field} must be between {lo} and {hi}, got {val}"
                )

    return normalized


def validate_profile(data: Mapping[str, Any]) -> dict[str, Any]:
    """
    Validate and normalize incoming multi-domain profile payload.

    Only fields in the per-domain allowlist are accepted. Unknown fields
    are silently stripped so they never reach the scoring layer or LLM
    prompts.

    Returns canonical profile data safe to pass to the scoring layer.
    """
    if not isinstance(data, Mapping):
        raise TypeError("profile data must be a mapping")

    normalized = _normalize_profile(data)

    # Determine domain-specific allowed fields
    domain = normalized.get("domain", "hiring")
    allowed = _DOMAIN_ALLOWED_FIELDS.get(domain, _ALL_ALLOWED_FIELDS)

    # Split into schema fields and allowed extras
    schema_fields = {"name", "domain", "gender"}
    core_data = {k: v for k, v in normalized.items() if k in schema_fields}
    extra_data = {k: v for k, v in normalized.items() if k in allowed and k not in schema_fields}

    # Validate core via Pydantic (extra="forbid" enforced)
    profile = ProfileSchema.model_validate(core_data)
    result = profile.model_dump(mode="python")

    # Merge back allowed domain-specific fields
    result.update(extra_data)
    return result
