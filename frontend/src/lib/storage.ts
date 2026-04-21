import {
    AUDIT_HISTORY_KEY,
    AUDIT_HISTORY_SELECTED_ID_KEY,
    CUSTOM_DOMAIN_CONFIG_KEY,
    ONBOARDING_KEY,
    THEME_KEY,
} from "@/lib/constants";
import { DomainFieldConfig } from "@/lib/domains";
import { defaultCustomFields, sanitizeCustomFields } from "@/lib/domains/custom";
import { StoredAuditSession, ThemePreference } from "@/types/audit";

const MAX_HISTORY_ENTRIES = 50;

const isBrowser = (): boolean => typeof window !== "undefined";

function safeParse<T>(value: string | null, fallback: T): T {
    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

function safeGetItem(key: string): string | null {
    if (!isBrowser()) {
        return null;
    }

    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSetItem(key: string, value: string): void {
    if (!isBrowser()) {
        return;
    }

    try {
        window.localStorage.setItem(key, value);
    } catch {
        // no-op
    }
}

function safeRemoveItem(key: string): void {
    if (!isBrowser()) {
        return;
    }

    try {
        window.localStorage.removeItem(key);
    } catch {
        // no-op
    }
}

export function getAuditHistory(): StoredAuditSession[] {
    const parsed = safeParse<unknown[]>(safeGetItem(AUDIT_HISTORY_KEY), []);
    if (!Array.isArray(parsed)) {
        return [];
    }

    return parsed.filter(
        (item): item is StoredAuditSession =>
            typeof item === "object"
            && item !== null
            && typeof (item as StoredAuditSession).id === "string"
            && typeof (item as StoredAuditSession).submittedAt === "string"
            && typeof (item as StoredAuditSession).domain === "string"
            && typeof (item as StoredAuditSession).trustVerdict === "string"
            && typeof (item as StoredAuditSession).request === "object"
            && (item as StoredAuditSession).request !== null
            && typeof (item as StoredAuditSession).response === "object"
            && (item as StoredAuditSession).response !== null,
    );
}

export function saveAuditToHistory(session: StoredAuditSession): void {
    const history = getAuditHistory().filter((item) => item.id !== session.id);
    const updated = [session, ...history].slice(0, MAX_HISTORY_ENTRIES);
    safeSetItem(AUDIT_HISTORY_KEY, JSON.stringify(updated));
}

export function deleteAuditFromHistory(id: string): void {
    const filtered = getAuditHistory().filter((session) => session.id !== id);
    safeSetItem(AUDIT_HISTORY_KEY, JSON.stringify(filtered));
}

export function clearAuditHistory(): void {
    safeRemoveItem(AUDIT_HISTORY_KEY);
}

export function getAuditHistoryItem(id: string): StoredAuditSession | null {
    return getAuditHistory().find((entry) => entry.id === id) ?? null;
}

export function setSelectedHistoryAuditId(id: string): void {
    safeSetItem(AUDIT_HISTORY_SELECTED_ID_KEY, id);
}

export function getSelectedHistoryAuditId(): string | null {
    return safeGetItem(AUDIT_HISTORY_SELECTED_ID_KEY);
}

export function clearSelectedHistoryAuditId(): void {
    safeRemoveItem(AUDIT_HISTORY_SELECTED_ID_KEY);
}

export function getCustomDomainFields(): DomainFieldConfig[] {
    const raw = safeGetItem(CUSTOM_DOMAIN_CONFIG_KEY);
    if (!raw) {
        return defaultCustomFields;
    }

    return sanitizeCustomFields(safeParse<unknown>(raw, defaultCustomFields));
}

export function saveCustomDomainFields(fields: DomainFieldConfig[]): void {
    safeSetItem(CUSTOM_DOMAIN_CONFIG_KEY, JSON.stringify(fields));
}

export function isOnboardingCompleted(): boolean {
    return safeGetItem(ONBOARDING_KEY) === "true";
}

export function setOnboardingCompleted(value: boolean): void {
    if (value) {
        safeSetItem(ONBOARDING_KEY, "true");
    } else {
        safeRemoveItem(ONBOARDING_KEY);
    }

    if (isBrowser()) {
        window.dispatchEvent(new Event("decisiolens:onboarding-change"));
    }
}

export function getThemePreference(): ThemePreference {
    const raw = safeGetItem(THEME_KEY);
    if (raw === "light" || raw === "dark") {
        return raw;
    }

    return "dark";
}

export function setThemePreference(theme: ThemePreference): void {
    safeSetItem(THEME_KEY, theme);
}
