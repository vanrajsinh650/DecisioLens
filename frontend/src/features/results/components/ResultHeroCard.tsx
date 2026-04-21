import Card from "@/components/shared/Card";
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
    toneClasses,
} from "@/lib/format";
import { formatVariationName } from "@/lib/format";
import { AuditSession } from "@/types/audit";

interface ResultHeroCardProps {
    session: AuditSession;
    onRerun: () => void;
    onClear: () => void;
    readOnly?: boolean;
}

function getStabilityVerdict(session: AuditSession): {
    emoji: string;
    headline: string;
    tone: "stable" | "caution" | "risk";
    trustLevel: string;
    confidenceLabel: string;
    insight: string | null;
} {
    const { response } = session;
    const riskScore = response.insights.risk_score;
    const hasInstability = response.insights.instability;
    const hasBias = response.insights.bias_detected;
    const flippedVariation = response.variations.find((v) => v.changed);
    const confidenceZone = response.original.confidence_zone ?? "Unknown";

    const isUnstable = hasInstability || hasBias || riskScore > 70;
    const isBorderline =
        confidenceZone.toLowerCase().includes("borderline") ||
        riskScore > 30 && riskScore <= 70;

    const tone: "stable" | "caution" | "risk" = isUnstable
        ? "risk"
        : isBorderline
            ? "caution"
            : "stable";

    const emoji = tone === "risk" ? "⚠️" : tone === "caution" ? "⚡" : "✅";
    const headline = tone === "risk"
        ? "This decision is UNSTABLE"
        : tone === "caution"
            ? "This decision is BORDERLINE"
            : "This decision is STABLE";

    const trustLevel = tone === "risk"
        ? "Risky"
        : tone === "caution"
            ? "Uncertain"
            : "Stable";

    const confidenceLabel = riskScore <= 30
        ? "High"
        : riskScore <= 70
            ? "Medium"
            : "Low";

    let insight: string | null = null;
    if (flippedVariation) {
        insight = `Changing ${formatVariationName(flippedVariation.label).toLowerCase()} flips the decision`;
    } else if (hasBias) {
        insight = "Bias signals detected across profile variations";
    } else if (hasInstability) {
        insight = "Decision is sensitive to small threshold changes";
    }

    return { emoji, headline, tone, trustLevel, confidenceLabel, insight };
}

export default function ResultHeroCard({ session, onRerun, onClear, readOnly = false }: ResultHeroCardProps) {
    const { request, response } = session;
    const riskTone = normalizeRiskTone(response.insights.risk_score);
    const riskLabel = formatRiskLabel(response.insights.risk_level ?? String(response.insights.risk_score));
    const humanReviewRecommended = shouldRecommendHumanReview({
        riskScore: response.insights.risk_score,
        reasonTags: response.insights.reason_tags,
        biasDetected: response.insights.bias_detected,
        instabilityDetected: response.insights.instability,
        confidenceZone: response.original.confidence_zone,
    });

    const verdict = getStabilityVerdict(session);
    const verdictPalette = toneClasses[verdict.tone];

    return (
        <Card>
            {/* ── Big verdict banner ── */}
            <div className={`mb-5 rounded-xl border p-4 ${verdictPalette.border} ${verdictPalette.soft}`}>
                <p className={`font-display text-2xl font-bold ${verdictPalette.text}`}>
                    {verdict.emoji} {verdict.headline}
                </p>
                {verdict.insight ? (
                    <p className="mt-2 text-sm text-ink-100">
                        {verdict.insight}
                    </p>
                ) : null}
            </div>

            {/* ── Trust + Confidence row ── */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
                <Badge label={`Trust Level: ${verdict.trustLevel}`} tone={verdict.tone} dot />
                <Badge label={`Decision Confidence: ${verdict.confidenceLabel}`} tone={verdict.tone === "risk" ? "risk" : verdict.tone === "caution" ? "caution" : "stable"} dot />
                <Badge
                    label={response.original.decision}
                    tone={normalizeDecisionTone(response.original.decision)}
                    dot
                />
            </div>

            {/* ── Action buttons ── */}
            {!readOnly ? (
                <div className="mb-5 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={onRerun}
                        className="rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-3 py-2 text-xs font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
                    >
                        Re-test at +0.02 threshold
                    </button>
                    <button
                        type="button"
                        onClick={onClear}
                        className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100 transition hover:border-ink-300"
                    >
                        Clear Result
                    </button>
                </div>
            ) : null}

            {/* ── Stat pills grid ── */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatPill
                    label="Score"
                    value={formatThreshold(response.original.score)}
                    tone="info"
                    emphasize
                />

                <StatPill
                    label="Threshold"
                    value={formatThreshold(request.threshold)}
                    tone="caution"
                />

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Confidence Zone</p>
                    <div className="mt-2">
                        <Badge
                            label={response.original.confidence_zone ?? "Unknown"}
                            tone={normalizeConfidenceTone(response.original.confidence_zone ?? "Unknown")}
                            dot
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Risk Level</p>
                    <div className="mt-2">
                        <Badge label={riskLabel} tone={riskTone} dot />
                    </div>
                    <p className="mt-2 text-xs text-ink-200">{formatRiskScore(response.insights.risk_score)}</p>
                </div>
            </div>

            {/* ── Human review callout ── */}
            {humanReviewRecommended ? (
                <div className="mt-4 rounded-xl border border-signal-caution/40 bg-signal-cautionSoft/25 p-3">
                    <Badge label="Human Review Recommended" tone="caution" dot />
                    <p className="mt-2 text-sm text-ink-100">
                        Fairness or instability signals were detected. Route this case for manual review before acting.
                    </p>
                </div>
            ) : null}
        </Card>
    );
}
