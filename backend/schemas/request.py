"""
Multi-domain profile schema.

Each domain sends different fields, so we use a flexible open schema
that accepts any extra fields (``extra="allow"``) while still
enforcing the common required fields (``name``, ``domain``).

Domain-specific fields are validated downstream in the scoring layer.
"""

from __future__ import annotations

from typing import Any, Mapping

from pydantic import BaseModel, ConfigDict, Field


SUPPORTED_DOMAINS = {"hiring", "lending", "education", "insurance", "welfare"}


class ProfileSchema(BaseModel):
    """Flexible, normalized profile payload used by the service."""

    model_config = ConfigDict(extra="allow")

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
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            raise ValueError(f"{field} cannot be empty")
        return float(stripped)
    raise ValueError(f"{field} must be numeric, got {type(value).__name__}")


def _normalize_profile(data: Mapping[str, Any]) -> dict[str, Any]:
    normalized: dict[str, Any] = dict(data)

    # Name
    normalized["name"] = _normalize_name(normalized.get("name", ""))

    # Domain
    domain = str(normalized.get("domain", "hiring")).strip().lower()
    if domain not in SUPPORTED_DOMAINS:
        domain = "hiring"
    normalized["domain"] = domain

    # Gender (common across all domains)
    normalized["gender"] = _normalize_gender(normalized.get("gender"))

    # Coerce numeric fields that are present (domain-specific)
    _NUMERIC_FIELDS = [
        "score", "experience", "income", "credit_score", "loan_amount",
        "grade_12", "age", "claim_amount", "policy_tenure",
        "annual_income", "land_holding",
    ]
    for field in _NUMERIC_FIELDS:
        if field in normalized and normalized[field] is not None:
            try:
                normalized[field] = _coerce_number(normalized[field], field)
            except (ValueError, TypeError):
                pass  # leave as-is; scoring layer will handle missing fields

    return normalized


def validate_profile(data: Mapping[str, Any]) -> dict[str, Any]:
    """
    Validate and normalize incoming multi-domain profile payload.

    Returns canonical profile data safe to pass to the scoring layer.
    """
    if not isinstance(data, Mapping):
        raise TypeError("profile data must be a mapping")

    normalized = _normalize_profile(data)
    profile = ProfileSchema.model_validate(normalized)
    # model_dump with mode="python" preserves extra fields
    return profile.model_dump(mode="python")
