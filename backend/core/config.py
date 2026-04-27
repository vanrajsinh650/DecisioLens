"""
Centralized application configuration via Pydantic BaseSettings.

All environment variables are loaded once at import time and exposed
through a cached ``get_settings()`` helper so every layer receives the
same instance without re-reading the environment.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application-wide configuration."""

    # ── AI Provider ──────────────────────────────────────────────────
    AI_PROVIDER: str = Field(default="gemini")  # "gemini" or "groq"

    # ── Gemini AI ────────────────────────────────────────────────────
    GEMINI_API_KEY: str = Field(default="", alias="GEMINI_API_KEY")
    GOOGLE_API_KEY: str = Field(default="", alias="GOOGLE_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-2.0-flash")

    # ── Groq AI ──────────────────────────────────────────────────────
    GROQ_API_KEY: str = Field(default="")
    GROQ_MODEL: str = Field(default="llama-3.3-70b-versatile")

    # ── Server / CORS ───────────────────────────────────────────────
    PUBLIC_API_KEY: str = Field(default="", alias="PUBLIC_API_KEY")

    # Default to explicit localhost origins — safe for dev.
    # Override via CORS_ORIGINS env var in production deployments.
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"]
    )
    DEBUG: bool = Field(default=False)

    # ── Logging ─────────────────────────────────────────────────────
    LOG_LEVEL: str = Field(default="INFO")

    # ── Cache ───────────────────────────────────────────────────────
    CACHE_TTL_SECONDS: int = Field(default=300)
    CACHE_MAX_SIZE: int = Field(default=256)

    # ── AI network safety ───────────────────────────────────────────
    AI_CALL_TIMEOUT_SECONDS: float = Field(default=10.0)

    @property
    def gemini_api_key_resolved(self) -> str:
        """Return whichever Gemini key is available."""
        return self.GEMINI_API_KEY or self.GOOGLE_API_KEY

    @model_validator(mode="after")
    def _reject_wildcard_credentials_in_production(self) -> "Settings":
        """Fail fast if wildcard CORS is configured outside DEBUG mode."""
        if not self.DEBUG and "*" in self.CORS_ORIGINS:
            raise ValueError(
                "CORS_ORIGINS=['*'] with credentials is not allowed when "
                "DEBUG=False. Set explicit trusted origins or enable DEBUG."
            )
        return self

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton ``Settings`` instance."""
    return Settings()

