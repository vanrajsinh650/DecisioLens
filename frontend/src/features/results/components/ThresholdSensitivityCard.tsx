import { formatNumber, formatPercent } from "@/lib/format";
import { Decision, ThresholdAnalysisItem } from "@/types/audit";

interface ThresholdSensitivityCardProps {
    rows: ThresholdAnalysisItem[];
    baselineThreshold: number;
    originalScore: number;
    originalDecision: Decision;
    confidenceZone: string;
}

export default function ThresholdSensitivityCard({
    rows,
    baselineThreshold,
    originalScore,
    originalDecision,
    confidenceZone,
}: ThresholdSensitivityCardProps) {
    const sortedRows = [...rows].sort((a, b) => a.threshold - b.threshold);
    const nearestBaselineRow = sortedRows.reduce<ThresholdAnalysisItem | null>((nearest, row) => {
        if (!nearest) return row;
        return Math.abs(row.threshold - baselineThreshold) < Math.abs(nearest.threshold - baselineThreshold)
            ? row
            : nearest;
    }, null);
    const baselineDecision = nearestBaselineRow?.decision ?? originalDecision;
    const changedOutcomeCount = sortedRows.filter((row) => row.decision !== baselineDecision).length;
    const isSensitive = changedOutcomeCount > 0;

    const clampPercent = (value: number) => Math.min(100, Math.max(0, value));
    const thresholdPos = clampPercent(baselineThreshold * 100);
    const scorePos = clampPercent(originalScore * 100);

    // The decision flips when the moving passing bar crosses the fixed AI score.
    const flipZoneStart = clampPercent(scorePos - 5);
    const flipZoneEnd = clampPercent(scorePos + 5);
    const flipZoneWidth = flipZoneEnd - flipZoneStart;

    const scoreLabel = formatPercent(originalScore, 1);
    const thresholdLabel = formatPercent(baselineThreshold, 1);
    const actualResultLabel = baselineDecision === "ACCEPT" ? "approved" : "rejected";
    const oppositeResultLabel = baselineDecision === "ACCEPT" ? "rejected" : "approved";
    const distancePoints = Math.abs(originalScore - baselineThreshold) * 100;
    const distanceLabel = `${formatNumber(distancePoints, 1)} percentage point${Math.abs(distancePoints - 1) < 0.05 ? "" : "s"}`;
    const scorePositionText = distancePoints < 0.05
        ? "exactly on the actual bar"
        : originalScore >= baselineThreshold
            ? `${distanceLabel} above the actual bar`
            : `${distanceLabel} below the actual bar`;
    const flipInstruction = distancePoints < 0.05
        ? "Because the score sits on the bar, even a tiny policy change can flip the result."
        : baselineDecision === "ACCEPT"
            ? `Raise the bar by about ${distanceLabel}, and this same score reaches the flip line.`
            : `Lower the bar by about ${distanceLabel}, and this same score reaches the flip line.`;
    const confidenceLabel = confidenceZone
        .toLowerCase()
        .replace("borderline", "close call")
        .replace("unstable", "very close")
        .replace("fragile", "easy to change");

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
                        HOW STRICT WAS THE PASSING BAR?
                    </p>
                    <p className="font-body" style={{ marginTop: "4px", fontSize: "0.875rem", color: "var(--t2)" }}>
                        Same profile, same AI score. We only move the cutoff line to see when the outcome changes.
                    </p>
                </div>
            </div>

            {/* Plain-language explainer */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                    marginBottom: "24px",
                }}
            >
                <div style={{ background: "var(--s2)", border: "1px solid var(--rim)", borderRadius: "8px", padding: "14px" }}>
                    <p className="font-mono uppercase" style={{ fontSize: "var(--fs-micro)", color: "var(--t2)", letterSpacing: "0.08em" }}>
                        1. AI score
                    </p>
                    <p className="font-body" style={{ marginTop: "6px", fontSize: "1.25rem", fontWeight: 700, color: "var(--t1)" }}>
                        {scoreLabel}
                    </p>
                    <p className="font-body" style={{ marginTop: "2px", fontSize: "0.8125rem", color: "var(--t2)", lineHeight: 1.5 }}>
                        This score stays fixed in this test.
                    </p>
                </div>

                <div style={{ background: "var(--s2)", border: "1px solid var(--rim)", borderRadius: "8px", padding: "14px" }}>
                    <p className="font-mono uppercase" style={{ fontSize: "var(--fs-micro)", color: "var(--t2)", letterSpacing: "0.08em" }}>
                        2. Actual bar
                    </p>
                    <p className="font-body" style={{ marginTop: "6px", fontSize: "1.25rem", fontWeight: 700, color: "var(--aurora-amber)" }}>
                        {thresholdLabel}
                    </p>
                    <p className="font-body" style={{ marginTop: "2px", fontSize: "0.8125rem", color: "var(--t2)", lineHeight: 1.5 }}>
                        The real cutoff used for this decision.
                    </p>
                </div>

                <div style={{ background: "var(--s2)", border: "1px solid var(--rim)", borderRadius: "8px", padding: "14px" }}>
                    <p className="font-mono uppercase" style={{ fontSize: "var(--fs-micro)", color: "var(--t2)", letterSpacing: "0.08em" }}>
                        3. Simple rule
                    </p>
                    <p className="font-body" style={{ marginTop: "6px", fontSize: "0.9375rem", fontWeight: 700, color: "var(--t1)", lineHeight: 1.5 }}>
                        Score at or above bar = approved.
                    </p>
                    <p className="font-body" style={{ marginTop: "2px", fontSize: "0.8125rem", color: "var(--t2)", lineHeight: 1.5 }}>
                        Score below bar = rejected.
                    </p>
                </div>
            </div>

            <div
                style={{
                    marginBottom: "28px",
                    border: "1px solid rgba(245, 124, 0, 0.28)",
                    background: "rgba(245, 124, 0, 0.08)",
                    borderRadius: "10px",
                    padding: "16px",
                }}
            >
                <p className="font-body" style={{ fontSize: "var(--fs-body)", color: "var(--t1)", lineHeight: 1.65 }}>
                    In plain English: your AI score is <strong>{scorePositionText}</strong>, so the actual result is <strong>{actualResultLabel}</strong>.
                    The decision changes only when the moving bar crosses your score: then it becomes <strong>{oppositeResultLabel}</strong>.
                </p>
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
                            color: "var(--t1)",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                        }}
                    >
                        OUTCOME FLIPS AT YOUR SCORE
                    </span>
                </div>

                <div style={{ position: "relative", height: "8px", width: "100%", borderRadius: "4px", overflow: "hidden" }}>
                    {/* Easier bars approve this same score */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: `${scorePos}%`,
                            background: "var(--aurora-green)",
                        }}
                    />

                    {/* Stricter bars reject this same score */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: `${scorePos}%`,
                            width: `${100 - scorePos}%`,
                            background: "var(--aurora-crimson)",
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
                            background: "rgba(255, 255, 255, 0.18)",
                        }}
                    />
                </div>

                {/* Threshold tick and score tick (positioned outside overflow:hidden) */}
                <div style={{ position: "relative", height: "0px" }}>
                    {/* Actual threshold vertical tick */}
                    <div
                        style={{
                            position: "absolute",
                            top: "-12px",
                            height: "16px",
                            width: "2px",
                            background: "var(--aurora-amber)",
                            left: `${thresholdPos}%`,
                            transform: "translateX(-1px)",
                            zIndex: 10,
                        }}
                    />

                    {/* Score / flip line */}
                    <div
                        style={{
                            position: "absolute",
                            top: "-14px",
                            width: "4px",
                            height: "20px",
                            borderRadius: "100px",
                            background: "var(--t1)",
                            left: `${scorePos}%`,
                            transform: "translateX(-2px)",
                            zIndex: 20,
                            boxShadow: "0 0 0 4px rgba(255,255,255,0.12)",
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
                    <span>0 · easier bar</span>
                    <span>100 · stricter bar</span>
                </div>

                <div
                    style={{
                        marginTop: "16px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "10px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--t2)", fontSize: "0.8125rem" }}>
                        <span style={{ width: "18px", height: "6px", borderRadius: "999px", background: "var(--aurora-green)", display: "inline-block" }} />
                        Bar is at or below your score → approved
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--t2)", fontSize: "0.8125rem" }}>
                        <span style={{ width: "18px", height: "6px", borderRadius: "999px", background: "var(--aurora-crimson)", display: "inline-block" }} />
                        Bar is above your score → rejected
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--t2)", fontSize: "0.8125rem" }}>
                        <span style={{ width: "2px", height: "18px", background: "var(--aurora-amber)", display: "inline-block" }} />
                        Actual bar: {thresholdLabel}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--t2)", fontSize: "0.8125rem" }}>
                        <span style={{ width: "4px", height: "18px", borderRadius: "999px", background: "var(--t1)", display: "inline-block" }} />
                        Your score / flip line: {scoreLabel}
                    </div>
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
                                If the bar were set at
                            </th>
                            <th className="font-mono uppercase" style={{ padding: "12px 16px", fontSize: "var(--fs-label)", letterSpacing: "0.12em", fontWeight: 600, color: "var(--t2)" }}>
                                Result for this same score
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRows.map((row, index) => {
                            const isBaseline = Math.abs(row.threshold - baselineThreshold) < 0.001;
                            const isAccept = row.decision === "ACCEPT";
                            const isChangedFromActual = row.decision !== baselineDecision;
                            const bgColor = isBaseline ? "var(--aurora-amber-surface)" : index % 2 === 0 ? "var(--s1)" : "var(--s2)";
                            const strictnessLabel = isBaseline
                                ? "Actual setting"
                                : row.threshold < baselineThreshold
                                    ? "Easier than actual"
                                    : "Stricter than actual";
                            const rowMeaning = isAccept
                                ? `${scoreLabel} clears this bar.`
                                : `${scoreLabel} falls below this bar.`;

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
                                            color: isBaseline ? "var(--t1)" : "var(--t2)",
                                        }}
                                    >
                                        <span>{formatPercent(row.threshold, 1)}</span>
                                        <span
                                            className="font-body"
                                            style={{
                                                display: "block",
                                                marginTop: "2px",
                                                fontSize: "0.75rem",
                                                color: isBaseline ? "var(--aurora-amber)" : "var(--t3)",
                                            }}
                                        >
                                            {strictnessLabel}
                                        </span>
                                    </td>
                                    <td style={{ padding: "10px 16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                            {isAccept ? (
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
                                                    APPROVED
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
                                            {isBaseline && (
                                                <span className="font-mono uppercase" style={{ fontSize: "10px", color: "var(--aurora-amber)", fontWeight: 600, letterSpacing: "0.05em" }}>
                                                    ACTUAL RESULT
                                                </span>
                                            )}
                                            {!isBaseline && isChangedFromActual && (
                                                <span className="font-mono uppercase" style={{ fontSize: "10px", color: "var(--aurora-crimson)", fontWeight: 600, letterSpacing: "0.05em" }}>
                                                    WOULD CHANGE
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-body" style={{ marginTop: "5px", fontSize: "0.75rem", color: "var(--t2)", lineHeight: 1.45 }}>
                                            {rowMeaning}
                                        </p>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Instability callout */}
            <div
                className="dl-reveal"
                style={{
                    marginTop: "16px",
                    background: isSensitive ? "var(--aurora-crimson-surface)" : "var(--aurora-green-surface)",
                    borderLeft: `3px solid ${isSensitive ? "var(--aurora-crimson)" : "var(--aurora-green)"}`,
                    borderRadius: "6px",
                    padding: "16px",
                }}
            >
                <p className="font-body" style={{ fontSize: "var(--fs-body)", color: "var(--t1)", lineHeight: 1.65 }}>
                    <strong>Takeaway:</strong> {changedOutcomeCount} of {sortedRows.length} tested bar settings would give a different result than the actual setting.
                    This is a <strong>{confidenceLabel}</strong> decision. {flipInstruction}
                </p>
            </div>
        </div>
    );
}
