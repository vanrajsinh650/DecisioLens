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
    const isDecisionFlipped = row.changed || row.decision !== baselineDecision;

    const changeLabel = isDecisionFlipped ? "Decision Flipped" : "No Decision Change";
    const changeTone = isDecisionFlipped ? "risk" : "stable";
    const rowClassName = isDecisionFlipped
        ? "bg-signal-riskSoft/30"
        : tone === "caution"
            ? "bg-signal-cautionSoft/20"
            : "bg-ink-800/50";

    return (
        <tr className={rowClassName}>
            <td className="px-3 py-2 text-sm font-semibold text-ink-50">{formatVariationName(row.label)}</td>
            <td className="px-3 py-2 text-ink-100">{`Score: ${formatThreshold(row.score)}`}</td>
            <td className="px-3 py-2">
                <Badge label={row.decision} tone={normalizeDecisionTone(row.decision)} dot />
            </td>
            <td className="px-3 py-2">
                <Badge
                    label={changeLabel}
                    tone={changeTone}
                    className={
                        tone === "risk"
                            ? "font-bold"
                            : tone === "caution"
                                ? "border-signal-caution/40 bg-signal-cautionSoft/60 text-signal-caution"
                                : ""
                    }
                    dot
                />
            </td>
        </tr>
    );
}
