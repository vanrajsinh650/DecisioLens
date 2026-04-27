import { AuditRequest, AuditResponse, Decision } from "@/types/audit";

const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Lazily resolve API config at call time, not import time.
 * This prevents Next.js SSG prerendering from crashing when
 * client-side env vars are unavailable during static generation.
 */
function getApiConfig(): { base: string; key: string } {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  const key = process.env.NEXT_PUBLIC_API_KEY;

  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE is required");
  }
  if (!key) {
    throw new Error("NEXT_PUBLIC_API_KEY is required");
  }

  return { base, key };
}

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

  const next = Object.entries(value).reduce<NonNullable<AuditResponse["variations"][number]["profile"]>>((profile, [key, item]) => {
    if (typeof item === "string" || typeof item === "boolean" || item === null) {
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

const requireRecord = (value: unknown, label: string): UnknownRecord => {
  if (!isRecord(value)) throw new Error(`Invalid audit response from server: missing ${label}`);
  return value;
};

const requireArray = (value: unknown, label: string): unknown[] => {
  if (!Array.isArray(value)) throw new Error(`Invalid audit response from server: missing ${label}`);
  return value;
};

const requireNumber = (value: unknown, label: string): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) throw new Error(`Invalid audit response from server: invalid ${label}`);
  return numeric;
};

const requireString = (value: unknown, label: string): string => {
  if (typeof value !== "string") throw new Error(`Invalid audit response from server: invalid ${label}`);
  return value;
};

const requireDecision = (value: unknown, label: string): Decision => {
  if (value === "ACCEPT" || value === "REJECT") return value;
  throw new Error(`Invalid audit response from server: invalid ${label}`);
};

const normalizeAuditResponse = (raw: unknown, request: AuditRequest): AuditResponse => {
  const payload = requireRecord(raw, "payload");

  if (
    !isRecord(payload.original)
    || !Array.isArray(payload.threshold_analysis)
    || !Array.isArray(payload.variations)
    || !isRecord(payload.insights)
    || typeof payload.explanation !== "string"
    || typeof payload.appeal !== "string"
  ) {
    throw new Error("Invalid audit response from server");
  }

  const requestProfile = request.profile;
  const originalRaw = requireRecord(payload.original, "original");
  const originalScore = requireNumber(originalRaw.score, "original.score");
  const originalDecision = requireDecision(originalRaw.decision, "original.decision");
  const originalThreshold = toNumber(originalRaw.threshold, request.threshold);
  const confidenceZone = toString(originalRaw.confidence_zone, toString(payload.confidence_zone));

  const thresholdRowsRaw = requireArray(payload.threshold_analysis, "threshold_analysis");
  const thresholdAnalysis = thresholdRowsRaw
    .filter(isRecord)
    .map((row) => ({
      threshold: requireNumber(row.threshold, "threshold_analysis.threshold"),
      decision: requireDecision(row.decision, "threshold_analysis.decision"),
    }));

  const variationRowsRaw = requireArray(payload.variations, "variations");
  const variations = variationRowsRaw
    .filter(isRecord)
    .map((row, index) => {
      const variationName = requireString(row.variation, "variations.variation");
      const label = toString(row.label, variationName || `variation_${index + 1}`);
      const variation = variationName || (index === 0 ? "baseline" : `variation_${index + 1}`);
      const score = requireNumber(row.score, "variations.score");
      const decision = requireDecision(row.decision, "variations.decision");
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

  const insightsRaw = requireRecord(payload.insights, "insights");
  const riskRaw = isRecord(payload.risk) ? payload.risk : {};
  const reasonTags = toStringArray(
    insightsRaw.reason_tags,
    toStringArray(payload.reason_tags, []),
  );

  const insights = {
    instability: Boolean(insightsRaw.instability),
    bias_detected: Boolean(insightsRaw.bias_detected),
    confidence_zone: toString(insightsRaw.confidence_zone, confidenceZone),
    risk_score: requireNumber(insightsRaw.risk_score ?? riskRaw.score, "insights.risk_score"),
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
    explanation: requireString(payload.explanation, "explanation"),
    appeal: requireString(payload.appeal, "appeal"),
    ...(explanationRequest ? { explanation_request: explanationRequest } : {}),
    ...(recourse && recourse.length > 0 ? { recourse } : {}),
    ...(humanReview ? { human_review: humanReview } : {}),
    ...(aiJuryView ? { ai_jury_view: aiJuryView } : {}),
  };
};

export async function runAudit(payload: AuditRequest): Promise<AuditResponse> {
  const { base: API_BASE, key: API_KEY } = getApiConfig();
  const backendPayload = buildBackendPayload(payload);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE.replace(/\/+$/, "")}/audit/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(backendPayload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Audit failed (${response.status}): ${text || "Unknown error"}`);
    }

    const raw = (await response.json()) as unknown;
    return normalizeAuditResponse(raw, payload);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Audit request timed out. Please try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}
