import { formatVariationName, formatThreshold } from "@/lib/format";
import { VariationResult } from "@/types/audit";

interface VariationsComparisonCardProps {
    variations: VariationResult[];
}

export default function VariationsComparisonCard({ variations }: VariationsComparisonCardProps) {
    const baselineRow =
        variations.find((row) => row.label === "baseline") ?? variations[0] ?? null;

    if (!baselineRow) {
        return null;
    }

    // Limit to 6 scenarios — 3×2 grid per spec
    const displayVariations = variations.slice(0, 6);

    return (
        <div className="dl-reveal">
            {/* Overline */}
            <p
                className="font-body uppercase"
                style={{
                    fontSize: "var(--fs-label)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--t1)",
                    marginBottom: "24px",
                }}
            >
                WHAT IF SOMETHING CHANGED?
            </p>

            {/* 3×2 grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "16px",
                }}
            >
                {displayVariations.map((row) => {
                    const isChanged = row.changed;
                    const isBaseline = row.label === "baseline";

                    // What changed text
                    const changeText =
                        row.profile && !isBaseline
                            ? Object.entries(row.profile)
                                .filter(
                                    ([key]) =>
                                        key !== "name" &&
                                        key !== "score" &&
                                        key !== "experience"
                                )
                                .slice(0, 2)
                                .map(([key, val]) => `${key} → ${val}`)
                                .join(", ")
                            : null;

                    return (
                        <div
                            key={row.label}
                            className="dl-card dl-scenario-card"
                            style={{
                                borderLeft: isChanged
                                    ? "2px solid var(--aurora-crimson)"
                                    : "1px solid var(--rim)",
                                cursor: "default",
                            }}
                        >
                            {/* Scenario name */}
                            <p
                                className="font-body"
                                style={{
                                    fontSize: "var(--fs-h2)",
                                    fontWeight: 600,
                                    color: "var(--t1)",
                                }}
                            >
                                {formatVariationName(row.label)}
                            </p>

                            {/* What changed */}
                            <div style={{ height: "20px", marginTop: "4px" }}>
                                {changeText && (
                                    <p
                                        className="font-mono"
                                        style={{
                                            fontSize: "var(--fs-micro)",
                                            color: "var(--t2)",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {changeText}
                                    </p>
                                )}
                            </div>

                            {/* Score */}
                            <p
                                className="font-mono"
                                style={{
                                    marginTop: "16px",
                                    fontSize: "1.25rem",
                                    fontWeight: 600,
                                    color: "var(--t1)",
                                }}
                            >
                                {formatThreshold(row.score)}
                            </p>

                            {/* Status badge */}
                            <div style={{ marginTop: "12px" }}>
                                <span
                                    className="font-mono uppercase"
                                    style={{
                                        fontSize: "var(--fs-micro)",
                                        letterSpacing: "0.05em",
                                        padding: "4px 12px",
                                        borderRadius: "100px",
                                        border: "1px solid var(--rim)",
                                        color: isChanged ? "var(--aurora-crimson)" : "var(--t3)",
                                        background: isChanged
                                            ? "var(--aurora-crimson-surface)"
                                            : "transparent",
                                    }}
                                >
                                    {isChanged ? "⚡ Result Changed" : "Same Result"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
