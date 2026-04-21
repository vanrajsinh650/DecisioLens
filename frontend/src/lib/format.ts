import { REASON_TAG_LABELS, VARIATION_LABELS } from "@/lib/constants";

export const formatPercent = (value: number, digits = 1): string => {
  if (!Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(digits)}%`;
};

export const formatThreshold = (value: number): string => {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(2);
};

export const formatRiskLabel = (level: string): string => {
  const normalized = String(level).trim();
  if (!normalized) return "Risk";

  const numericLevel = Number(normalized);
  if (Number.isFinite(numericLevel)) {
    if (numericLevel <= 30) return "Low Risk";
    if (numericLevel <= 70) return "Medium Risk";
    return "High Risk";
  }

  const titleCase = normalized
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return titleCase.includes("Risk") ? titleCase : `${titleCase} Risk`;
};

export const formatRiskScore = (score: number): string => {
  if (!Number.isFinite(score)) return "N/A";
  return `${Math.round(score)}/100`;
};

export const formatVariationName = (name: string): string => {
  return VARIATION_LABELS[name] ?? name.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatReasonTag = (tag: string): string => {
  return REASON_TAG_LABELS[tag] ?? tag.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export const normalizeDecisionTone = (
  value: string,
): "stable" | "risk" | "caution" => {
  const upper = value.toUpperCase();
  if (upper === "ACCEPT") return "stable";
  if (upper === "REJECT") return "risk";
  return "caution";
};

export const normalizeRiskTone = (level: string | number): "stable" | "caution" | "risk" => {
  if (typeof level === "number" && Number.isFinite(level)) {
    if (level <= 30) return "stable";
    if (level <= 70) return "caution";
    return "risk";
  }

  const normalized = String(level).toLowerCase().trim();
  const numericLevel = Number(normalized);

  if (Number.isFinite(numericLevel)) {
    if (numericLevel <= 30) return "stable";
    if (numericLevel <= 70) return "caution";
    return "risk";
  }

  if (normalized === "low") return "stable";
  if (normalized === "high") return "risk";
  return "caution";
};

export const normalizeConfidenceTone = (
  confidence: string,
): "stable" | "caution" | "risk" => {
  const normalized = confidence.toLowerCase();
  if (normalized.includes("high")) return "stable";
  if (normalized.includes("borderline")) return "caution";
  return "risk";
};

const HUMAN_REVIEW_REASON_TAGS = new Set([
  "bias_detected",
  "threshold_sensitive",
  "profile_instability",
  "score_instability",
  "demographic_sensitive",
  "education_sensitive",
  "location_sensitive",
]);

interface HumanReviewSignalInput {
  riskScore: number;
  reasonTags?: string[];
  biasDetected?: boolean;
  instabilityDetected?: boolean;
  confidenceZone?: string;
}

export const shouldRecommendHumanReview = ({
  riskScore,
  reasonTags = [],
  biasDetected = false,
  instabilityDetected = false,
  confidenceZone = "",
}: HumanReviewSignalInput): boolean => {
  const hasSensitiveReasonTag = reasonTags.some((tag) => HUMAN_REVIEW_REASON_TAGS.has(tag));
  const normalizedConfidenceZone = confidenceZone.toLowerCase();
  const confidenceIsBorderline =
    normalizedConfidenceZone.includes("borderline") || normalizedConfidenceZone.includes("unstable");

  return (
    normalizeRiskTone(riskScore) === "risk"
    || biasDetected
    || instabilityDetected
    || hasSensitiveReasonTag
    || confidenceIsBorderline
  );
};

export const toneClasses: Record<
  "stable" | "caution" | "risk" | "info",
  { soft: string; text: string; border: string }
> = {
  stable: {
    soft: "bg-signal-stableSoft/60",
    text: "text-signal-stable",
    border: "border-signal-stable/40",
  },
  caution: {
    soft: "bg-signal-cautionSoft/60",
    text: "text-signal-caution",
    border: "border-signal-caution/40",
  },
  risk: {
    soft: "bg-signal-riskSoft/60",
    text: "text-signal-risk",
    border: "border-signal-risk/40",
  },
  info: {
    soft: "bg-signal-infoSoft/60",
    text: "text-signal-info",
    border: "border-signal-info/40",
  },
};
