import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import StatPill from "@/components/shared/StatPill";
import {
    formatRiskLabel,
    formatRiskScore,
    formatThreshold,
    normalizeDecisionTone,
    normalizeRiskTone,
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

    return (
        <Card
            title="Pass 2 — Decision Summary"
            subtitle="Core factual checks separate from the visual hero"
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatPill label="Score" value={formatThreshold(response.original.score)} tone="info" />

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Current Decision</p>
                    <div className="mt-2">
                        <Badge
                            label={response.original.decision}
                            tone={normalizeDecisionTone(response.original.decision)}
                            dot
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Instability Signal</p>
                    <div className="mt-2">
                        <Badge
                            label={instabilityDetected ? "Flipped" : "Stable"}
                            tone={instabilityDetected ? "caution" : "stable"}
                            dot
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Bias Status</p>
                    <div className="mt-2">
                        <Badge
                            label={biasDetected ? "Bias Detected" : "Stable"}
                            tone={biasDetected ? "risk" : "stable"}
                            dot
                        />
                    </div>
                </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <StatPill
                    label="Threshold"
                    value={formatThreshold(request.threshold)}
                    tone="caution"
                />
                <StatPill
                    label="Risk"
                    value={`${riskLabel} · ${formatRiskScore(response.insights.risk_score)}`}
                    tone={riskTone}
                    emphasize={riskTone === "risk"}
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
