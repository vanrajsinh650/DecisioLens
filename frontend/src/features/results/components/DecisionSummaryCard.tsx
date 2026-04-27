import Badge from "@/components/shared/Badge";
import StatPill from "@/components/shared/StatPill";
import {
    formatDateTime,
    formatPercent,
    formatRiskLabel,
    formatRiskScore,
    normalizeDecisionTone,
    normalizeRiskTone,
    shouldRecommendHumanReview,
} from "@/lib/format";
import { AuditSession } from "@/types/audit";

interface DecisionSummaryCardProps {
    session: AuditSession;
}

export default function DecisionSummaryCard({ session }: DecisionSummaryCardProps) {
    const { request, response } = session;
    const reasonTags = response.insights.reason_tags;
    const biasDetected = response.insights.bias_detected || reasonTags.includes("bias_detected");
    const instabilityDetected = response.insights.instability || reasonTags.includes("profile_instability");
    const riskTone = normalizeRiskTone(response.insights.risk_score);
    const riskLabel = formatRiskLabel(String(response.insights.risk_score));
    const humanReviewRecommended = shouldRecommendHumanReview({
        riskScore: response.insights.risk_score,
        reasonTags,
        biasDetected,
        instabilityDetected,
        confidenceZone: response.original.confidence_zone,
    });

    return (
        <div className="dl-reveal dl-card">
            <p
                className="font-body uppercase"
                style={{
                    fontSize: "var(--fs-label)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--t2)",
                    marginBottom: "16px",
                }}
            >
                QUICK SUMMARY
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "12px",
                }}
            >
                <StatPill
                    label="Score"
                    value={formatPercent(response.original.score, 1)}
                    tone="neutral"
                />

                <div className="dl-inset" style={{ border: "1px solid var(--rim)" }}>
                    <p
                        className="font-body uppercase"
                        style={{ fontSize: "var(--fs-label)", fontWeight: 600, letterSpacing: "0.12em", color: "var(--t2)" }}
                    >
                        Decision
                    </p>
                    <div style={{ marginTop: "8px" }}>
                        <Badge
                            label={response.original.decision}
                            tone={normalizeDecisionTone(response.original.decision)}
                            dot
                        />
                    </div>
                </div>

                <div className="dl-inset" style={{ border: "1px solid var(--rim)" }}>
                    <p
                        className="font-body uppercase"
                        style={{ fontSize: "var(--fs-label)", fontWeight: 600, letterSpacing: "0.12em", color: "var(--t2)" }}
                    >
                        Does It Change?
                    </p>
                    <div style={{ marginTop: "8px" }}>
                        <Badge
                            label={instabilityDetected ? "⚠️ Changes Easily" : "Stays The Same"}
                            tone={instabilityDetected ? "caution" : "stable"}
                            dot
                        />
                    </div>
                </div>

                <div className="dl-inset" style={{ border: "1px solid var(--rim)" }}>
                    <p
                        className="font-body uppercase"
                        style={{ fontSize: "var(--fs-label)", fontWeight: 600, letterSpacing: "0.12em", color: "var(--t2)" }}
                    >
                        Is It Fair?
                    </p>
                    <div style={{ marginTop: "8px" }}>
                        <Badge
                            label={biasDetected ? "Unfairness Detected" : "✅ Looks Fair"}
                            tone={biasDetected ? "risk" : "stable"}
                            dot
                        />
                    </div>
                </div>
            </div>

            <div
                style={{
                    marginTop: "16px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "12px",
                }}
            >
                <StatPill
                    label="Strictness Level"
                    value={formatPercent(request.threshold, 1)}
                    tone="warn"
                />
                <StatPill
                    label="Risk"
                    value={`${riskLabel} · ${formatRiskScore(response.insights.risk_score)}`}
                    tone={riskTone}
                    emphasize={riskTone === "risk"}
                />
            </div>

            {humanReviewRecommended && (
                <div
                    style={{
                        marginTop: "16px",
                        background: "var(--aurora-teal-surface)",
                        border: "1px solid hsl(172, 60%, 24%)",
                        borderRadius: "6px",
                        padding: "16px",
                    }}
                >
                    <Badge label="A Human Should Review This" tone="warn" dot />
                    <p
                        className="font-body"
                        style={{
                            marginTop: "8px",
                            fontSize: "0.875rem",
                            color: "var(--t1)",
                        }}
                    >
                        We found signs this decision may not be reliable. A real person should look at it before a final choice is made.
                    </p>
                </div>
            )}

            <div
                className="font-mono"
                style={{
                    marginTop: "16px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "var(--fs-micro)",
                    color: "var(--t2)",
                }}
            >
                <span>{formatDateTime(session.submittedAt)}</span>
                <span>·</span>
                <span>Decision Type: {session.domain}</span>
                <span>·</span>
                <span>Passing Bar: {formatPercent(request.threshold, 1)}</span>
            </div>
        </div>
    );
}
