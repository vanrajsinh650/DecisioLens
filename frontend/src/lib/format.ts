import { REASON_TAG_LABELS, VARIATION_LABELS } from "@/lib/constants";

export const formatPercent = (value: number, digits = 1): string => {
  if (!Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(digits)}%`;
};

export const formatThreshold = (value: number): string => {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(2);
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

export const normalizeRiskTone = (level: string): "stable" | "caution" | "risk" => {
  const normalized = level.toLowerCase();
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
