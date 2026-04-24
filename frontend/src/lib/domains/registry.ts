import { DomainConfig } from "@/lib/domains";
import { defaultCustomDomain, getCustomDomainConfig } from "@/lib/domains/custom";
import { educationDomain } from "@/lib/domains/education";
import { hiringDomain } from "@/lib/domains/hiring";
import { insuranceDomain } from "@/lib/domains/insurance";
import { lendingDomain } from "@/lib/domains/lending";
import { welfareDomain } from "@/lib/domains/welfare";
import { DomainOption, DomainType } from "@/types/audit";

export const DOMAIN_REGISTRY: Record<DomainType, DomainConfig> = {
    hiring: hiringDomain,
    lending: lendingDomain,
    education: educationDomain,
    insurance: insuranceDomain,
    welfare: welfareDomain,
    custom: defaultCustomDomain,
};

const STATIC_DOMAINS: DomainType[] = ["hiring", "lending", "education", "insurance", "welfare"];
const ALL_DOMAINS: DomainType[] = ["hiring", "lending", "education", "insurance", "welfare", "custom"];

export function getDomainConfig(domain: DomainType): DomainConfig {
    if (domain === "custom") {
        return getCustomDomainConfig();
    }

    return DOMAIN_REGISTRY[domain];
}

export function getDomainOptions(): DomainOption[] {
    return ALL_DOMAINS.map((domain) => {
        const config = getDomainConfig(domain);
        return {
            value: config.value,
            label: config.label,
            description: config.description,
            status: "active",
        };
    });
}

export function getAllStaticDomains(): DomainConfig[] {
    return STATIC_DOMAINS.map((domain) => DOMAIN_REGISTRY[domain]);
}
