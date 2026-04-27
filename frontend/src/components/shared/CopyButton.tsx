"use client";

import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";

interface CopyButtonProps {
    id?: string;
    value: string;
    label?: string;
    copiedLabel?: string;
}

export default function CopyButton({
    id,
    value,
    label = "Copy →",
    copiedLabel = "✓ Copied",
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);
    const resetTimerRef = useRef<number | null>(null);

    const scheduleReset = useCallback(() => {
        if (resetTimerRef.current !== null) {
            window.clearTimeout(resetTimerRef.current);
        }
        resetTimerRef.current = window.setTimeout(() => {
            setCopied(false);
            resetTimerRef.current = null;
        }, 1800);
    }, []);

    useEffect(() => {
        return () => {
            if (resetTimerRef.current !== null) {
                window.clearTimeout(resetTimerRef.current);
            }
        };
    }, []);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            scheduleReset();
        } catch {
            // Fallback
            const textarea = document.createElement("textarea");
            textarea.value = value;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            scheduleReset();
        }
    }, [scheduleReset, value]);

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        void handleCopy();
    }, [handleCopy]);

    return (
        <button
            id={id}
            type="button"
            onClick={handleClick}
            className="dl-btn-ghost"
            style={{
                fontSize: "var(--fs-micro)",
                color: copied ? "var(--aurora-green)" : "var(--t2)",
                background: "var(--s2)",
                border: "1px solid var(--rim)",
                padding: "6px 14px",
            }}
        >
            {copied ? copiedLabel : label}
        </button>
    );
}
