import Badge from "@/components/shared/Badge";
import { formatThreshold, formatVariationName, normalizeDecisionTone } from "@/lib/format";
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
    const tone = getVariationTone(row, baselineScore, baselineDecision);
    const isDecisionFlipped = row.decision !== baselineDecision;

    const changeLabel = isDecisionFlipped ? "Flipped" : "Unchanged";
    const changeTone = isDecisionFlipped ? "risk" : "info";

    return (
        <tr className="bg-ink-800/50">
            <td className="px-3 py-2 text-sm font-semibold text-ink-50">{formatVariationName(row.variation)}</td>
            <td className="px-3 py-2 text-ink-100">{formatThreshold(row.score)}</td>
            <td className="px-3 py-2">
                <Badge label={row.decision} tone={normalizeDecisionTone(row.decision)} />
            </td>
            <td className="px-3 py-2">
                <Badge
                    label={changeLabel}
                    tone={changeTone}
                    className={
                        tone === "risk"
                            ? "font-bold"
                            : "border-ink-500/80 bg-ink-600/70 text-ink-200"
                    }
                />
            </td>
        </tr>
    );
}
