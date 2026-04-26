import { AUDIT_DRAFT_KEY, AUDIT_SESSION_KEY, DEFAULT_DOMAIN } from "@/lib/constants";
import { getDomainConfig } from "@/lib/domains/registry";
import { AuditProfile, AuditRequest, AuditSession, DomainType } from "@/types/audit";

interface AuditDraft {
    domain: DomainType;
    profile: AuditProfile;
    threshold: number;
}

/** All domains the backend supports — must stay in sync with backend SUPPORTED_DOMAINS. */
const SUPPORTED_STORED_DOMAINS = new Set<DomainType>([
    "hiring", "lending", "education", "insurance", "welfare",
]);

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const clamp = (value: number, min: number, max: number): number => {
    return Math.min(max, Math.max(min, value));
};

const normalizeDomain = (value: unknown): DomainType => {
    if (typeof value === "string" && SUPPORTED_STORED_DOMAINS.has(value as DomainType)) {
        return value as DomainType;
    }

    return DEFAULT_DOMAIN;
};

const normalizeThreshold = (value: unknown, fallback: number): number => {
    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numericValue)) {
        return fallback;
    }

    return clamp(numericValue, 0, 1);
};

const normalizeProfile = (value: unknown, domain: DomainType): AuditProfile => {
    const defaults = getDomainConfig(domain).defaultProfile;

    if (!isRecord(value)) {
        return { ...defaults };
    }

    const merged: AuditProfile = { ...defaults };

    Object.entries(value).forEach(([key, fieldValue]) => {
        if (typeof fieldValue === "string" || typeof fieldValue === "number") {
            merged[key] = fieldValue;
        }
    });

    return merged;
};

const normalizeRequest = (value: unknown, domain: DomainType): AuditRequest => {
    const fallbackThreshold = getDomainConfig(domain).defaultThreshold;

    if (!isRecord(value)) {
        return {
            domain,
            profile: normalizeProfile(null, domain),
            threshold: fallbackThreshold,
        };
    }

    const requestDomain = normalizeDomain(value.domain ?? domain);

    return {
        domain: requestDomain,
        profile: normalizeProfile(value.profile, requestDomain),
        threshold: normalizeThreshold(value.threshold, getDomainConfig(requestDomain).defaultThreshold),
    };
};

const readJson = (key: string): unknown | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as unknown;
    } catch {
        return null;
    }
};

export function readAuditDraft(): AuditDraft | null {
    const parsed = readJson(AUDIT_DRAFT_KEY);
    if (!isRecord(parsed)) {
        return null;
    }

    const domain = normalizeDomain(parsed.domain);

    return {
        domain,
        profile: normalizeProfile(parsed.profile, domain),
        threshold: normalizeThreshold(parsed.threshold, getDomainConfig(domain).defaultThreshold),
    };
}

export function saveAuditDraft(draft: AuditDraft): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(AUDIT_DRAFT_KEY, JSON.stringify(draft));
}

export function clearAuditDraft(): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(AUDIT_DRAFT_KEY);
}

export function readAuditSession(): AuditSession | null {
    const parsed = readJson(AUDIT_SESSION_KEY);
    if (!isRecord(parsed) || !isRecord(parsed.response)) {
        return null;
    }

    const domain = normalizeDomain(parsed.domain);
    const request = normalizeRequest(parsed.request, domain);

    return {
        domain,
        submittedAt:
            typeof parsed.submittedAt === "string" && parsed.submittedAt.trim().length > 0
                ? parsed.submittedAt
                : new Date().toISOString(),
        request,
        response: parsed.response as unknown as AuditSession["response"],
    };
}

export function saveAuditSession(session: AuditSession): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(AUDIT_SESSION_KEY, JSON.stringify(session));
}

export function clearAuditSession(): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(AUDIT_SESSION_KEY);
}
