"""
Token-bucket rate limiter for the audit endpoint.

Issue #6 fix: A valid API key can previously drive expensive compute/AI
usage without quota guardrails.  This module enforces:

- **Per-key burst limit** — each key gets a token bucket refilled at a
  configurable rate.  Requests that exhaust the bucket receive 429 immediately,
  before any scoring or AI work is scheduled.
- **Global concurrency cap** — a shared asyncio.Semaphore prevents the total
  number of in-flight audit pipelines from exceeding a hard ceiling even when
  many distinct keys are active simultaneously.

Defaults (overridable via env vars mapped in Settings):
  RATE_LIMIT_RPM      = 60   # max requests per minute per key
  RATE_LIMIT_BURST    = 10   # max instantaneous burst per key
  AUDIT_MAX_CONCURRENT = 20  # global in-flight audit pipelines
"""

from __future__ import annotations

import asyncio
import time
import threading
from typing import Dict

from core.logging import get_logger

logger = get_logger("ratelimit")


# ── Token bucket ─────────────────────────────────────────────────────

class _TokenBucket:
    """Thread-safe token bucket for a single API key."""

    def __init__(self, rate: float, burst: int) -> None:
        self._rate = rate        # tokens per second
        self._burst = burst      # max tokens (bucket capacity)
        self._tokens: float = float(burst)
        self._last_refill: float = time.monotonic()
        self._lock = threading.Lock()

    def consume(self) -> bool:
        """Try to consume one token.  Returns True if allowed, False if throttled."""
        with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_refill
            self._tokens = min(self._burst, self._tokens + elapsed * self._rate)
            self._last_refill = now

            if self._tokens >= 1.0:
                self._tokens -= 1.0
                return True
            return False


# ── Limiter registry ─────────────────────────────────────────────────

class RateLimiter:
    """
    Per-key token-bucket limiter with a shared global concurrency cap.

    Parameters
    ----------
    rpm : int
        Requests per minute allowed per key.
    burst : int
        Maximum instantaneous burst size per key.
    max_concurrent : int
        Maximum number of audit pipelines running simultaneously across
        all keys.  Requests that would exceed this receive 429 immediately.
    """

    def __init__(self, rpm: int = 60, burst: int = 10, max_concurrent: int = 20) -> None:
        self._rate = rpm / 60.0          # tokens per second
        self._burst = burst
        self._buckets: Dict[str, _TokenBucket] = {}
        self._buckets_lock = threading.Lock()
        self._global_sem = asyncio.Semaphore(max_concurrent)

    def _bucket_for(self, key: str) -> _TokenBucket:
        with self._buckets_lock:
            if key not in self._buckets:
                self._buckets[key] = _TokenBucket(self._rate, self._burst)
            return self._buckets[key]

    def check(self, api_key: str) -> bool:
        """
        Return True if the request is allowed, False if it should be throttled.

        Does NOT acquire the global semaphore — call ``acquire_global()``
        separately inside the request handler so the semaphore is released
        on response completion.
        """
        bucket = self._bucket_for(api_key)
        allowed = bucket.consume()
        if not allowed:
            logger.warning(
                "Rate limit exceeded for key ...%s — returning 429",
                api_key[-4:] if len(api_key) >= 4 else "****",
            )
        return allowed

    async def acquire_global(self) -> bool:
        """
        Non-blocking attempt to acquire a global concurrency slot.

        Returns True immediately if a slot is available, False (→ 429) if all
        slots are occupied.  The caller is responsible for calling
        ``release_global()`` when the request completes.
        """
        acquired = self._global_sem._value > 0  # type: ignore[attr-defined]
        if acquired:
            await self._global_sem.acquire()
        else:
            logger.warning(
                "Global audit concurrency cap reached — returning 429"
            )
        return acquired

    def release_global(self) -> None:
        """Release a previously acquired global concurrency slot."""
        self._global_sem.release()


# ── Module-level singleton ────────────────────────────────────────────

_limiter: RateLimiter | None = None
_limiter_lock = threading.Lock()


def get_rate_limiter() -> RateLimiter:
    """Return the application-wide singleton rate limiter."""
    global _limiter
    if _limiter is None:
        with _limiter_lock:
            if _limiter is None:
                from core.config import get_settings
                s = get_settings()
                rpm = getattr(s, "RATE_LIMIT_RPM", 60)
                burst = getattr(s, "RATE_LIMIT_BURST", 10)
                max_concurrent = getattr(s, "AUDIT_MAX_CONCURRENT", 20)
                _limiter = RateLimiter(rpm=rpm, burst=burst, max_concurrent=max_concurrent)
                logger.info(
                    "Rate limiter initialized: rpm=%d burst=%d max_concurrent=%d",
                    rpm, burst, max_concurrent,
                )
    return _limiter
