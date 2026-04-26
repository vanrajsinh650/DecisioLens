export type Decision = "ACCEPT" | "REJECT";

export type DomainType = "hiring" | "lending" | "education" | "insurance" | "welfare" | "custom";

export type TrustVerdict = "STABLE" | "UNSTABLE" | "HIGH_RISK";

export type ThemePreference = "dark" | "light";

export type AuditProfile = Record<string, string | number>;

export interface AuditRequest {
  domain: DomainType;
  profile: AuditProfile;
  threshold: number;
}

export interface OriginalDecision {
  score: number;
  decision: Decision;
  threshold: number;
  confidence_zone?: string;
}

export interface ThresholdAnalysisItem {
  threshold: number;
  decision: Decision;
}

export interface VariationResult {
  variation: string;
  label: string;
  score: number;
  decision: Decision;
  changed: boolean;
  profile?: Partial<AuditProfile>;
}

// ── New: Decision Stability Zone ────────────────────────────────────

export interface StabilityZoneBand {
  start: number;
  end: number;
  label: string;
}

export interface StabilityZone {
  zones: StabilityZoneBand[];
  summary: string;
}

// ── New: Impact Analysis ────────────────────────────────────────────

export interface ImpactItem {
  variable: string;
  delta: number;
  direction: "positive" | "negative" | "none";
  decision_changed: boolean;
}

// ── Risk Assessment (updated with reasons) ──────────────────────────

export interface RiskAssessment {
  score: number;
  level: "SAFE" | "BORDERLINE" | "HIGH_RISK";
  reasons: string[];
}

export interface AIJuryView {
  auditor: string;
  challenger: string;
  judge: string;
}

export interface RecourseItem {
  action: string;
  impact: string;
}

export interface HumanReview {
  level: "REQUIRED" | "RECOMMENDED" | "NOT_REQUIRED";
  reason: string;
}

export interface Insights {
  instability: boolean;
  bias_detected: boolean;
  risk_score: number;
  risk_level?: string;
  reason_tags: string[];
}

export interface AuditResult {
  original: OriginalDecision;
  threshold_analysis: ThresholdAnalysisItem[];
  variations: VariationResult[];
  stability_zone?: StabilityZone;
  impact_analysis?: ImpactItem[];
  risk?: RiskAssessment;
  insights: Insights;
  explanation: string;
  appeal: string;
  explanation_request?: string;
  recourse?: RecourseItem[];
  human_review?: HumanReview;
  ai_jury_view?: AIJuryView;
}

export type ThresholdAnalysisRow = ThresholdAnalysisItem;
export type AuditInsights = Insights;
export type AuditResponse = AuditResult;

export interface AuditSession {
  domain: DomainType;
  submittedAt: string;
  request: AuditRequest;
  response: AuditResult;
}

export interface StoredAuditSession extends AuditSession {
  id: string;
  trustVerdict: TrustVerdict;
}

export interface DomainOption {
  value: DomainType;
  label: string;
  description: string;
  status?: "active";
}

export interface AuditPreset {
  id: string;
  title: string;
  description: string;
  domain: DomainType;
  profile: AuditProfile;
  threshold: number;
}
