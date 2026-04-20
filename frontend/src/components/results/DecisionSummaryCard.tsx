import Card from "@/components/shared/Card";
import StatPill from "@/components/shared/StatPill";
import {
    formatPercent,
    formatThreshold,
    normalizeConfidenceTone,
    normalizeDecisionTone,
    normalizeRiskTone,
} from "@/lib/format";
import { AuditSession } from "@/types/audit";

interface DecisionSummaryCardProps {
    session: AuditSession;
}

export default function DecisionSummaryCard({ session }: DecisionSummaryCardProps) {
    const { request, response } = session;

    return (
        <Card title="Decision Snapshot" subtitle="Immediate quality and risk posture">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatPill
                    label="Decision"
                    value={response.original.decision}
                    tone={normalizeDecisionTone(response.original.decision)}
                />
                <StatPill
                    label="Model Score"
                    value={formatPercent(response.original.score)}
                    tone={normalizeConfidenceTone(response.confidence_zone)}
                />
                <StatPill
                    label="Confidence Zone"
                    value={response.confidence_zone}
                    tone={normalizeConfidenceTone(response.confidence_zone)}
                />
                <StatPill
                    label="Risk"
                    value={`${response.risk.level} (${response.risk.score}/100)`}
                    tone={normalizeRiskTone(response.risk.level)}
                />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-200">
                <span>Submitted: {new Date(session.submittedAt).toLocaleString()}</span>
                <span>·</span>
                <span>Domain: {session.domain}</span>
                <span>·</span>
                <span>Baseline threshold: {formatThreshold(request.threshold)}</span>
            </div>
        </Card>
    );
}
