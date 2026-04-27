"""
In-memory LRU cache with TTL expiration.

Provides a simple ``Cache`` class whose interface is backend-agnostic:
swap the implementation for Redis later without changing call sites.
"""

from __future__ import annotations

import hashlib
import json
import threading
import time
from collections import OrderedDict
from typing import Any, Hashable, Mapping


class Cache:
    """
    Thread-safe in-memory LRU cache with per-entry TTL.

    Parameters
    ----------
    max_size : int
        Maximum number of entries before the oldest is evicted.
    default_ttl : int
        Default time-to-live in seconds for each entry.
    """

    def __init__(self, max_size: int = 256, default_ttl: int = 300) -> None:
        self._max_size = max_size
        self._default_ttl = default_ttl
        self._store: OrderedDict[Hashable, tuple[Any, float]] = OrderedDict()
        self._lock = threading.Lock()

    def get(self, key: Hashable) -> Any | None:
        """Return cached value or ``None`` if missing / expired."""
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expires_at = entry
            if time.monotonic() > expires_at:
                del self._store[key]
                return None
            # Move to end (most recently used).
            self._store.move_to_end(key)
            return value

    def set(self, key: Hashable, value: Any, ttl: int | None = None) -> None:
        """Store a value with optional custom TTL (seconds)."""
        ttl = ttl if ttl is not None else self._default_ttl
        expires_at = time.monotonic() + ttl
        with self._lock:
            if key in self._store:
                self._store.move_to_end(key)
            self._store[key] = (value, expires_at)
            # Evict oldest entries when over capacity.
            while len(self._store) > self._max_size:
                self._store.popitem(last=False)

    def clear(self) -> None:
        """Remove all entries."""
        with self._lock:
            self._store.clear()

    @property
    def size(self) -> int:
        """Current number of entries (including potentially expired)."""
        return len(self._store)


def profile_cache_key(profile: Mapping[str, Any]) -> str:
    """
    Produce a deterministic cache key from a normalized profile dict.

    The key is a hex digest of the JSON-serialized profile so identical
    profiles always hit the same cache slot.
    """
    canonical = json.dumps(profile, sort_keys=True, default=str)
    return hashlib.sha256(canonical.encode()).hexdigest()


# Fields that are actually consumed by domain scorers in core/model.py.
# name is intentionally excluded — it is PII and has no effect on scoring.
# Any field not in this set is a non-scorer field and must not affect cache locality.
_SCORER_FIELDS: frozenset[str] = frozenset({
    "domain",
    # hiring
    "score", "experience", "education", "college", "interview_score",
    # lending
    "credit_score", "income", "loan_amount", "employment_type", "employment_years",
    # education
    "grade_12", "category", "income_band", "extracurricular",
    # insurance
    "age", "claim_amount", "pre_existing", "coverage_amount", "policy_tenure", "city_tier",
    # welfare
    "annual_income", "land_holding", "aadhaar_linked", "state_tier",
    "family_size", "employment_status", "housing_status",
    # counterfactual variation fields (gender/location used in swapped profiles)
    "gender", "location",
})


def score_cache_key(profile: Mapping[str, Any]) -> str:
    """
    Produce a cache key from **scoring-relevant fields only**.

    ``name`` and any other non-scorer fields are excluded so that
    semantically identical profiles (same domain + same scoring inputs)
    always map to the same cache slot, regardless of the applicant name
    or any other PII-adjacent metadata field.

    This fixes the cache-locality bug where 1,000 requests with identical
    scoring inputs but different names produced 1,000 distinct cache entries.
    """
    scorer_subset = {
        k: v for k, v in profile.items() if k in _SCORER_FIELDS
    }
    canonical = json.dumps(scorer_subset, sort_keys=True, default=str)
    return hashlib.sha256(canonical.encode()).hexdigest()
