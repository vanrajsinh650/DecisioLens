import { signalClasses, SignalTone } from "@/lib/format";

interface StatPillProps {
    label: string;
    value: string;
    tone?: SignalTone | "info" | "stable" | "caution";
    className?: string;
    emphasize?: boolean;
    /** Optional numeric value (0–100) for the fuel gauge bar */
    gaugeValue?: number;
}

function resolveSignalTone(tone: string): SignalTone {
    if (tone === "stable") return "safe";
    if (tone === "caution") return "warn";
    if (tone === "info") return "neutral";
    return tone as SignalTone;
}

export default function StatPill({
    label,
    value,
    tone = "neutral",
    className = "",
    emphasize = false,
    gaugeValue,
}: StatPillProps) {
    const resolved = resolveSignalTone(tone);
    const palette = signalClasses[resolved];

    return (
        <div
            className={`dl-inset ${className}`}
            style={{
                border: "1px solid var(--rim)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "100%",
                paddingBottom: (typeof gaugeValue === "number" || emphasize) ? "24px" : "16px",
            }}
        >
            <p
                className="font-body uppercase"
                style={{
                    fontSize: "var(--fs-label)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--t2)",
                }}
            >
                {label}
            </p>
            <p
                className="font-mono"
                style={{
                    marginTop: "8px",
                    fontSize: value.length > 15 ? "1.1rem" : "1.25rem",
                    fontWeight: 600,
                    color: "var(--t1)",
                    lineHeight: "1.4",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {value}
            </p>

            {/* Fuel gauge bar at bottom */}
            {typeof gaugeValue === "number" && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: "var(--s1)",
                    }}
                >
                    <div
                        className="dl-gauge"
                        style={{
                            height: "100%",
                            width: `${Math.min(100, Math.max(0, gaugeValue))}%`,
                            background: palette.colorVar,
                            transformOrigin: "left",
                            transform: "scaleX(0)",
                        }}
                    />
                </div>
            )}

            {/* Emphasize: 3px bottom border */}
            {emphasize && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: palette.colorVar,
                    }}
                />
            )}
        </div>
    );
}
