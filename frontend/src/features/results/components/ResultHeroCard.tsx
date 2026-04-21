import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";
import { formatThreshold, normalizeConfidenceTone, normalizeDecisionTone, normalizeRiskTone } from "@/lib/format";
import { AuditSession } from "@/types/audit";

interface ResultHeroCardProps {
    session: AuditSession;
    onRerun: () => void;
    onClear: () => void;
}

export default function ResultHeroCard({ session, onRerun, onClear }: ResultHeroCardProps) {
    const { request, response } = session;
    const decisionLabel = response.original.decision === "ACCEPT" ? "Accepted" : "Rejected";

    return (
        <div className="rounded-2xl border border-ink-600/70 bg-ink-800/80 p-5 shadow-card backdrop-blur-sm">
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
                    <p className="text-xs uppercase tracking-wide text-ink-200">Decision</p>
                    <div className="mt-2">
                        <Badge
                            label={response.original.decision}
                            tone={normalizeDecisionTone(response.original.decision)}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Score</p>
                    <p className="mt-2 text-lg font-semibold text-ink-50">{formatThreshold(response.original.score)}</p>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Threshold</p>
                    <p className="mt-2 text-lg font-semibold text-ink-50">{formatThreshold(request.threshold)}</p>
                </div>

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
                    <p className="text-xs uppercase tracking-wide text-ink-200">Risk Level</p>
                    <div className="mt-2">
                        <Badge label={response.risk.level} tone={normalizeRiskTone(response.risk.level)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
