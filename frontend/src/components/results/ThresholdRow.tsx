import Badge from "@/components/shared/Badge";
import { formatThreshold, normalizeDecisionTone } from "@/lib/format";
import { ThresholdAnalysisRow } from "@/types/audit";

interface ThresholdRowProps {
    row: ThresholdAnalysisRow;
    baselineThreshold: number;
}

export default function ThresholdRow({ row, baselineThreshold }: ThresholdRowProps) {
    return (
        <tr className="bg-ink-800/50">
            <td className="px-3 py-2 text-ink-100">{formatThreshold(row.threshold)}</td>
            <td className="px-3 py-2">
                <Badge label={row.decision} tone={normalizeDecisionTone(row.decision)} />
            </td>
            <td className="px-3 py-2 text-ink-200">
                {Math.abs(row.threshold - baselineThreshold) < 0.0001 ? "Current threshold" : "-"}
            </td>
        </tr>
    );
}
