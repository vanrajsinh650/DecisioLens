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

const toDomainAwareBackendPayload = (payload: AuditRequest): AuditRequest => {
  if (payload.domain === "hiring") {
    return payload;
  }

  const rawScore = Number(payload.profile.score ?? payload.profile.credit_score ?? 50);
  const rawExperience = Number(
    payload.profile.experience
    ?? payload.profile.income
    ?? payload.profile.grade_12
    ?? payload.profile.loan_amount
    ?? 3,
  );

  const normalizedScore = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, rawScore > 100 ? rawScore / 9 : rawScore))
    : 50;
  const normalizedExperience = Number.isFinite(rawExperience)
    ? Math.max(0, Math.min(50, Math.round(rawExperience / 2)))
    : 3;

  return {
    ...payload,
    profile: {
      ...payload.profile,
      name: String(payload.profile.name ?? "Case"),
      score: normalizedScore,
      experience: normalizedExperience,
      gender: String(payload.profile.gender ?? payload.profile.group ?? "unspecified"),
      location: String(payload.profile.location ?? "Unknown"),
      college: String(
        payload.profile.college
        ?? payload.profile.employment_type
        ?? payload.profile.category
        ?? payload.profile.income_band
        ?? "N/A",
      ),
    },
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
      const score = toNumber(row.score, originalScore);
      const decision = toDecision(row.decision, originalDecision);
      const changed = typeof row.changed === "boolean" ? row.changed : decision !== originalDecision;

      const originalProfile = toProfilePatch(row.profile);
      const profile = originalProfile
        ?? (variationName === "baseline"
          ? { ...requestProfile }
          : variationName === "gender_swap"
            ? {
              ...requestProfile,
              gender: String(requestProfile.gender).toLowerCase() === "female" ? "male" : "female",
            }
            : variationName === "location_change"
              ? {
                ...requestProfile,
                location: String(requestProfile.location) === "Mumbai" ? "Delhi" : "Mumbai",
              }
              : variationName === "college_change"
                ? {
                  ...requestProfile,
                  college: String(requestProfile.college) === "Tier 1" ? "Tier 2" : "Tier 1",
                }
                : undefined);

      return {
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
  const backendPayload = toDomainAwareBackendPayload(payload);

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
