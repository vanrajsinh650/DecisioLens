from __future__ import annotations

from typing import Any, Mapping

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProfileSchema(BaseModel):
    """Strict, normalized profile payload used by the service."""

    model_config = ConfigDict(strict=True, extra="forbid")

    name: str = Field(min_length=1, max_length=120)
    score: float = Field(ge=0, le=100)
    experience: int = Field(ge=0, le=50)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized = " ".join(value.strip().split())
        if not normalized:
            raise ValueError("name cannot be blank")
        return normalized


def _normalize_profile(data: Mapping[str, Any]) -> dict[str, Any]:
    normalized = dict(data)

    if isinstance(normalized.get("name"), str):
        normalized["name"] = " ".join(normalized["name"].strip().split())

    score = normalized.get("score")
    if isinstance(score, str):
        score = score.strip()
        if not score:
            raise ValueError("score cannot be empty")
        normalized["score"] = float(score)
    elif isinstance(score, int):
        normalized["score"] = float(score)

    experience = normalized.get("experience")
    if isinstance(experience, str):
        experience = experience.strip()
        if not experience:
            raise ValueError("experience cannot be empty")
        experience_number = float(experience)
        if not experience_number.is_integer():
            raise ValueError("experience must be a whole number")
        normalized["experience"] = int(experience_number)
    elif isinstance(experience, float):
        if not experience.is_integer():
            raise ValueError("experience must be a whole number")
        normalized["experience"] = int(experience)

    return normalized


def validate_profile(data: Mapping[str, Any]) -> dict[str, Any]:
    """
    Validate and normalize incoming profile payload.

    Returns canonical profile data that can be reused across the app.
    """

    if not isinstance(data, Mapping):
        raise TypeError("profile data must be a mapping")

    normalized = _normalize_profile(data)
    profile = ProfileSchema.model_validate(normalized)
    return profile.model_dump()
