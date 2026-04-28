"""
Centralized application configuration via Pydantic BaseSettings.

All environment variables are loaded once at import time and exposed
through a cached ``get_settings()`` helper so every layer receives the
same instance without re-reading the environment.
"""

from __future__ import annotations

import os
import sys
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings

# Only load .env file if it actually exists on disk.
# In production (Railway/Docker), there is no .env file — all config
# comes from OS environment variables injected by the platform.
_ENV_FILE = ".env" if Path(".env").is_file() else None


class Settings(BaseSettings):
    """Application-wide configuration."""

    # ── AI Provider ──────────────────────────────────────────────────
    AI_PROVIDER: str = Field(default="gemini")  # "gemini" or "groq"

    # ── Gemini AI ────────────────────────────────────────────────────
    GEMINI_API_KEY: str = Field(default="")
    GOOGLE_API_KEY: str = Field(default="")
    GEMINI_MODEL: str = Field(default="gemini-2.0-flash")

    # ── Groq AI ──────────────────────────────────────────────────────
    GROQ_API_KEY: str = Field(default="")
    GROQ_MODEL: str = Field(default="llama-3.3-70b-versatile")

    # ── Server / CORS ───────────────────────────────────────────────
    # Backend-only API key expected from a trusted server/BFF. Do not expose this
    # through NEXT_PUBLIC_* or any client-side bundle.
    AUDIT_API_KEY: str = Field(default="")

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

    # ── Rate limiting ────────────────────────────────────────────────
    # Post-auth per-client-IP token bucket (Issue #2 fix: keyed by IP, not API key).
    RATE_LIMIT_RPM: int = Field(default=60)    # requests per minute per client IP
    RATE_LIMIT_BURST: int = Field(default=10)  # max instantaneous burst per client IP
    # Pre-auth anonymous IP bucket (Issue #3 fix: throttle before authentication).
    # Stricter than post-auth to absorb brute-force / bad-key DoS cheaply.
    ANON_RATE_LIMIT_RPM: int = Field(default=30)   # req/min for unauthenticated IPs
    ANON_RATE_LIMIT_BURST: int = Field(default=5)  # burst for unauthenticated IPs
    # Global in-flight audit pipeline cap (Issue #4 fix).
    # Each audit fans out 3 AI calls; AI semaphore limit (_AI_CONCURRENCY_LIMIT) = 30.
    # Safe ceiling = floor(30 / 3) = 10 — keeps AI demand at semaphore capacity
    # with no queuing pressure. Raise only if AI semaphore is raised proportionally.
    AUDIT_MAX_CONCURRENT: int = Field(default=10)
    # Number of trusted reverse-proxy hops in front of this service (Issue #2 fix).
    # Used to safely parse X-Forwarded-For by peeling the rightmost N hops.
    # Set to 0 to always use the direct TCP connection IP (disable XFF trust).
    # Set to 1 for a standard single-proxy / BFF deployment (default).
    TRUSTED_PROXY_COUNT: int = Field(default=1)

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
        """Validate production safety — AUDIT_API_KEY enforced at request level."""
        provider = self.AI_PROVIDER.lower().strip()
        if provider not in {"gemini", "groq"}:
            raise ValueError("AI_PROVIDER must be either 'gemini' or 'groq'.")
        self.AI_PROVIDER = provider

        if self.SECURE_HSTS_SECONDS < 0:
            raise ValueError("SECURE_HSTS_SECONDS must be zero or greater.")

        # Print startup diagnostic so Railway logs show env var injection state.
        _diag_keys = ["AUDIT_API_KEY", "DEBUG", "AI_PROVIDER", "GEMINI_API_KEY"]
        _present = {k: (k in os.environ) for k in _diag_keys}
        _vals = {k: (os.environ.get(k, "")[:6] + "***" if os.environ.get(k) else "<MISSING>") for k in _diag_keys}
        print(
            f"[STARTUP] env presence={_present} | values={_vals} | "
            f"env_file={_ENV_FILE or 'None'} | cwd={os.getcwd()}",
            file=sys.stderr, flush=True,
        )

        if not self.DEBUG and "*" in self.CORS_ORIGINS:
            raise ValueError(
                "CORS_ORIGINS=['*'] is not allowed when DEBUG=False."
            )
        if not self.DEBUG and "*" in self.ALLOWED_HOSTS:
            raise ValueError(
                "ALLOWED_HOSTS=['*'] is not allowed when DEBUG=False."
            )

        # AUDIT_API_KEY is enforced at request time (routers/audit.py),
        # NOT at startup — so the server can boot and /health works even
        # before the key is configured. A warning is printed here instead.
        if not self.audit_api_key_resolved:
            print(
                "[STARTUP WARNING] AUDIT_API_KEY not set — /audit endpoints will return 403.",
                file=sys.stderr, flush=True,
            )
        return self

    model_config = {
        "env_file": _ENV_FILE,
        "env_file_encoding": "utf-8",
        "extra": "ignore",
        "populate_by_name": True,
    }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton ``Settings`` instance."""
    return Settings()

