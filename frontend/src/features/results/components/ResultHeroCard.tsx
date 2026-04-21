import Card from "@/components/shared/Card";
import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";
import StatPill from "@/components/shared/StatPill";
import {
    formatRiskLabel,
    formatThreshold,
    normalizeConfidenceTone,
    normalizeDecisionTone,
    normalizeRiskTone,
} from "@/lib/format";
import { AuditSession } from "@/types/audit";

interface ResultHeroCardProps {
    session: AuditSession;
    onRerun: () => void;
    onClear: () => void;
}

export default function ResultHeroCard({ session, onRerun, onClear }: ResultHeroCardProps) {
    const { request, response } = session;
    const decisionLabel = response.original.decision === "ACCEPT" ? "Accepted" : "Rejected";
    const riskTone = normalizeRiskTone(response.risk.level);

    return (
        <Card>
            <SectionHeader
                eyebrow="Section 1 — Result Hero Card"
                title={`Decision: ${decisionLabel}`}
                description="Instant outcome snapshot with score, threshold, confidence, and risk context."
                actions={
                    <>
                        <button
                            type="button"
                            onClick={onRerun}
                            className="rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-3 py-2 text-xs font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
                        >
                            Re-run at +0.02 threshold
                        </button>
                        <button
                            type="button"
                            onClick={onClear}
                            className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100 transition hover:border-ink-300"
                        >
                            Clear Result
                        </button>
                    </>
                }
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Decision Status</p>
                    <div className="mt-2">
                        <Badge
                            label={response.original.decision}
                            tone={normalizeDecisionTone(response.original.decision)}
                        />
                    </div>
                </div>

                <StatPill label="Score" value={formatThreshold(response.original.score)} tone="info" />

                <StatPill label="Threshold" value={formatThreshold(request.threshold)} tone="caution" />

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Confidence</p>
                    <div className="mt-2">
                        <Badge
                            label={response.confidence_zone}
                            tone={normalizeConfidenceTone(response.confidence_zone)}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Risk Profile</p>
                    <div className="mt-2">
                        <Badge label={formatRiskLabel(response.risk.level)} tone={riskTone} />
                    </div>
                </div>
            </div>
        </Card>
    );
}
