import { useMemo } from "react";
import { formatThreshold } from "@/lib/format";

interface ThresholdControlProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

export default function ThresholdControl({
    value,
    onChange,
    disabled = false,
}: ThresholdControlProps) {
    const positionPercent = useMemo(() => `${value * 100}%`, [value]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Zone labels: REJECT · BORDERLINE · ACCEPT */}
            <div
                className="font-mono uppercase"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "var(--fs-micro)",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                }}
            >
                <span style={{ color: "var(--aurora-crimson)" }}>REJECT</span>
                <span style={{ color: "var(--aurora-teal)" }}>BORDERLINE</span>
                <span style={{ color: "var(--aurora-green)" }}>ACCEPT</span>
            </div>

            {/* Custom slider track */}
            <div style={{ position: "relative" }}>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    disabled={disabled}
                    title="Decision Threshold"
                    style={{
                        width: "100%",
                        cursor: disabled ? "not-allowed" : "pointer",
                    }}
                />
            </div>

            {/* Live value display — large JetBrains Mono 600 */}
            <div style={{ display: "flex", justifyContent: "center" }}>
                <span
                    className="font-mono"
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        color: "var(--t1)",
                    }}
                >
                    {formatThreshold(value)}
                </span>
            </div>
        </div>
    );
}
