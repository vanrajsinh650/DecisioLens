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
    # Backend-only API key expected from a trusted server/BFF. Do not expose this
    # through NEXT_PUBLIC_* or any client-side bundle.
    AUDIT_API_KEY: str = Field(default="", alias="AUDIT_API_KEY")

    # Default to explicit localhost origins — safe for dev.
    # Override via CORS_ORIGINS env var in production deployments.
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"]
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1", "0.0.0.0", "backend"]
    )
    API_DOCS_ENABLED: bool = Field(default=False)
    SECURE_HSTS_SECONDS: int = Field(default=0)
    DEBUG: bool = Field(default=False)

    # Reject large request bodies before FastAPI/Pydantic parse JSON into memory.
    # Keep this above the per-profile 64 KB guard to allow envelope overhead.
    MAX_REQUEST_BODY_BYTES: int = Field(default=131_072)

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

    @property
    def audit_api_key_resolved(self) -> str:
        """Return the backend-only audit API key."""
        return self.AUDIT_API_KEY

    @model_validator(mode="after")
    def _validate_production_safety(self) -> "Settings":
        """Fail fast on unsafe or incomplete production configuration."""
        provider = self.AI_PROVIDER.lower().strip()
        if provider not in {"gemini", "groq"}:
            raise ValueError("AI_PROVIDER must be either 'gemini' or 'groq'.")
        self.AI_PROVIDER = provider

        if self.SECURE_HSTS_SECONDS < 0:
            raise ValueError("SECURE_HSTS_SECONDS must be zero or greater.")

        if not self.DEBUG and "*" in self.CORS_ORIGINS:
            raise ValueError(
                "CORS_ORIGINS=['*'] with credentials is not allowed when "
                "DEBUG=False. Set explicit trusted origins or enable DEBUG."
            )
        if not self.DEBUG and "*" in self.ALLOWED_HOSTS:
            raise ValueError(
                "ALLOWED_HOSTS=['*'] is not allowed when DEBUG=False. Set explicit "
                "trusted hostnames or enable DEBUG."
            )
        if not self.DEBUG and not self.audit_api_key_resolved:
            raise ValueError("AUDIT_API_KEY is required when DEBUG=False.")
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

