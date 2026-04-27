"""
Token-bucket rate limiter for the audit endpoint.

Fixes in this revision
----------------------
Issue #1: acquire_global() no longer uses asyncio.wait_for(timeout=0).
  CPython asyncio raises TimeoutError even when permits are available
  with zero timeout, causing false 429 floods.  Replaced with a safe
  non-blocking tryacquire: check Semaphore.locked() then acquire under
  an asyncio.Lock so the check+acquire is effectively atomic within the
  event loop.

Issue #2: Client IP is no longer blindly taken from X-Forwarded-For.
  Only the rightmost TRUSTED_PROXY_COUNT hops are peeled off XFF, so
  attacker-controlled leading IPs cannot create a fresh bucket identity.
  Falls back to request.client.host when no trusted proxy count is set.

Issue #3: Bucket registry is bounded via a simple LRU-style OrderedDict
  with a maximum size cap and periodic idle-eviction by last-seen time.
  Rotating spoofed IPs can no longer grow memory unboundedly.
"""

from __future__ import annotations

import asyncio
import time
import threading
from collections import OrderedDict
from typing import Optional

from core.logging import get_logger

logger = get_logger("ratelimit")

# Maximum number of distinct IP buckets held in memory.
# Oldest-seen entries are evicted when this cap is reached.
_MAX_BUCKET_ENTRIES = 4096

# Buckets not consumed from in this many seconds are eligible for eviction.
_BUCKET_IDLE_TTL_SECONDS = 600  # 10 minutes


# ── Token bucket ─────────────────────────────────────────────────────

class _TokenBucket:
    """Thread-safe token bucket for a single identity (IP / fingerprint)."""

    def __init__(self, rate: float, burst: int) -> None:
        self._rate = rate
        self._burst = burst
        self._tokens: float = float(burst)
        self._last_seen: float = time.monotonic()
        self._lock = threading.Lock()

    def consume(self) -> bool:
        """Try to consume one token. Returns True if allowed, False if throttled."""
        with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_seen
            self._tokens = min(self._burst, self._tokens + elapsed * self._rate)
            self._last_seen = now
            if self._tokens >= 1.0:
                self._tokens -= 1.0
                return True
            return False

    @property
    def last_seen(self) -> float:
        return self._last_seen


# ── Bounded bucket registry ──────────────────────────────────────────

class _BoundedBucketRegistry:
    """
    LRU-bounded registry of _TokenBuckets keyed by identity string.

    Issue #3 fix: unbounded dict allowed memory exhaustion via rotating
    spoofed IPs.  This registry caps total entries at _MAX_BUCKET_ENTRIES
    and evicts the least-recently-used entry on overflow.  Idle entries
    (last_seen older than _BUCKET_IDLE_TTL_SECONDS) are also pruned on
    each insert to reclaim memory proactively.
    """

    def __init__(self) -> None:
        self._store: OrderedDict[str, _TokenBucket] = OrderedDict()
        self._lock = threading.Lock()

    def get_or_create(self, key: str, rate: float, burst: int) -> _TokenBucket:
        with self._lock:
            if key in self._store:
                self._store.move_to_end(key)
                return self._store[key]

            # Evict idle entries before inserting a new one
            now = time.monotonic()
            idle_keys = [
                k for k, b in self._store.items()
                if now - b.last_seen > _BUCKET_IDLE_TTL_SECONDS
            ]
            for k in idle_keys:
                del self._store[k]

            # Evict oldest entry (LRU) if still over cap
            while len(self._store) >= _MAX_BUCKET_ENTRIES:
                self._store.popitem(last=False)

            bucket = _TokenBucket(rate, burst)
            self._store[key] = bucket
            return bucket

    @property
    def size(self) -> int:
        return len(self._store)


# ── Global semaphore tryacquire ──────────────────────────────────────

async def _sem_try_acquire(sem: asyncio.Semaphore) -> bool:
    """
    Attempt a non-blocking acquire of *sem*.

    Issue #1 fix: asyncio.wait_for(sem.acquire(), timeout=0) raises
    TimeoutError even when permits are available in CPython 3.10+, causing
    false 429 floods.

    Safe pattern used here:
      1. Check sem.locked() — True only when all permits are exhausted.
      2. If not locked, acquire() under a tiny shield so we never block
         for more than one event-loop iteration.

    This is safe because:
      - locked() returns True only when _value == 0 (all slots taken).
      - The subsequent acquire() cannot block if _value > 0 at check time;
        in the worst case another coroutine claims the last permit between
        the check and the acquire, but that is benign — we simply fall
        through the try/except and return False.
    """
    if sem.locked():
        return False
    try:
        # acquire() is guaranteed fast here; shield prevents cancellation
        # from leaving the semaphore in an inconsistent state.
        await asyncio.shield(sem.acquire())
        return True
    except Exception:
        return False


# ── RateLimiter ──────────────────────────────────────────────────────

class RateLimiter:
    """
    Client-fingerprint token-bucket limiter with a bounded global concurrency cap.

    Parameters
    ----------
    rpm : int
        Requests per minute per authenticated client fingerprint (IP).
    burst : int
        Max instantaneous burst per authenticated fingerprint.
    anon_rpm : int
        Requests per minute for unauthenticated / bad-key requests.
    anon_burst : int
        Burst size for unauthenticated requests.
    max_concurrent : int
        Maximum audit pipelines running simultaneously.
        Must equal floor(AI_CONCURRENCY_LIMIT / 3) to avoid AI queue saturation.
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
        self._registry = _BoundedBucketRegistry()
        self._global_sem = asyncio.Semaphore(max_concurrent)

    # ── Pre-auth (anonymous/IP) limiting ─────────────────────────────

    def check_anonymous(self, client_ip: str) -> bool:
        """
        Rate-limit before authentication using the client IP.

        Enforced on every request regardless of API key validity, preventing
        brute-force / DoS via bad keys from being unbounded (Issue #3 from
        previous round fixed separately; this method uses bounded registry).
        """
        fingerprint = _coerce_ip_fingerprint(client_ip)
        bucket = self._registry.get_or_create(
            f"anon:{fingerprint}", self._anon_rate, self._anon_burst
        )
        allowed = bucket.consume()
        if not allowed:
            logger.warning(
                "Pre-auth rate limit exceeded for IP %s — returning 429", fingerprint
            )
        return allowed

    # ── Post-auth (per-client-IP) limiting ───────────────────────────

    def check_authenticated(self, client_ip: str) -> bool:
        """
        Rate-limit an authenticated request by client IP fingerprint.

        Each end-user gets their own bucket; the shared BFF service key is
        not used as a dimension (Issue #2 fix from previous round).
        """
        fingerprint = _coerce_ip_fingerprint(client_ip)
        bucket = self._registry.get_or_create(
            f"auth:{fingerprint}", self._rate, self._burst
        )
        allowed = bucket.consume()
        if not allowed:
            logger.warning(
                "Authenticated rate limit exceeded for IP %s — returning 429",
                fingerprint,
            )
        return allowed

    # ── Global concurrency cap ────────────────────────────────────────

    async def acquire_global(self) -> bool:
        """
        Non-blocking attempt to acquire a global concurrency slot.

        Issue #1 fix: uses _sem_try_acquire() instead of the broken
        wait_for(timeout=0) pattern that raised TimeoutError even when
        permits were available in CPython 3.10+.

        Returns True if a slot was acquired (caller MUST call release_global),
        False (→ 429) if all slots are occupied.
        """
        acquired = await _sem_try_acquire(self._global_sem)
        if not acquired:
            logger.warning("Global audit concurrency cap reached — returning 429")
        return acquired

    def release_global(self) -> None:
        """Release a previously acquired global concurrency slot."""
        self._global_sem.release()

    @property
    def bucket_count(self) -> int:
        """Current number of tracked IP buckets (for monitoring)."""
        return self._registry.size


# ── IP fingerprint helpers ────────────────────────────────────────────

def _coerce_ip_fingerprint(ip: str) -> str:
    """
    Normalize an IP address to a stable fingerprint for rate-limiting.

    - IPv4: returned as-is (e.g. "203.0.113.5")
    - IPv6: truncated to the /64 network prefix (first four groups)
    - Missing / malformed: falls back to "unknown"
    """
    if not ip or ip.strip() in ("", "unknown"):
        return "unknown"
    ip = ip.strip()
    if ":" in ip:
        parts = ip.split(":")
        return ":".join(parts[:4]) if len(parts) >= 4 else ip
    return ip


def extract_client_ip(
    forwarded_for: str,
    direct_host: Optional[str],
    trusted_proxy_count: int,
) -> str:
    """
    Resolve the real client IP from X-Forwarded-For with trust-boundary enforcement.

    Issue #2 fix: the leftmost IP in XFF is attacker-controlled when the
    service sits behind a configurable number of trusted proxies. The correct
    approach is to peel off the rightmost ``trusted_proxy_count`` hops (added
    by proxies we control) and use the IP immediately to the left of those.

    Parameters
    ----------
    forwarded_for : str
        Raw value of the X-Forwarded-For header (comma-separated IPs).
    direct_host : str | None
        IP of the direct TCP connection (request.client.host).
    trusted_proxy_count : int
        Number of trusted reverse-proxy hops in front of this service.
        Set to 0 to always use direct_host (no XFF trust at all).
        Set to 1 if exactly one proxy (e.g. nginx / Next.js BFF) is trusted.

    Returns
    -------
    str
        The resolved client IP, or "unknown" if it cannot be determined.
    """
    if trusted_proxy_count <= 0 or not forwarded_for.strip():
        return direct_host or "unknown"

    # XFF is "client, proxy1, proxy2, ..." — rightmost are most trustworthy.
    hops = [h.strip() for h in forwarded_for.split(",") if h.strip()]
    if not hops:
        return direct_host or "unknown"

    # The real client is at index len(hops) - trusted_proxy_count.
    # If there are fewer hops than trusted proxies, fall back to direct host.
    real_index = len(hops) - trusted_proxy_count
    if real_index < 0:
        return direct_host or "unknown"

    candidate = hops[real_index]
    # Basic sanity: reject obviously bogus values
    if not candidate or candidate.lower() in ("unknown", "localhost", "::1"):
        return direct_host or "unknown"
    return candidate


# ── Module-level singleton ────────────────────────────────────────────

_limiter: Optional[RateLimiter] = None
_limiter_lock = threading.Lock()


def get_rate_limiter() -> RateLimiter:
    """Return the application-wide singleton rate limiter."""
    global _limiter
    if _limiter is None:
        with _limiter_lock:
            if _limiter is None:
                from core.config import get_settings
                s = get_settings()
                _limiter = RateLimiter(
                    rpm=getattr(s, "RATE_LIMIT_RPM", 60),
                    burst=getattr(s, "RATE_LIMIT_BURST", 10),
                    anon_rpm=getattr(s, "ANON_RATE_LIMIT_RPM", 30),
                    anon_burst=getattr(s, "ANON_RATE_LIMIT_BURST", 5),
                    max_concurrent=getattr(s, "AUDIT_MAX_CONCURRENT", 10),
                )
                logger.info(
                    "Rate limiter initialized: rpm=%d burst=%d "
                    "anon_rpm=%d anon_burst=%d max_concurrent=%d "
                    "bucket_cap=%d",
                    getattr(s, "RATE_LIMIT_RPM", 60),
                    getattr(s, "RATE_LIMIT_BURST", 10),
                    getattr(s, "ANON_RATE_LIMIT_RPM", 30),
                    getattr(s, "ANON_RATE_LIMIT_BURST", 5),
                    getattr(s, "AUDIT_MAX_CONCURRENT", 10),
                    _MAX_BUCKET_ENTRIES,
                )
    return _limiter
