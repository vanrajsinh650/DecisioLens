import Card from "@/components/shared/Card";
import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";
import StatPill from "@/components/shared/StatPill";
import {
    formatRiskLabel,
    formatRiskScore,
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
    const riskTone = normalizeRiskTone(response.insights.risk_score);
    const riskLabel = formatRiskLabel(String(response.insights.risk_score));

    return (
        <Card>
            <SectionHeader
                eyebrow="Pass 2 — Summary"
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
                            dot
                        />
                    </div>
                </div>

                <StatPill
                    label="Score"
                    value={formatThreshold(response.original.score)}
                    tone="info"
                    emphasize
                />

                <StatPill label="Threshold" value={formatThreshold(request.threshold)} tone="caution" />

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Confidence</p>
                    <div className="mt-2">
                        <Badge
                            label={response.original.confidence_zone ?? "Unknown"}
                            tone={normalizeConfidenceTone(response.original.confidence_zone ?? "Unknown")}
                            dot
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Risk Profile</p>
                    <div className="mt-2">
                        <Badge label={`${riskLabel} · ${formatRiskScore(response.insights.risk_score)}`} tone={riskTone} dot />
                    </div>
                </div>
            </div>
        </Card>
    );
}
