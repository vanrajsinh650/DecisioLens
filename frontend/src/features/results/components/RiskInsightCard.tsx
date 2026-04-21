import ReasonTags from "./ReasonTags";
import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import StatPill from "@/components/shared/StatPill";
import { formatRiskLabel, normalizeRiskTone } from "@/lib/format";
import { AuditInsights } from "@/types/audit";

interface RiskInsightCardProps {
    insights: AuditInsights;
    reasonTags: string[];
}

export default function RiskInsightCard({ insights, reasonTags }: RiskInsightCardProps) {
    const hasBiasFlag = reasonTags.includes("bias_detected") || insights.bias_detected;
    const hasInstabilityFlag = insights.instability || reasonTags.includes("profile_instability");
    const riskTone = normalizeRiskTone(String(insights.risk_score));
    const riskLabel = formatRiskLabel(String(insights.risk_score));

    return (
        <Card title="Section 5 — Risk Insight Card" subtitle="Productized interpretation of risk and fairness signals">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatPill label="Risk" value={String(insights.risk_score)} tone={riskTone} />

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Bias Signal</p>
                    <div className="mt-2">
                        <Badge
                            label={hasBiasFlag ? "Bias Detected" : "Stable"}
                            tone={hasBiasFlag ? "risk" : "stable"}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Variation Stability</p>
                    <div className="mt-2">
                        <Badge
                            label={hasInstabilityFlag ? "Flipped" : "Stable"}
                            tone={hasInstabilityFlag ? "caution" : "stable"}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Risk Level</p>
                    <div className="mt-2">
                        <Badge
                            label={riskLabel}
                            tone={riskTone}
                        />
                    </div>
                </div>
            </div>

            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-200">Reason Tags</p>
            <ReasonTags reasonTags={reasonTags} />
        </Card>
    );
}
