import Badge from "@/components/shared/Badge";
import StatPill from "@/components/shared/StatPill";
import {
    formatDateTime,
    formatRiskLabel,
    formatRiskScore,
    formatThreshold,
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
                DECISION SUMMARY
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
                    value={formatThreshold(response.original.score)}
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
                        Decision Stability
                    </p>
                    <div style={{ marginTop: "8px" }}>
                        <Badge
                            label={instabilityDetected ? "⚠️ Fragile" : "Stable"}
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
                        Bias
                    </p>
                    <div style={{ marginTop: "8px" }}>
                        <Badge
                            label={biasDetected ? "Detected" : "✅ No Bias"}
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
                    value={formatThreshold(request.threshold)}
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
                    <Badge label="Request Human Review" tone="warn" dot />
                    <p
                        className="font-body"
                        style={{
                            marginTop: "8px",
                            fontSize: "0.875rem",
                            color: "var(--t1)",
                        }}
                    >
                        Sensitive risk signals were detected. A human should review this before making a final decision.
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
                <span>Strictness Level: {formatThreshold(request.threshold)}</span>
            </div>
        </div>
    );
}
