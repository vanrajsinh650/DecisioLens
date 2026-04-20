"use client";

import { useCallback, useState } from "react";

import { runAudit } from "@/lib/api";
import { AuditRequest, AuditResponse } from "@/types/audit";

export function useAudit() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (payload: AuditRequest): Promise<AuditResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await runAudit(payload);
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error while running audit";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    run,
    reset,
  };
}
