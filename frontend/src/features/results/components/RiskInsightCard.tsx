import ReasonTags from "./ReasonTags";
import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import StatPill from "@/components/shared/StatPill";
import { formatRiskLabel, formatRiskScore, normalizeRiskTone, shouldRecommendHumanReview } from "@/lib/format";
import { AuditInsights } from "@/types/audit";

interface RiskInsightCardProps {
    insights: AuditInsights;
    reasonTags: string[];
}

export default function RiskInsightCard({ insights, reasonTags }: RiskInsightCardProps) {
    const hasBiasFlag = reasonTags.includes("bias_detected") || insights.bias_detected;
    const hasInstabilityFlag = insights.instability || reasonTags.includes("profile_instability");
    const riskTone = normalizeRiskTone(insights.risk_score);
    const riskLabel = formatRiskLabel(String(insights.risk_score));
    const humanReviewRecommended = shouldRecommendHumanReview({
        riskScore: insights.risk_score,
        reasonTags,
        biasDetected: hasBiasFlag,
        instabilityDetected: hasInstabilityFlag,
    });

    return (
        <Card title="Pass 3 — Risk Insights" subtitle="Productized interpretation of risk and fairness signals">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatPill
                    label="Risk"
                    value={`Risk Score: ${formatRiskScore(insights.risk_score)}`}
                    tone={riskTone}
                    emphasize={riskTone === "risk"}
                />

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Bias Signal</p>
                    <div className="mt-2">
                        <Badge
                            label={hasBiasFlag ? "Bias Detected" : "Stable"}
                            tone={hasBiasFlag ? "risk" : "stable"}
                            dot
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Variation Stability</p>
                    <div className="mt-2">
                        <Badge
                            label={hasInstabilityFlag ? "Decision Flipped" : "No Decision Change"}
                            tone={hasInstabilityFlag ? "caution" : "stable"}
                            dot
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Risk Level</p>
                    <div className="mt-2">
                        <Badge
                            label={`Risk: ${riskLabel} · Score: ${formatRiskScore(insights.risk_score)}`}
                            tone={riskTone}
                            dot
                        />
                    </div>
                </div>
            </div>

            {humanReviewRecommended ? (
                <div className="mt-3 rounded-xl border border-signal-caution/40 bg-signal-cautionSoft/25 p-3">
                    <Badge label="Human Review Recommended" tone="caution" dot />
                    <p className="mt-1 text-sm text-ink-100">
                        Risk and fairness signals suggest a manual check before taking irreversible action.
                    </p>
                </div>
            ) : null}

            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-200">Reason Tags</p>
            <ReasonTags reasonTags={reasonTags} />
        </Card>
    );
}
