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

const toProfilePatch = (value: unknown): AuditResponse["variations"][number]["profile"] => {
  if (!isRecord(value)) return undefined;

  const next = Object.entries(value).reduce<Record<string, string | number>>((profile, [key, item]) => {
    if (typeof item === "string") {
      profile[key] = item;
      return profile;
    }

    if (typeof item === "number" || Number.isFinite(Number(item))) {
      profile[key] = toNumber(item);
      return profile;
    }

    return profile;
  }, {});

  return Object.keys(next).length > 0 ? next : undefined;
};

/**
 * Build the backend payload from the frontend AuditRequest.
 *
 * The backend now accepts domain-specific profiles directly  
 * no field remapping needed. We just inject the domain into the
 * profile so the backend scoring engine can dispatch correctly.
 */
const buildBackendPayload = (payload: AuditRequest): { domain: string; profile: Record<string, unknown>; threshold: number } => {
  return {
    domain: payload.domain,
    profile: payload.profile as Record<string, unknown>,
    threshold: payload.threshold,
  };
};

const normalizeAuditResponse = (raw: unknown, request: AuditRequest): AuditResponse => {
  const payload = isRecord(raw) ? raw : {};

  const requestProfile = request.profile;
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
      const variationName = toString(row.variation, "");
      const label = toString(row.label, variationName || `variation_${index + 1}`);
      const variation = variationName || (index === 0 ? "baseline" : `variation_${index + 1}`);
      const score = toNumber(row.score, originalScore);
      const decision = toDecision(row.decision, originalDecision);
      const changed = typeof row.changed === "boolean" ? row.changed : decision !== originalDecision;
      const profile = toProfilePatch(row.profile);

      return {
        variation,
        label,
        score,
        decision,
        changed,
        ...(profile ? { profile } : {}),
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
    risk_level: toString(insightsRaw.risk_level, toString(riskRaw.level)),
    reason_tags: reasonTags,
  };

  // ── New: stability zone ──────────────────────────────────────────
  const stabilityRaw = isRecord(payload.stability_zone) ? payload.stability_zone : null;
  const stabilityZone = stabilityRaw
    ? {
      zones: Array.isArray(stabilityRaw.zones)
        ? stabilityRaw.zones.filter(isRecord).map((z) => ({
          start: toNumber(z.start),
          end: toNumber(z.end),
          label: toString(z.label, "ACCEPT"),
        }))
        : [],
      summary: toString(stabilityRaw.summary),
    }
    : undefined;

  // ── New: impact analysis ─────────────────────────────────────────
  const impactAnalysis = Array.isArray(payload.impact_analysis)
    ? payload.impact_analysis.filter(isRecord).map((item) => ({
      variable: toString(item.variable),
      delta: toNumber(item.delta),
      direction: toString(item.direction, "none") as "positive" | "negative" | "none",
      decision_changed: Boolean(item.decision_changed),
    }))
    : undefined;

  // ── New: structured risk ─────────────────────────────────────────
  const risk = isRecord(payload.risk)
    ? {
      score: toNumber(payload.risk.score),
      level: toString(payload.risk.level, "SAFE") as "SAFE" | "BORDERLINE" | "HIGH_RISK",
      reasons: toStringArray(payload.risk.reasons),
    }
    : undefined;

  const juryRaw = isRecord(payload.ai_jury_view) ? payload.ai_jury_view : null;
  const aiJuryView = juryRaw
    ? {
      auditor: toString(juryRaw.auditor),
      challenger: toString(juryRaw.challenger),
      judge: toString(juryRaw.judge),
    }
    : undefined;

  // Normalize governance fields
  const explanationRequest = typeof payload.explanation_request === "string"
    ? payload.explanation_request
    : undefined;

  const recourse = Array.isArray(payload.recourse)
    ? payload.recourse.map((r: unknown) => {
      const item = isRecord(r) ? r : {};
      return { action: toString(item.action), impact: toString(item.impact) };
    })
    : undefined;

  const humanReviewRaw = isRecord(payload.human_review) ? payload.human_review : null;
  const humanReview = humanReviewRaw
    ? {
      level: toString(humanReviewRaw.level, "NOT_REQUIRED") as "REQUIRED" | "RECOMMENDED" | "NOT_REQUIRED",
      reason: toString(humanReviewRaw.reason),
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
    ...(stabilityZone ? { stability_zone: stabilityZone } : {}),
    ...(impactAnalysis && impactAnalysis.length > 0 ? { impact_analysis: impactAnalysis } : {}),
    ...(risk ? { risk } : {}),
    insights,
    explanation: toString(payload.explanation),
    appeal: toString(payload.appeal),
    ...(explanationRequest ? { explanation_request: explanationRequest } : {}),
    ...(recourse && recourse.length > 0 ? { recourse } : {}),
    ...(humanReview ? { human_review: humanReview } : {}),
    ...(aiJuryView ? { ai_jury_view: aiJuryView } : {}),
  };
};

export async function runAudit(payload: AuditRequest): Promise<AuditResponse> {
  const backendPayload = buildBackendPayload(payload);

  const response = await fetch(`${API_BASE.replace(/\/+$/, "")}/audit/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(backendPayload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Audit failed (${response.status}): ${text || "Unknown error"}`);
  }

  const raw = (await response.json()) as unknown;
  return normalizeAuditResponse(raw, payload);
}
