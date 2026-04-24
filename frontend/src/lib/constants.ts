import { getAllStaticDomains, getDomainOptions } from "@/lib/domains/registry";
import { AuditPreset, AuditProfile, DomainOption, DomainType } from "@/types/audit";

export const APP_NAME = "DecisioLens";

export const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/audit", label: "Test" },
  { href: "/results", label: "Report" },
  { href: "/history", label: "History" },
  { href: "/batch", label: "Batch Audit" },
];

export const DOMAIN_OPTIONS: DomainOption[] = getDomainOptions();

export const DEFAULT_DOMAIN: DomainType = "hiring";

export const DEFAULT_PROFILE: AuditProfile = {
  ...getAllStaticDomains().find((domain) => domain.value === DEFAULT_DOMAIN)?.defaultProfile,
};

export const DEFAULT_THRESHOLD =
  getAllStaticDomains().find((domain) => domain.value === DEFAULT_DOMAIN)?.defaultThreshold ?? 0.5;

export const AUDIT_PRESETS: AuditPreset[] = getAllStaticDomains().flatMap((domain) => {
  return (domain.presets ?? []).map((preset) => ({
    ...preset,
    domain: domain.value,
  }));
});

export const AUDIT_SESSION_KEY = "decisiolens:last-audit-session";

export const AUDIT_DRAFT_KEY = "decisiolens:audit-draft";

export const AUDIT_HISTORY_KEY = "decisiolens:audit-history";

export const AUDIT_HISTORY_SELECTED_ID_KEY = "decisiolens:selected-history-id";

export const ONBOARDING_KEY = "decisiolens:onboarded";

export const THEME_KEY = "decisiolens:theme";

export const CUSTOM_DOMAIN_CONFIG_KEY = "decisiolens:custom-domain-config";

export const VARIATION_LABELS: Record<string, string> = getAllStaticDomains().reduce<Record<string, string>>(
  (allLabels, domain) => {
    return {
      ...allLabels,
      ...domain.variationLabels,
    };
  },
  {
    baseline: "Original",
  },
);

export const REASON_TAG_LABELS: Record<string, string> = {
  threshold_sensitive: "Threshold Sensitive",
  profile_instability: "Profile Instability",
  location_sensitive: "Location Sensitive",
  demographic_sensitive: "Demographic Sensitive",
  education_sensitive: "Education Sensitive",
  score_instability: "Score Instability",
  employment_sensitive: "Employment Sensitive",
  category_sensitive: "Category Sensitive",
  age_sensitive: "Age Sensitive",
  condition_sensitive: "Condition Sensitive",
  region_sensitive: "Region Sensitive",
  income_sensitive: "Income Sensitive",
  bias_detected: "Bias Detected",
};
