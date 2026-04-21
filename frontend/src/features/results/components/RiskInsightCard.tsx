import ReasonTags from "./ReasonTags";
import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import { normalizeRiskTone } from "@/lib/format";
import { AuditInsights } from "@/types/audit";

interface RiskInsightCardProps {
    insights: AuditInsights;
    reasonTags: string[];
}

export default function RiskInsightCard({ insights, reasonTags }: RiskInsightCardProps) {
    const hasBiasFlag = reasonTags.includes("bias_detected") || insights.bias_detected;
    const hasInstabilityFlag = insights.instability || reasonTags.includes("profile_instability");

    return (
        <Card title="Signal Summary" subtitle="Risk and reason tags">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge
                    label={hasInstabilityFlag ? "Instability Detected" : "Stable Pattern"}
                    tone={hasInstabilityFlag ? "caution" : "stable"}
                />
                <Badge
                    label={hasBiasFlag ? "Bias Flags Present" : "No Bias Flag"}
                    tone={hasBiasFlag ? "risk" : "stable"}
                />
                <Badge label={`Risk: ${insights.risk_level}`} tone={normalizeRiskTone(insights.risk_level)} />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-200">Reason Tags</p>
            <ReasonTags reasonTags={reasonTags} />
        </Card>
    );
}
