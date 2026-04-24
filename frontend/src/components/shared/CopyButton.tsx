"use client";

import { useCallback, useState } from "react";

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

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // Fallback
            const textarea = document.createElement("textarea");
            textarea.value = value;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
    }, [value]);

    return (
        <button
            id={id}
            type="button"
            onClick={handleCopy}
            className="font-mono"
            style={{
                fontSize: "var(--fs-micro)",
                color: copied ? "var(--aurora-green)" : "var(--t2)",
                background: "var(--s2)",
                border: "1px solid var(--rim)",
                borderRadius: "6px",
                padding: "6px 14px",
                cursor: "pointer",
                transition: "all 0.15s ease",
            }}
        >
            {copied ? copiedLabel : label}
        </button>
    );
}
