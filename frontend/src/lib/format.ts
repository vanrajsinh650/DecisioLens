import { REASON_TAG_LABELS, VARIATION_LABELS } from "@/lib/constants";

const number2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const number0 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const number1 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const dateTime = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatNumber = (value: number, digits = 2): string => {
  if (!Number.isFinite(value)) return "-";
  if (digits === 0) return number0.format(value);
  if (digits === 1) return number1.format(value);
  return number2.format(value);
};

export const formatDateTime = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return dateTime.format(date);
};

export const formatPercent = (value: number, digits = 1): string => {
  if (!Number.isFinite(value)) return "-";
  return `${formatNumber(value * 100, digits)}%`;
};

export const formatThreshold = (value: number): string => {
  if (!Number.isFinite(value)) return "-";
  return formatNumber(value, 2);
};

export const formatSignedNumber = (value: number, digits = 0, suffix = ""): string => {
  if (!Number.isFinite(value)) return "-";

  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const base = formatNumber(Math.abs(value), digits);

  return `${sign}${base}${suffix}`;
};

export const formatRiskLabel = (level: string): string => {
  const normalized = String(level).trim();
  if (!normalized) return "Risk";

  const numericLevel = Number(normalized);
  if (Number.isFinite(numericLevel)) {
    if (numericLevel <= 30) return "🟢 All Clear";
    if (numericLevel <= 60) return "🟡 Too Close To Call";
    return "🔴 High Risk";
  }

  const lower = normalized.toLowerCase();
  if (lower === "safe") return "🟢 All Clear";
  if (lower === "borderline") return "🟡 Too Close To Call";
  if (lower === "high_risk" || lower === "high") return "🔴 High Risk";
  if (lower === "low") return "🟢 All Clear";
  if (lower === "medium") return "🟡 Too Close To Call";

  return normalized;
};

export const formatRiskScore = (score: number): string => {
  if (!Number.isFinite(score)) return "N/A";
  return `${formatNumber(score, 0)}/100`;
};

export const formatVariationName = (name: string): string => {
  return VARIATION_LABELS[name] ?? name.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatReasonTag = (tag: string): string => {
  return REASON_TAG_LABELS[tag] ?? tag.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export type SignalTone = "safe" | "warn" | "risk" | "neutral" | "amber";

export const normalizeDecisionTone = (
  value: string,
): SignalTone => {
  const upper = value.toUpperCase();
  if (upper === "ACCEPT") return "safe";
  if (upper === "REJECT") return "risk";
  return "warn";
};

export const normalizeRiskTone = (level: string | number): SignalTone => {
  if (typeof level === "number" && Number.isFinite(level)) {
    if (level <= 30) return "safe";
    if (level <= 60) return "warn";
    return "risk";
  }

  const normalized = String(level).toLowerCase().trim();
  const numericLevel = Number(normalized);

  if (Number.isFinite(numericLevel)) {
    if (numericLevel <= 30) return "safe";
    if (numericLevel <= 60) return "warn";
    return "risk";
  }

  if (normalized === "low" || normalized === "safe") return "safe";
  if (normalized === "high" || normalized === "high_risk") return "risk";
  return "warn";
};

export const normalizeConfidenceTone = (
  confidence: string,
): SignalTone => {
  const normalized = confidence.toLowerCase();
  if (normalized.includes("high")) return "safe";
  if (normalized.includes("borderline")) return "warn";
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

/** Signal-color system using CSS custom properties from the spec */
export const signalClasses: Record<
  SignalTone,
  { bg: string; text: string; border: string; soft: string; colorVar: string; surfaceVar: string; borderColorVar: string }
> = {
  safe: {
    bg: "bg-a-green",
    text: "text-a-green",
    border: "border-a-green/40",
    soft: "bg-[var(--aurora-green-surface)]",
    colorVar: "var(--aurora-green)",
    surfaceVar: "var(--aurora-green-surface)",
    borderColorVar: "hsl(145, 65%, 24%)",
  },
  warn: {
    bg: "bg-a-teal",
    text: "text-a-teal",
    border: "border-a-teal/40",
    soft: "bg-[var(--aurora-teal-surface)]",
    colorVar: "var(--aurora-teal)",
    surfaceVar: "var(--aurora-teal-surface)",
    borderColorVar: "hsl(172, 60%, 24%)",
  },
  risk: {
    bg: "bg-a-crimson",
    text: "text-a-crimson",
    border: "border-a-crimson/40",
    soft: "bg-[var(--aurora-crimson-surface)]",
    colorVar: "var(--aurora-crimson)",
    surfaceVar: "var(--aurora-crimson-surface)",
    borderColorVar: "hsl(350, 68%, 24%)",
  },
  neutral: {
    bg: "bg-a-violet",
    text: "text-a-violet",
    border: "border-a-violet/40",
    soft: "bg-[var(--aurora-violet-surface)]",
    colorVar: "var(--aurora-violet)",
    surfaceVar: "var(--aurora-violet-surface)",
    borderColorVar: "hsl(265, 65%, 24%)",
  },
  amber: {
    bg: "bg-a-amber",
    text: "text-a-amber",
    border: "border-a-amber/40",
    soft: "bg-[var(--aurora-amber-surface)]",
    colorVar: "var(--aurora-amber)",
    surfaceVar: "var(--aurora-amber-surface)",
    borderColorVar: "hsl(38, 82%, 24%)",
  },
};

// Legacy compatibility alias
export const toneClasses: Record<
  "stable" | "caution" | "risk" | "info",
  { soft: string; text: string; border: string }
> = {
  stable: {
    soft: signalClasses.safe.soft,
    text: signalClasses.safe.text,
    border: signalClasses.safe.border,
  },
  caution: {
    soft: signalClasses.warn.soft,
    text: signalClasses.warn.text,
    border: signalClasses.warn.border,
  },
  risk: {
    soft: signalClasses.risk.soft,
    text: signalClasses.risk.text,
    border: signalClasses.risk.border,
  },
  info: {
    soft: signalClasses.neutral.soft,
    text: signalClasses.neutral.text,
    border: signalClasses.neutral.border,
  },
};
