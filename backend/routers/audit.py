"""
Audit API router — thin async controller.

All business logic lives in ``services.audit_service.AuditService``.
This module only wires HTTP concerns: request parsing, dependency
injection, and response model enforcement.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from core.cache import Cache
from core.config import get_settings
from core.dependencies import get_cache, get_gemini_service
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


async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """Reject unauthenticated audit runs before any AI work is scheduled."""
    expected_key = get_settings().PUBLIC_API_KEY
    if not expected_key:
        raise HTTPException(status_code=503, detail="Audit API key is not configured")
    if x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key")


@router.post("/run", response_model=AuditResponse, dependencies=[Depends(require_api_key)])
async def run_audit_endpoint(
    request: AuditRequest,
    service: AuditService = Depends(_get_audit_service),
) -> AuditResponse:
    """
    Run the complete AI decision audit pipeline.

    Accepts a domain, profile dict, and threshold; returns a structured
    audit result including the original decision, threshold analysis,
    counterfactual variations, risk insights, explanation, and appeal.
    """
    # Inject domain into the profile dict so the scoring layer can dispatch
    profile_with_domain = {**request.profile, "domain": request.domain}

    return await service.run_audit(
        profile=profile_with_domain,
        threshold=request.threshold,
    )

