"use client";

import { useCallback, useState } from "react";

import { runAudit } from "@/lib/api";
import { AuditRequest, AuditResponse } from "@/types/audit";

export function useAudit() {
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAudit = useCallback(async (payload: AuditRequest): Promise<AuditResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await runAudit(payload);
      setResult(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error while running audit";
      setError(message);
      setResult(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    result,
    submitAudit,
  };
}
