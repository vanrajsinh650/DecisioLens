"""
Token-bucket rate limiter for the audit endpoint.

Fixes applied in this revision
--------------------------------
Issue #2: Rate limiting is now applied on a *client fingerprint* dimension
  (X-Forwarded-For IP or a fallback anonymous bucket), not on the shared
  service API key. The shared key is a BFF credential; all real users would
  share a single bucket if keyed by it — causing legitimate users to get
  throttled by each other's traffic.

Issue #3: Pre-auth (anonymous/IP-level) rate limiting is enforced before
  authentication runs. Invalid-key requests no longer bypass the limiter and
  can no longer be used for unbounded brute-force / DoS pressure.

Issue #5: acquire_global no longer touches the private _value attribute of
  asyncio.Semaphore. Instead it uses asyncio.wait_for with timeout=0 for a
  true non-blocking, atomically safe tryacquire pattern.

Defaults (overridable via env vars mapped in Settings):
  RATE_LIMIT_RPM         = 60   # max requests per minute per client fingerprint
  RATE_LIMIT_BURST       = 10   # max instantaneous burst per client fingerprint
  ANON_RATE_LIMIT_RPM    = 30   # stricter limit for unauthenticated / bad-key requests
  ANON_RATE_LIMIT_BURST  = 5    # burst for unauthenticated requests
  AUDIT_MAX_CONCURRENT   = 10   # global in-flight audit pipelines
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
    """Thread-safe token bucket for a single identity (IP / fingerprint)."""

    def __init__(self, rate: float, burst: int) -> None:
        self._rate = rate        # tokens per second
        self._burst = burst      # max tokens (bucket capacity)
        self._tokens: float = float(burst)
        self._last_refill: float = time.monotonic()
        self._lock = threading.Lock()

    def consume(self) -> bool:
        """Try to consume one token. Returns True if allowed, False if throttled."""
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
    Client-fingerprint token-bucket limiter with a shared global concurrency cap.

    Parameters
    ----------
    rpm : int
        Requests per minute per authenticated client fingerprint (IP).
    burst : int
        Maximum instantaneous burst size per authenticated fingerprint.
    anon_rpm : int
        Requests per minute for unauthenticated / bad-key requests (Issue #3).
    anon_burst : int
        Burst size for unauthenticated requests.
    max_concurrent : int
        Maximum audit pipelines running simultaneously across all clients.
        Must equal floor(AI_CONCURRENCY_LIMIT / 3) to prevent AI queue saturation.
    """

    def __init__(
        self,
        rpm: int = 60,
        burst: int = 10,
        anon_rpm: int = 30,
        anon_burst: int = 5,
        max_concurrent: int = 10,
    ) -> None:
        self._rate = rpm / 60.0
        self._burst = burst
        self._anon_rate = anon_rpm / 60.0
        self._anon_burst = anon_burst
        self._buckets: Dict[str, _TokenBucket] = {}
        self._buckets_lock = threading.Lock()
        self._global_sem = asyncio.Semaphore(max_concurrent)

    # ── Bucket management ────────────────────────────────────────────

    def _bucket_for(self, key: str, rate: float, burst: int) -> _TokenBucket:
        with self._buckets_lock:
            if key not in self._buckets:
                self._buckets[key] = _TokenBucket(rate, burst)
            return self._buckets[key]

    # ── Pre-auth (anonymous/IP) limiting — Issue #3 ──────────────────

    def check_anonymous(self, client_ip: str) -> bool:
        """
        Rate-limit *before* authentication using the client IP address.

        Enforced on every request regardless of whether the API key is valid,
        preventing brute-force / credential stuffing / DoS via bad keys.
        Returns True if allowed, False if the anonymous bucket is exhausted.
        """
        # Truncate IPv6 to /64 prefix to prevent per-address evasion
        fingerprint = _coerce_ip_fingerprint(client_ip)
        bucket = self._bucket_for(
            f"anon:{fingerprint}", self._anon_rate, self._anon_burst
        )
        allowed = bucket.consume()
        if not allowed:
            logger.warning(
                "Pre-auth rate limit exceeded for IP %s — returning 429", fingerprint
            )
        return allowed

    # ── Post-auth (per-client-IP) limiting — Issue #2 ────────────────

    def check_authenticated(self, client_ip: str) -> bool:
        """
        Rate-limit an authenticated request by the *client IP fingerprint*.

        Issue #2 fix: keying by the shared BFF service key throttled all real
        users together. Keying by client IP gives each end-user their own bucket.
        Returns True if allowed, False if the per-IP bucket is exhausted.
        """
        fingerprint = _coerce_ip_fingerprint(client_ip)
        bucket = self._bucket_for(
            f"auth:{fingerprint}", self._rate, self._burst
        )
        allowed = bucket.consume()
        if not allowed:
            logger.warning(
                "Authenticated rate limit exceeded for IP %s — returning 429",
                fingerprint,
            )
        return allowed

    # ── Global concurrency cap — Issue #5 ───────────────────────────

    async def acquire_global(self) -> bool:
        """
        Non-blocking attempt to acquire a global concurrency slot.

        Issue #5 fix: no longer accesses the private ``_value`` attribute of
        asyncio.Semaphore.  Uses ``asyncio.wait_for(..., timeout=0)`` for a
        truly atomic, Python-version-portable tryacquire pattern.

        Returns True if a slot was acquired, False (→ 429) if all slots are
        occupied.  The caller MUST call ``release_global()`` on completion.
        """
        try:
            await asyncio.wait_for(self._global_sem.acquire(), timeout=0)
            return True
        except (asyncio.TimeoutError, TimeoutError):
            logger.warning("Global audit concurrency cap reached — returning 429")
            return False

    def release_global(self) -> None:
        """Release a previously acquired global concurrency slot."""
        self._global_sem.release()


# ── Helpers ───────────────────────────────────────────────────────────

def _coerce_ip_fingerprint(ip: str) -> str:
    """
    Normalize an IP address to a stable fingerprint for rate-limiting.

    - IPv4: returned as-is (e.g. "203.0.113.5")
    - IPv6: truncated to the /64 network prefix (first four groups)
    - Missing / malformed: falls back to "unknown"
    """
    if not ip or ip in ("", "unknown"):
        return "unknown"
    ip = ip.strip()
    if ":" in ip:
        # IPv6 — use first four colon-separated groups (/64 prefix)
        parts = ip.split(":")
        return ":".join(parts[:4]) if len(parts) >= 4 else ip
    return ip


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
                anon_rpm = getattr(s, "ANON_RATE_LIMIT_RPM", 30)
                anon_burst = getattr(s, "ANON_RATE_LIMIT_BURST", 5)
                max_concurrent = getattr(s, "AUDIT_MAX_CONCURRENT", 10)
                _limiter = RateLimiter(
                    rpm=rpm,
                    burst=burst,
                    anon_rpm=anon_rpm,
                    anon_burst=anon_burst,
                    max_concurrent=max_concurrent,
                )
                logger.info(
                    "Rate limiter initialized: rpm=%d burst=%d "
                    "anon_rpm=%d anon_burst=%d max_concurrent=%d",
                    rpm, burst, anon_rpm, anon_burst, max_concurrent,
                )
    return _limiter
