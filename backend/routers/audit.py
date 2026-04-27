"""
Audit API router — thin async controller.

All business logic lives in ``services.audit_service.AuditService``.
This module only wires HTTP concerns: request parsing, dependency
injection, and response model enforcement.

Rate limiting strategy (issues #2, #3):
- Pre-auth IP-level check runs BEFORE authentication on every request,
  blocking brute-force / bad-key DoS before any auth work is done.
- Post-auth IP-level check uses a separate (higher) bucket per authenticated
  client IP, so legitimate users each get their own quota rather than sharing
  one bucket keyed by the shared BFF service key.
"""

from __future__ import annotations

import hmac
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field

from core.cache import Cache
from core.config import get_settings
from core.dependencies import get_cache, get_gemini_service
from core.ratelimit import get_rate_limiter
from ai.gemini import GeminiService
from schemas.response import AuditResponse
from services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["audit"])


class AuditRequest(BaseModel):
    """Incoming audit request payload."""

    domain: str = Field(default="hiring")
    profile: dict[str, Any]
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)


def _get_audit_service(
    gemini: GeminiService = Depends(get_gemini_service),
    cache: Cache = Depends(get_cache),
) -> AuditService:
    """Build an ``AuditService`` from injected dependencies."""
    return AuditService(gemini=gemini, cache=cache)


def _client_ip(request: Request) -> str:
    """
    Extract the real client IP from the request, preferring X-Forwarded-For.

    X-Forwarded-For is set by the Next.js BFF / reverse proxy. We take the
    leftmost (originating) IP. Falls back to the direct connection IP.
    """
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def require_api_key(x_api_key: str | None = Header(default=None)) -> str:
    """Reject unauthenticated audit runs before any AI work is scheduled.

    The expected key must be supplied by a trusted server-side caller (for
    example the Next.js API proxy), never by browser JavaScript.

    Returns the validated key so downstream handlers can confirm auth succeeded.
    """
    expected_key = get_settings().audit_api_key_resolved
    if not expected_key:
        raise HTTPException(status_code=503, detail="Audit API key is not configured")
    if not x_api_key or not hmac.compare_digest(x_api_key, expected_key):
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


@router.post("/run", response_model=AuditResponse)
async def run_audit_endpoint(
    request: Request,
    body: AuditRequest,
    service: AuditService = Depends(_get_audit_service),
) -> AuditResponse:
    """
    Run the complete AI decision audit pipeline.

    Accepts a domain, profile dict, and threshold; returns a structured
    audit result including the original decision, threshold analysis,
    counterfactual variations, risk insights, explanation, and appeal.

    Rate-limiting order (issues #2, #3, #4, #5):
    1. Pre-auth IP bucket  — blocks DoS/brute-force before auth runs
    2. Authentication      — rejects invalid keys (401)
    3. Post-auth IP bucket — per-client quota after successful auth
    4. Global concurrency  — atomic tryacquire; no _value inspection
    """
    limiter = get_rate_limiter()
    client_ip = _client_ip(request)

    # ── 1. Pre-auth IP-level throttle (Issue #3) ─────────────────────
    # Runs BEFORE authentication so bad-key requests are also rate-limited.
    if not limiter.check_anonymous(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many requests from this IP — please retry later.",
            headers={"Retry-After": "15"},
        )

    # ── 2. Authentication ─────────────────────────────────────────────
    api_key = await require_api_key(
        x_api_key=request.headers.get("x-api-key")
    )

    # ── 3. Post-auth per-client-IP throttle (Issue #2) ───────────────
    # Keyed by client IP so each end-user has their own bucket,
    # not a shared bucket for the entire BFF service key.
    if not limiter.check_authenticated(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded — please slow down and retry.",
            headers={"Retry-After": "10"},
        )

    # ── 4. Global concurrency cap (Issues #4, #5) ────────────────────
    # Uses asyncio.wait_for(timeout=0) — atomic, no private _value access.
    slot_acquired = await limiter.acquire_global()
    if not slot_acquired:
        raise HTTPException(
            status_code=429,
            detail="Server is at maximum audit capacity — please retry shortly.",
            headers={"Retry-After": "5"},
        )

    try:
        profile_with_domain = {**body.profile, "domain": body.domain}
        return await service.run_audit(
            profile=profile_with_domain,
            threshold=body.threshold,
        )
    finally:
        limiter.release_global()
