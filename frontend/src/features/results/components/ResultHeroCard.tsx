import { formatDateTime, formatSignedNumber, formatThreshold, signalClasses, SignalTone } from "@/lib/format";
import { AuditSession } from "@/types/audit";

interface ResultHeroCardProps {
    session: AuditSession;
    onRerun: () => void;
    onClear: () => void;
    readOnly?: boolean;
}

function getStabilityVerdict(riskScore: number): {
    label: string;
    tone: SignalTone;
    pillLabels: string[];
} {
    if (riskScore >= 70)
        return {
            label: "This decision may be unfair",
            tone: "risk",
            pillLabels: ["Result Changes Easily", "A Human Should Check This", "High Concern"],
        };
    if (riskScore >= 35)
        return {
            label: "This decision is not fully clear",
            tone: "warn",
            pillLabels: ["Close Call", "Worth Checking", "Medium Concern"],
        };
    return {
        label: "This decision looks stable",
        tone: "safe",
        pillLabels: ["Looks Good", "No Issues Found", "Low Concern"],
    };
}

export default function ResultHeroCard({
    session,
    onRerun,
    onClear,
    readOnly = false,
}: ResultHeroCardProps) {
    const { request, response } = session;
    const verdict = getStabilityVerdict(response.insights.risk_score);
    const palette = signalClasses[verdict.tone];

    const originalScore = response.original.score;
    const threshold = request.threshold;
    const distance = originalScore - threshold * 100;
    const timestamp = formatDateTime(session.submittedAt);

    return (
        <div
            className="dl-reveal"
            style={{
                minHeight: "220px",
                background: palette.surfaceVar,
                border: `1px solid ${palette.borderColorVar}`,
                borderBottom: `3px solid ${palette.colorVar}`,
                borderRadius: "10px",
                padding: "32px",
                display: "flex",
                flexWrap: "wrap",
                gap: "32px",
                alignItems: "flex-start",
            }}
        >
            {/* Left side */}
            <div style={{ flex: "1 1 400px" }}>
                {/* Domain + profile context */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginBottom: "8px",
                    }}
                >
                    <span
                        className="font-mono uppercase"
                        style={{
                            fontSize: "var(--fs-micro)",
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            color: "var(--aurora-teal)",
                            background: "var(--aurora-teal-surface)",
                            border: "1px solid hsl(172 33% 20%)",
                            borderRadius: "4px",
                            padding: "4px 10px",
                        }}
                    >
                        {request.domain?.toUpperCase() ?? "UNKNOWN"}
                    </span>
                    {request.profile?.name && (
                        <span
                            className="font-body"
                            style={{
                                fontSize: "var(--fs-micro)",
                                color: "var(--t2)",
                            }}
                        >
                            Profile: {String(request.profile.name)}
                        </span>
                    )}
                </div>

                {/* Overline with timestamp */}
                <p
                    className="font-mono"
                    style={{
                        fontSize: "var(--fs-micro)",
                        color: "var(--t3)",
                        letterSpacing: "0.05em",
                    }}
                >
                    YOUR RESULT · {timestamp}
                </p>

                {/* Verdict text Syne 800 */}
                <h2
                    className="font-display"
                    style={{
                        marginTop: "12px",
                        fontSize: "var(--fs-verdict)",
                        fontWeight: 800,
                        lineHeight: 1.1,
                        color: palette.colorVar,
                    }}
                >
                    {verdict.label}
                </h2>

                {/* Three-value cluster */}
                <p
                    className="font-mono"
                    style={{
                        marginTop: "16px",
                        fontSize: "var(--fs-mono)",
                        fontWeight: 600,
                        color: "var(--t2)",
                    }}
                >
                    Score: {formatThreshold(originalScore)} · Passing Bar:{" "}
                    {formatThreshold(threshold * 100)} · Margin: {formatSignedNumber(distance, 0, "pts")}
                </p>

                {/* Action buttons */}
                {!readOnly && (
                    <div
                        style={{
                            marginTop: "24px",
                            display: "flex",
                            gap: "12px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onRerun}
                            className="dl-btn-ghost"
                        >
                            TEST AGAIN
                        </button>
                        <button
                            type="button"
                            onClick={onClear}
                            className="dl-btn-ghost"
                        >
                            START NEW TEST
                        </button>
                    </div>
                )}
            </div>

            {/* Right side three StatPill-style elements */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    minWidth: "160px",
                }}
            >
                {verdict.pillLabels.map((pillLabel, i) => (
                    <div
                        key={i}
                        style={{
                            background: palette.surfaceVar,
                            border: `1px solid ${palette.borderColorVar}`,
                            borderRadius: "6px",
                            padding: "10px 16px",
                        }}
                    >
                        <span
                            className="font-mono"
                            style={{
                                fontSize: "var(--fs-micro)",
                                fontWeight: 600,
                                color: palette.colorVar,
                                letterSpacing: "0.05em",
                            }}
                        >
                            {pillLabel}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
