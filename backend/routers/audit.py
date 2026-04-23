"""
Audit API router — thin async controller.

All business logic lives in ``services.audit_service.AuditService``.
This module only wires HTTP concerns: request parsing, dependency
injection, and response model enforcement.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from core.cache import Cache
from core.dependencies import get_cache, get_gemini_service
from ai.gemini import GeminiService
from schemas.response import AuditResponse
from services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["audit"])


class AuditRequest(BaseModel):
    """Incoming audit request payload."""

    profile: dict[str, Any]
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)


def _get_audit_service(
    gemini: GeminiService = Depends(get_gemini_service),
    cache: Cache = Depends(get_cache),
) -> AuditService:
    """Build an ``AuditService`` from injected dependencies."""
    return AuditService(gemini=gemini, cache=cache)


@router.post("/run", response_model=AuditResponse)
async def run_audit_endpoint(
    request: AuditRequest,
    service: AuditService = Depends(_get_audit_service),
) -> AuditResponse:
    """
    Run the complete AI decision audit pipeline.

    Accepts a profile dict and threshold, returns a structured audit
    result including the original decision, threshold analysis,
    counterfactual variations, risk insights, explanation, and appeal.
    """

    return await service.run_audit(
        profile=request.profile,
        threshold=request.threshold,
    )
