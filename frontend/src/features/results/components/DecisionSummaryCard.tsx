import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import {
    formatThreshold,
    normalizeDecisionTone,
} from "@/lib/format";
import { AuditSession } from "@/types/audit";

interface DecisionSummaryCardProps {
    session: AuditSession;
}

export default function DecisionSummaryCard({ session }: DecisionSummaryCardProps) {
    const { request, response } = session;
    const biasDetected = response.insights.bias_detected || response.reason_tags.includes("bias_detected");
    const instabilityDetected = response.insights.instability || response.reason_tags.includes("profile_instability");

    return (
        <Card
            title="Section 2 — Decision Summary Card"
            subtitle="Core factual checks separate from the visual hero"
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Original Score</p>
                    <p className="mt-2 text-lg font-semibold text-ink-50">
                        {formatThreshold(response.original.score)}
                    </p>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Current Decision</p>
                    <div className="mt-2">
                        <Badge
                            label={response.original.decision}
                            tone={normalizeDecisionTone(response.original.decision)}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Instability</p>
                    <p className="mt-2 text-lg font-semibold text-ink-50">{instabilityDetected ? "Yes" : "No"}</p>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Bias Detected</p>
                    <p className="mt-2 text-lg font-semibold text-ink-50">{biasDetected ? "Yes" : "No"}</p>
                </div>
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
