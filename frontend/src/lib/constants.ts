import { AuditPreset, AuditProfile, DomainOption, DomainType } from "@/types/audit";

export const APP_NAME = "DecisioLens";

export const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/audit", label: "Test" },
  { href: "/results", label: "Report" },
];

export const DOMAIN_OPTIONS: DomainOption[] = [
  {
    value: "hiring",
    label: "Hiring (active)",
    description: "MVP domain for live auditing demos.",
    status: "active",
  },
  {
    value: "lending",
    label: "Lending (coming soon)",
    description: "Planned for threshold and scenario-based finance audits.",
    status: "coming-soon",
  },
  {
    value: "education",
    label: "Education (coming soon)",
    description: "Planned for admissions and scholarship decision reviews.",
    status: "coming-soon",
  },
];

export const DEFAULT_DOMAIN: DomainType = "hiring";

export const DEFAULT_PROFILE: AuditProfile = {
  name: "Alex Kumar",
  score: 72,
  experience: 4,
  gender: "Male",
  location: "Bengaluru",
  college: "Tier 1",
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
      gender: "Female",
      location: "Mumbai",
      college: "Tier 1",
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
      gender: "Male",
      location: "Delhi",
      college: "Tier 2",
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
      gender: "Female",
      location: "Hyderabad",
      college: "Tier 1",
    },
  },
];

export const AUDIT_SESSION_KEY = "decisiolens:last-audit-session";

export const AUDIT_DRAFT_KEY = "decisiolens:audit-draft";

export const VARIATION_LABELS: Record<string, string> = {
  baseline: "Original",
  gender_swap: "Gender Swapped",
  location_change: "Location Changed",
  college_change: "College Tier Changed",
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
