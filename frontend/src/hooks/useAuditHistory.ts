"use client";

import { useCallback, useEffect, useState } from "react";

import {
    clearAuditHistory,
    deleteAuditFromHistory,
    getAuditHistory,
    saveAuditToHistory,
} from "@/lib/storage";
import { StoredAuditSession } from "@/types/audit";

export function useAuditHistory() {
    const [history, setHistory] = useState<StoredAuditSession[]>([]);

    useEffect(() => {
        setHistory(getAuditHistory());
    }, []);

    const save = useCallback((session: StoredAuditSession) => {
        saveAuditToHistory(session);
        setHistory(getAuditHistory());
    }, []);

    const remove = useCallback((id: string) => {
        deleteAuditFromHistory(id);
        setHistory(getAuditHistory());
    }, []);

    const clear = useCallback(() => {
        clearAuditHistory();
        setHistory([]);
    }, []);

    return { history, save, remove, clear };
}
