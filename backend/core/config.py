"""
Centralized application configuration via Pydantic BaseSettings.

All environment variables are loaded once at import time and exposed
through a cached ``get_settings()`` helper so every layer receives the
same instance without re-reading the environment.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application-wide configuration."""

    # ── Gemini AI ────────────────────────────────────────────────────
    GEMINI_API_KEY: str = Field(default="", alias="GEMINI_API_KEY")
    GOOGLE_API_KEY: str = Field(default="", alias="GOOGLE_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-1.5-flash")

    # ── Server / CORS ───────────────────────────────────────────────
    CORS_ORIGINS: List[str] = Field(default=["*"])
    DEBUG: bool = Field(default=False)

    # ── Logging ─────────────────────────────────────────────────────
    LOG_LEVEL: str = Field(default="INFO")

    # ── Cache ───────────────────────────────────────────────────────
    CACHE_TTL_SECONDS: int = Field(default=300)
    CACHE_MAX_SIZE: int = Field(default=256)

    @property
    def gemini_api_key_resolved(self) -> str:
        """Return whichever Gemini key is available."""
        return self.GEMINI_API_KEY or self.GOOGLE_API_KEY

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton ``Settings`` instance."""
    return Settings()
