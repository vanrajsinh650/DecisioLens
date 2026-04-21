import { AuditRequest, AuditResponse, Decision } from "@/types/audit";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null;
};

const toString = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toStringArray = (value: unknown, fallback: string[] = []): string[] => {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === "string");
};

const toDecision = (value: unknown, fallback: Decision = "REJECT"): Decision => {
  return value === "ACCEPT" || value === "REJECT" ? value : fallback;
};

const normalizeAuditResponse = (raw: unknown, request: AuditRequest): AuditResponse => {
  const payload = isRecord(raw) ? raw : {};

  const originalRaw = isRecord(payload.original) ? payload.original : {};
  const originalScore = toNumber(originalRaw.score, 0);
  const originalDecision = toDecision(originalRaw.decision, "REJECT");
  const originalThreshold = toNumber(originalRaw.threshold, request.threshold);
  const confidenceZone = toString(originalRaw.confidence_zone, toString(payload.confidence_zone));

  const thresholdRowsRaw = Array.isArray(payload.threshold_analysis)
    ? payload.threshold_analysis
    : [];
  const thresholdAnalysis = thresholdRowsRaw
    .filter(isRecord)
    .map((row) => ({
      threshold: toNumber(row.threshold, originalThreshold),
      decision: toDecision(row.decision, originalDecision),
    }));

  const variationRowsRaw = Array.isArray(payload.variations) ? payload.variations : [];
  const variations = variationRowsRaw
    .filter(isRecord)
    .map((row, index) => {
      const label = toString(row.label, toString(row.variation, `variation_${index + 1}`));
      const score = toNumber(row.score, originalScore);
      const decision = toDecision(row.decision, originalDecision);
      const changed = typeof row.changed === "boolean" ? row.changed : decision !== originalDecision;

      return {
        label,
        score,
        decision,
        changed,
      };
    });

  const insightsRaw = isRecord(payload.insights) ? payload.insights : {};
  const riskRaw = isRecord(payload.risk) ? payload.risk : {};
  const reasonTags = toStringArray(
    insightsRaw.reason_tags,
    toStringArray(payload.reason_tags, []),
  );

  const insights = {
    instability: Boolean(insightsRaw.instability),
    bias_detected: Boolean(insightsRaw.bias_detected),
    risk_score: toNumber(insightsRaw.risk_score, toNumber(riskRaw.score, 0)),
    reason_tags: reasonTags,
  };

  const juryRaw = isRecord(payload.ai_jury_view) ? payload.ai_jury_view : null;
  const aiJuryView = juryRaw
    ? {
      auditor: toString(juryRaw.auditor),
      challenger: toString(juryRaw.challenger),
      judge: toString(juryRaw.judge),
    }
    : undefined;

  return {
    original: {
      score: originalScore,
      decision: originalDecision,
      threshold: originalThreshold,
      ...(confidenceZone ? { confidence_zone: confidenceZone } : {}),
    },
    threshold_analysis: thresholdAnalysis,
    variations,
    insights,
    explanation: toString(payload.explanation),
    appeal: toString(payload.appeal),
    ...(aiJuryView ? { ai_jury_view: aiJuryView } : {}),
  };
};

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

  const raw = (await response.json()) as unknown;
  return normalizeAuditResponse(raw, payload);
}
