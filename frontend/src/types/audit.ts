export type Decision = "ACCEPT" | "REJECT";

export type DomainType = "hiring" | "lending" | "education";

export interface AuditProfile {
  name: string;
  score: number;
  experience: number;
  gender: string;
  location: string;
  college: string;
}

export interface AuditRequest {
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
  label: string;
  score: number;
  decision: Decision;
  changed: boolean;
}

export interface AIJuryView {
  auditor: string;
  challenger: string;
  judge: string;
}

export interface Insights {
  instability: boolean;
  bias_detected: boolean;
  risk_score: number;
  reason_tags: string[];
}

export interface AuditResult {
  original: OriginalDecision;
  threshold_analysis: ThresholdAnalysisItem[];
  variations: VariationResult[];
  insights: Insights;
  explanation: string;
  appeal: string;
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

export interface DomainOption {
  value: DomainType;
  label: string;
  description: string;
  status?: "active" | "coming-soon";
}

export interface AuditPreset {
  id: string;
  title: string;
  description: string;
  domain: DomainType;
  profile: AuditProfile;
  threshold: number;
}
