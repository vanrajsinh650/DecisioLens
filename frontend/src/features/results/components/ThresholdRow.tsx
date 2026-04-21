import Badge from "@/components/shared/Badge";
import { formatThreshold, normalizeDecisionTone } from "@/lib/format";
import { Decision, ThresholdAnalysisRow } from "@/types/audit";

interface ThresholdRowProps {
    row: ThresholdAnalysisRow;
    baselineThreshold: number;
    selectedThreshold: number;
    baselineDecision: Decision;
}

export default function ThresholdRow({
    row,
    baselineThreshold,
    selectedThreshold,
    baselineDecision,
}: ThresholdRowProps) {
    const isBaselineThreshold = Math.abs(row.threshold - baselineThreshold) < 0.0001;
    const isSelectedThreshold = Math.abs(row.threshold - selectedThreshold) < 0.0001;
    const decisionChanged = row.decision !== baselineDecision;

    return (
        <tr className="bg-ink-800/50">
            <td className="px-3 py-2 text-ink-100">{formatThreshold(row.threshold)}</td>
            <td className="px-3 py-2">
                <Badge label={row.decision} tone={normalizeDecisionTone(row.decision)} dot />
            </td>
            <td className="px-3 py-2 text-ink-200">
                <Badge
                    label={decisionChanged ? "Flips from baseline" : "Same as baseline"}
                    tone={decisionChanged ? "caution" : "stable"}
                    className="px-2 py-0.5 text-[10px]"
                    dot
                />
            </td>
            <td className="px-3 py-2 text-ink-200">
                {isSelectedThreshold
                    ? "Slider"
                    : isBaselineThreshold
                        ? "Baseline"
                        : "-"}
            </td>
        </tr>
    );
}
