import { AuditSession } from "@/types/audit";

export function encodeSession(session: AuditSession): string {
    const compact = {
        ...session,
        response: {
            ...session.response,
            threshold_analysis: session.response.threshold_analysis.slice(0, 5),
        },
    };

    if (typeof window === "undefined") {
        return Buffer.from(encodeURIComponent(JSON.stringify(compact)), "utf-8").toString("base64");
    }

    return window.btoa(encodeURIComponent(JSON.stringify(compact)));
}

export function decodeSession(encoded: string): AuditSession | null {
    try {
        if (typeof window === "undefined") {
            const decoded = Buffer.from(encoded, "base64").toString("utf-8");
            return JSON.parse(decodeURIComponent(decoded)) as AuditSession;
        }

        return JSON.parse(decodeURIComponent(window.atob(encoded))) as AuditSession;
    } catch {
        return null;
    }
}
