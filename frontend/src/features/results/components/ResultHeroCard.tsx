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
    shouldRecommendHumanReview,
} from "@/lib/format";
import { AuditSession } from "@/types/audit";

interface ResultHeroCardProps {
    session: AuditSession;
    onRerun: () => void;
    onClear: () => void;
}

export default function ResultHeroCard({ session, onRerun, onClear }: ResultHeroCardProps) {
    const { request, response } = session;
    const riskTone = normalizeRiskTone(response.insights.risk_score);
    const riskLabel = formatRiskLabel(String(response.insights.risk_score));
    const riskLevelLabel = response.insights.risk_level
        ? formatRiskLabel(response.insights.risk_level)
        : riskLabel;
    const humanReviewRecommended = shouldRecommendHumanReview({
        riskScore: response.insights.risk_score,
        reasonTags: response.insights.reason_tags,
        biasDetected: response.insights.bias_detected,
        instabilityDetected: response.insights.instability,
        confidenceZone: response.original.confidence_zone,
    });

    return (
        <Card>
            <SectionHeader
                eyebrow="Results Overview"
                title={`Decision: ${response.original.decision}`}
                description="Outcome summary with score, threshold, confidence, and risk level."
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
                    value={`Score: ${formatThreshold(response.original.score)}`}
                    tone="info"
                    emphasize
                />

                <StatPill
                    label="Threshold"
                    value={`Threshold: ${formatThreshold(request.threshold)}`}
                    tone="caution"
                />

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
                        <Badge
                            label={`Risk Level: ${riskLevelLabel}`}
                            tone={riskTone}
                            dot
                        />
                    </div>
                    <p className="mt-2 text-xs text-ink-200">{`Score: ${formatRiskScore(response.insights.risk_score)}`}</p>
                </div>
            </div>

            {humanReviewRecommended ? (
                <div className="mt-4 rounded-xl border border-signal-caution/40 bg-signal-cautionSoft/25 p-3">
                    <Badge label="Human Review Recommended" tone="caution" dot />
                    <p className="mt-2 text-sm text-ink-100">
                        Fairness or instability indicators were detected. Route this case for manual review before a final action.
                    </p>
                </div>
            ) : null}
        </Card>
    );
}
