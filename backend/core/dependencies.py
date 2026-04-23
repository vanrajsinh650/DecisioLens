"""
FastAPI dependency injection providers.

Each dependency is a singleton obtained via ``lru_cache`` so the same
instance is shared across all requests without per-request overhead.
"""

from __future__ import annotations

from functools import lru_cache

from core.cache import Cache
from core.config import Settings, get_settings


@lru_cache(maxsize=1)
def get_cache() -> Cache:
    """Return a singleton score cache."""
    settings = get_settings()
    return Cache(
        max_size=settings.CACHE_MAX_SIZE,
        default_ttl=settings.CACHE_TTL_SECONDS,
    )


def get_gemini_service():
    """
    Return a singleton ``GeminiService``.

    Import is deferred to avoid circular dependencies at module level.
    """
    from ai.gemini import GeminiService

    return GeminiService.instance()
