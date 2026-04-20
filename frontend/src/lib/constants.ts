import { AuditPreset, AuditProfile, DomainOption, DomainType } from "@/types/audit";

export const APP_NAME = "DecisioLens";

export const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/", label: "Overview" },
  { href: "/audit", label: "Audit Workspace" },
  { href: "/results", label: "Results" },
];

export const DOMAIN_OPTIONS: DomainOption[] = [
  {
    value: "hiring",
    label: "Hiring",
    description: "Assess AI-driven hiring decisions for fairness and instability.",
  },
  {
    value: "lending",
    label: "Lending",
    description: "Audit automated credit decisions under threshold stress.",
  },
  {
    value: "insurance",
    label: "Insurance",
    description: "Detect sensitivity in underwriting and claim decision scoring.",
  },
  {
    value: "education",
    label: "Education",
    description: "Review admissions and scholarship decision consistency.",
  },
];

export const DEFAULT_DOMAIN: DomainType = "hiring";

export const DEFAULT_PROFILE: AuditProfile = {
  name: "Alex Kumar",
  score: 72,
  experience: 4,
  gender: "male",
  location: "Bengaluru",
  college: "IIT Bombay",
};

export const DEFAULT_THRESHOLD = 0.5;

export const AUDIT_PRESETS: AuditPreset[] = [
  {
    id: "borderline-hiring",
    title: "Borderline Hiring Case",
    description:
      "Near-boundary score where small threshold shifts may flip the decision.",
    domain: "hiring",
    threshold: 0.5,
    profile: {
      name: "Riya Shah",
      score: 66,
      experience: 3,
      gender: "female",
      location: "Mumbai",
      college: "BITS Pilani",
    },
  },
  {
    id: "high-risk-lending",
    title: "High Risk Lending",
    description:
      "Moderate score with low experience to demonstrate medium/high risk behavior.",
    domain: "lending",
    threshold: 0.58,
    profile: {
      name: "Imran Sheikh",
      score: 61,
      experience: 1,
      gender: "male",
      location: "Delhi",
      college: "NIT Trichy",
    },
  },
  {
    id: "stable-candidate",
    title: "Stable High Confidence",
    description:
      "High score and experience profile that should remain stable under variations.",
    domain: "education",
    threshold: 0.5,
    profile: {
      name: "Neha Rao",
      score: 88,
      experience: 9,
      gender: "female",
      location: "Hyderabad",
      college: "IISc Bengaluru",
    },
  },
];

export const AUDIT_SESSION_KEY = "decisiolens:last-audit-session";

export const AUDIT_DRAFT_KEY = "decisiolens:audit-draft";

export const VARIATION_LABELS: Record<string, string> = {
  baseline: "Baseline",
  gender_swap: "Gender Swap",
  location_change: "Location Change",
  college_change: "College Change",
};

export const REASON_TAG_LABELS: Record<string, string> = {
  threshold_sensitive: "Threshold Sensitive",
  profile_instability: "Profile Instability",
  location_sensitive: "Location Sensitive",
  demographic_sensitive: "Demographic Sensitive",
  education_sensitive: "Education Sensitive",
  score_instability: "Score Instability",
  bias_detected: "Bias Detected",
};
