"use client";

import { useCallback, useState } from "react";

import { runAudit } from "@/lib/api";
import { AuditRequest, AuditResponse } from "@/types/audit";

export interface ComparisonSlot {
    request: AuditRequest | null;
    response: AuditResponse | null;
    loading: boolean;
    error: string | null;
}

const createInitialSlot = (): ComparisonSlot => ({
    request: null,
    response: null,
    loading: false,
    error: null,
});

export function useComparison() {
    const [slotA, setSlotA] = useState<ComparisonSlot>(createInitialSlot);
    const [slotB, setSlotB] = useState<ComparisonSlot>(createInitialSlot);

    const submitSlot = useCallback(async (slot: "A" | "B", payload: AuditRequest) => {
        const setter = slot === "A" ? setSlotA : setSlotB;

        setter((current) => ({
            ...current,
            loading: true,
            error: null,
            request: payload,
        }));

        try {
            const response = await runAudit(payload);
            setter({
                request: payload,
                response,
                loading: false,
                error: null,
            });
            return response;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to run comparison audit";
            setter((current) => ({
                ...current,
                loading: false,
                error: message,
            }));
            return null;
        }
    }, []);

    const clearSlot = useCallback((slot: "A" | "B") => {
        if (slot === "A") {
            setSlotA(createInitialSlot());
            return;
        }

        setSlotB(createInitialSlot());
    }, []);

    const reset = useCallback(() => {
        setSlotA(createInitialSlot());
        setSlotB(createInitialSlot());
    }, []);

    return { slotA, slotB, submitSlot, reset, clearSlot };
}
