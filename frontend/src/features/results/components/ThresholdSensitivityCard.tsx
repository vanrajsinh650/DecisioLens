import { formatThreshold } from "@/lib/format";
import { ThresholdAnalysisItem } from "@/types/audit";

interface ThresholdSensitivityCardProps {
    rows: ThresholdAnalysisItem[];
    baselineThreshold: number;
    originalScore: number;
    confidenceZone: string;
}

export default function ThresholdSensitivityCard({
    rows,
    baselineThreshold,
    originalScore,
    confidenceZone,
}: ThresholdSensitivityCardProps) {
    const originalDecision = rows.find(
        (r) => Math.abs(r.threshold - baselineThreshold) < 0.001
    )?.decision;
    const flipPoints = rows.filter((row) => row.decision !== originalDecision).length;
    const isSensitive = flipPoints > 0;

    const thresholdPos = baselineThreshold * 100;
    const scorePos = Math.min(100, Math.max(0, originalScore));

    // Flip zone is ±4 points from threshold
    const flipZoneStart = Math.max(0, thresholdPos - 4);
    const flipZoneWidth = 8;

    return (
        <div className="dl-reveal dl-card">
            {/* Header */}
            <div style={{ marginBottom: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px" }}>
                <div>
                    <p
                        className="font-body uppercase"
                        style={{
                            fontSize: "var(--fs-label)",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            color: "var(--t1)",
                        }}
                    >
                        SIGNAL ANALYSIS
                    </p>
                    <p className="font-body" style={{ marginTop: "4px", fontSize: "0.875rem", color: "var(--t2)" }}>
                        How does the outcome change when the strictness level shifts?
                    </p>
                </div>
            </div>

            {/* Score-on-spectrum visual */}
            <div style={{ marginBottom: "32px", marginTop: "16px" }}>
                {/* FLIP ZONE label */}
                <div style={{ position: "relative", height: "16px", marginBottom: "4px" }}>
                    <span
                        className="font-mono"
                        style={{
                            position: "absolute",
                            left: `${flipZoneStart + flipZoneWidth / 2}%`,
                            transform: "translateX(-50%)",
                            fontSize: "var(--fs-micro)",
                            color: "var(--aurora-teal)",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                        }}
                    >
                        FLIP ZONE
                    </span>
                </div>

                <div style={{ position: "relative", height: "8px", width: "100%", borderRadius: "4px", overflow: "hidden" }}>
                    {/* Full gradient track */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to right, var(--aurora-crimson) 0%, var(--aurora-teal) 45%, var(--aurora-teal) 55%, var(--aurora-green) 100%)",
                            borderRadius: "4px",
                        }}
                    />

                    {/* Flip zone shading */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            height: "100%",
                            left: `${flipZoneStart}%`,
                            width: `${flipZoneWidth}%`,
                            background: "hsl(172, 60%, 48%, 0.12)",
                        }}
                    />
                </div>

                {/* Threshold tick and Score dot (positioned outside overflow:hidden) */}
                <div style={{ position: "relative", height: "0px" }}>
                    {/* Threshold vertical tick */}
                    <div
                        style={{
                            position: "absolute",
                            top: "-8px",
                            height: "8px",
                            width: "2px",
                            background: "var(--t2)",
                            left: `${thresholdPos}%`,
                            transform: "translateX(-1px)",
                            zIndex: 10,
                        }}
                    />

                    {/* Score dot */}
                    <div
                        style={{
                            position: "absolute",
                            top: "-11px",
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: isSensitive ? "var(--aurora-teal)" : "var(--aurora-green)",
                            left: `${scorePos}%`,
                            transform: "translateX(-7px)",
                            zIndex: 20,
                        }}
                    />
                </div>

                {/* Labels */}
                <div
                    className="font-mono"
                    style={{
                        marginTop: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "var(--fs-micro)",
                        color: "var(--t2)",
                    }}
                >
                    <span>0</span>
                    <span>100</span>
                </div>
            </div>

            {/* Decision table */}
            <div
                style={{
                    borderRadius: "6px",
                    border: "1px solid var(--rim)",
                    overflow: "hidden",
                }}
            >
                <table style={{ width: "100%", textAlign: "left", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "var(--s2)" }}>
                            <th className="font-mono uppercase" style={{ padding: "12px 16px", fontSize: "var(--fs-label)", letterSpacing: "0.12em", fontWeight: 600, color: "var(--t2)" }}>
                                Threshold
                            </th>
                            <th className="font-mono uppercase" style={{ padding: "12px 16px", fontSize: "var(--fs-label)", letterSpacing: "0.12em", fontWeight: 600, color: "var(--t2)" }}>
                                Required Score
                            </th>
                            <th className="font-mono uppercase" style={{ padding: "12px 16px", fontSize: "var(--fs-label)", letterSpacing: "0.12em", fontWeight: 600, color: "var(--t2)" }}>
                                Outcome
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            const isFlipped = originalDecision
                                ? row.decision !== originalDecision
                                : false;
                            const bgColor = index % 2 === 0 ? "var(--s1)" : "var(--s2)";

                            return (
                                <tr
                                    key={row.threshold}
                                    style={{
                                        background: bgColor,
                                        borderTop: "1px solid var(--rim)",
                                    }}
                                >
                                    <td
                                        className="font-mono"
                                        style={{
                                            padding: "10px 16px",
                                            fontSize: "var(--fs-mono)",
                                            color: "var(--t1)",
                                        }}
                                    >
                                        {formatThreshold(row.threshold * 100)}
                                    </td>
                                    <td
                                        className="font-mono"
                                        style={{
                                            padding: "10px 16px",
                                            fontSize: "var(--fs-mono)",
                                            color: "var(--t2)",
                                        }}
                                    >
                                        {formatThreshold(row.threshold * 100)}
                                    </td>
                                    <td style={{ padding: "10px 16px" }}>
                                        {isFlipped ? (
                                            <span
                                                className="font-mono uppercase"
                                                style={{
                                                    fontSize: "var(--fs-micro)",
                                                    letterSpacing: "0.05em",
                                                    color: "var(--aurora-amber)",
                                                    padding: "3px 10px",
                                                    background: "var(--aurora-amber-surface)",
                                                    border: "1px solid hsl(35, 70%, 24%)",
                                                    borderRadius: "100px",
                                                }}
                                            >
                                                ⚡ FLIPPED
                                            </span>
                                        ) : row.decision === "ACCEPT" ? (
                                            <span
                                                className="font-mono uppercase"
                                                style={{
                                                    fontSize: "var(--fs-micro)",
                                                    letterSpacing: "0.05em",
                                                    color: "var(--aurora-green)",
                                                    padding: "3px 10px",
                                                    background: "var(--aurora-green-surface)",
                                                    border: "1px solid hsl(145, 65%, 24%)",
                                                    borderRadius: "100px",
                                                }}
                                            >
                                                ACCEPTED
                                            </span>
                                        ) : (
                                            <span
                                                className="font-mono uppercase"
                                                style={{
                                                    fontSize: "var(--fs-micro)",
                                                    letterSpacing: "0.05em",
                                                    color: "var(--aurora-crimson)",
                                                    padding: "3px 10px",
                                                    background: "var(--aurora-crimson-surface)",
                                                    border: "1px solid hsl(350, 68%, 24%)",
                                                    borderRadius: "100px",
                                                }}
                                            >
                                                REJECTED
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Instability callout */}
            {isSensitive && (
                <div
                    className="dl-reveal"
                    style={{
                        marginTop: "16px",
                        background: "var(--aurora-crimson-surface)",
                        borderLeft: "3px solid var(--aurora-crimson)",
                        borderRadius: "6px",
                        padding: "16px",
                    }}
                >
                    <p className="font-body" style={{ fontSize: "var(--fs-body)", color: "var(--t1)" }}>
                        The outcome flipped at {flipPoints} out of {rows.length} threshold levels we tested.
                        This profile sits in the <strong>{confidenceZone.toLowerCase()}</strong> zone.
                        A small policy change could flip this decision.
                    </p>
                </div>
            )}
        </div>
    );
}
