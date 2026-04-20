import { AuditRequest, AuditResponse } from "@/types/audit";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export async function runAudit(payload: AuditRequest): Promise<AuditResponse> {
  const response = await fetch(`${API_BASE.replace(/\/+$/, "")}/audit/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Audit failed (${response.status}): ${text || "Unknown error"}`);
  }

  return (await response.json()) as AuditResponse;
}
