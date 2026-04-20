import {
    AUDIT_DRAFT_KEY,
    AUDIT_SESSION_KEY,
    DEFAULT_DOMAIN,
    DEFAULT_PROFILE,
    DEFAULT_THRESHOLD,
} from "@/lib/constants";
import { AuditProfile, AuditRequest, AuditSession, DomainType } from "@/types/audit";

interface AuditDraft {
    domain: DomainType;
    profile: AuditProfile;
    threshold: number;
}

interface DraftEnvelope {
    domain: unknown;
    profile: unknown;
    threshold: unknown;
}

interface SessionEnvelope {
    domain: unknown;
    submittedAt: unknown;
    request: unknown;
    response: unknown;
}

const DOMAIN_SET: Set<DomainType> = new Set(["hiring", "lending", "insurance", "education"]);

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const clamp = (value: number, min: number, max: number): number => {
    return Math.min(max, Math.max(min, value));
};

const normalizeString = (value: unknown, fallback: string): string => {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
};

const normalizeNumber = (
    value: unknown,
    fallback: number,
    min: number,
    max: number,
): number => {
    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numericValue)) return fallback;
    return clamp(numericValue, min, max);
};

const normalizeDomain = (value: unknown): DomainType => {
    if (typeof value === "string" && DOMAIN_SET.has(value as DomainType)) {
        return value as DomainType;
    }

    return DEFAULT_DOMAIN;
};

const normalizeProfile = (value: unknown): AuditProfile => {
    if (!isRecord(value)) {
        return { ...DEFAULT_PROFILE };
    }

    return {
        name: normalizeString(value.name, DEFAULT_PROFILE.name),
        score: normalizeNumber(value.score, DEFAULT_PROFILE.score, 0, 100),
        experience: Math.round(normalizeNumber(value.experience, DEFAULT_PROFILE.experience, 0, 50)),
        gender: normalizeString(value.gender, DEFAULT_PROFILE.gender),
        location: normalizeString(value.location, DEFAULT_PROFILE.location),
        college: normalizeString(value.college, DEFAULT_PROFILE.college),
    };
};

const normalizeRequest = (value: unknown): AuditRequest => {
    if (!isRecord(value)) {
        return {
            profile: { ...DEFAULT_PROFILE },
            threshold: DEFAULT_THRESHOLD,
        };
    }

    return {
        profile: normalizeProfile(value.profile),
        threshold: normalizeNumber(value.threshold, DEFAULT_THRESHOLD, 0, 1),
    };
};

const readJson = (key: string): unknown | null => {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as unknown;
    } catch {
        return null;
    }
};

const isDraftEnvelope = (value: unknown): value is DraftEnvelope => {
    if (!isRecord(value)) return false;
    return "domain" in value && "profile" in value && "threshold" in value;
};

const isSessionEnvelope = (value: unknown): value is SessionEnvelope => {
    if (!isRecord(value)) return false;
    return "domain" in value && "submittedAt" in value && "request" in value && "response" in value;
};

export function readAuditDraft(): AuditDraft | null {
    const parsed = readJson(AUDIT_DRAFT_KEY);
    if (!isDraftEnvelope(parsed)) return null;

    return {
        domain: normalizeDomain(parsed.domain),
        profile: normalizeProfile(parsed.profile),
        threshold: normalizeNumber(parsed.threshold, DEFAULT_THRESHOLD, 0, 1),
    };
}

export function saveAuditDraft(draft: AuditDraft): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUDIT_DRAFT_KEY, JSON.stringify(draft));
}

export function clearAuditDraft(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AUDIT_DRAFT_KEY);
}

export function readAuditSession(): AuditSession | null {
    const parsed = readJson(AUDIT_SESSION_KEY);
    if (!isSessionEnvelope(parsed) || !isRecord(parsed.response)) return null;

    return {
        domain: normalizeDomain(parsed.domain),
        submittedAt:
            typeof parsed.submittedAt === "string" && parsed.submittedAt.trim().length > 0
                ? parsed.submittedAt
                : new Date().toISOString(),
        request: normalizeRequest(parsed.request),
        response: parsed.response as unknown as AuditSession["response"],
    };
}

export function saveAuditSession(session: AuditSession): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUDIT_SESSION_KEY, JSON.stringify(session));
}

export function clearAuditSession(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AUDIT_SESSION_KEY);
}
