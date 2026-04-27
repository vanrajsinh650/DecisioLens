import { formatDateTime, formatPercent, formatSignedNumber, signalClasses, SignalTone } from "@/lib/format";
import { AuditSession, Decision } from "@/types/audit";

interface ResultHeroCardProps {
    session: AuditSession;
    onRerun: () => void;
    onClear: () => void;
    readOnly?: boolean;
}

function getStabilityVerdict(
    decision: Decision,
    riskScore: number,
): {
    label: string;
    tone: SignalTone;
    pillLabels: string[];
} {
    // Decision is the primary signal. Risk score adds nuance within each outcome.
    if (decision === "REJECT") {
        if (riskScore >= 70) {
            return {
                label: "This decision was rejected and may be unfair",
                tone: "risk",
                pillLabels: ["Application Rejected", "Possible Bias Detected", "High Concern"],
            };
        }
        if (riskScore >= 35) {
            return {
                label: "This decision was rejected — worth a closer look",
                tone: "warn",
                pillLabels: ["Application Rejected", "Close to the Cutoff", "Medium Concern"],
            };
        }
        return {
            label: "This application was not approved",
            tone: "warn",
            pillLabels: ["Application Rejected", "Result Looks Consistent", "Low Concern"],
        };
    }

    // ACCEPT outcomes — shade by risk
    if (riskScore >= 70) {
        return {
            label: "Approved — but this decision may be unfair",
            tone: "risk",
            pillLabels: ["Application Approved", "Possible Bias Detected", "High Concern"],
        };
    }
    if (riskScore >= 35) {
        return {
            label: "Approved — though it's a close call",
            tone: "warn",
            pillLabels: ["Application Approved", "Near the Cutoff", "Medium Concern"],
        };
    }
    return {
        label: "This decision looks stable and fair",
        tone: "safe",
        pillLabels: ["Application Approved", "No Issues Found", "Low Concern"],
    };
}

export default function ResultHeroCard({
    session,
    onRerun,
    onClear,
    readOnly = false,
}: ResultHeroCardProps) {
    const { request, response } = session;
    const verdict = getStabilityVerdict(response.original.decision, response.insights.risk_score);
    const palette = signalClasses[verdict.tone];

    const originalScore = response.original.score;
    const threshold = response.original.threshold ?? request.threshold;
    const scorePct = originalScore * 100;
    const thresholdPct = threshold * 100;
    const distance = scorePct - thresholdPct;
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
                    Score: {formatPercent(originalScore, 1)} · Passing Bar:{" "}
                    {formatPercent(threshold, 1)} · Margin: {formatSignedNumber(distance, 0, "pts")}
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
                            Test at stricter bar (+0.02)
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
