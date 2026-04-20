export type Decision = "ACCEPT" | "REJECT";

export type DomainType = "hiring" | "lending" | "insurance" | "education";

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

export interface ThresholdAnalysisRow {
  threshold: number;
  decision: Decision;
}

export interface VariationResult {
  variation: string;
  score: number;
  decision: Decision;
}

export interface RiskAssessment {
  score: number;
  level: "Low" | "Medium" | "High" | string;
}

export interface AIJuryView {
  auditor: string;
  challenger: string;
  judge: string;
}

export interface AuditInsights {
  instability: boolean;
  bias_detected: boolean;
  confidence_zone: string;
  risk_score: number;
  risk_level: string;
  reason_tags: string[];
}

export interface AuditResponse {
  original: {
    score: number;
    decision: Decision;
  };
  threshold_analysis: ThresholdAnalysisRow[];
  variations: VariationResult[];
  confidence_zone: string;
  risk: RiskAssessment;
  reason_tags: string[];
  ai_jury_view: AIJuryView;
  insights: AuditInsights;
  explanation: string;
  appeal: string;
}

export interface AuditSession {
  domain: DomainType;
  submittedAt: string;
  request: AuditRequest;
  response: AuditResponse;
}

export interface DomainOption {
  value: DomainType;
  label: string;
  description: string;
}

export interface AuditPreset {
  id: string;
  title: string;
  description: string;
  domain: DomainType;
  profile: AuditProfile;
  threshold: number;
}
