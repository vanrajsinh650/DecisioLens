import Badge from "@/components/shared/Badge";
import { formatPercent, formatVariationName, normalizeDecisionTone } from "@/lib/format";
import { Decision, VariationResult } from "@/types/audit";

interface VariationRowProps {
    row: VariationResult;
    baselineScore: number;
    baselineDecision: Decision;
}

function getVariationTone(
    row: VariationResult,
    baselineScore: number,
    baselineDecision: Decision,
): "stable" | "caution" | "risk" {
    if (row.decision !== baselineDecision) return "risk";
    if (Math.abs(row.score - baselineScore) >= 0.03) return "caution";
    return "stable";
}

export default function VariationRow({
    row,
    baselineScore,
    baselineDecision,
}: VariationRowProps) {
    const delta = row.score - baselineScore;
    const tone = getVariationTone(row, baselineScore, baselineDecision);
    const isBaseline = row.variation === "baseline";

    return (
        <div className="rounded-xl border border-ink-600/70 bg-ink-700/50 p-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink-50">{formatVariationName(row.variation)}</p>
                <Badge label={row.decision} tone={normalizeDecisionTone(row.decision)} />
            </div>

            <p className="mt-2 text-xs text-ink-200">Score: {formatPercent(row.score)}</p>
            <p className="mt-1 text-xs text-ink-200">
                Delta vs baseline: {delta >= 0 ? "+" : ""}
                {formatPercent(delta)}
            </p>
            <div className="mt-2">
                <Badge label={isBaseline ? "Reference" : "Variation"} tone={tone} />
            </div>
        </div>
    );
}
