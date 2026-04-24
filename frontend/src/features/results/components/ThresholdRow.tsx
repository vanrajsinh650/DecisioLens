import { formatSignedNumber, formatThreshold } from "@/lib/format";
import { ThresholdAnalysisItem } from "@/types/audit";

interface ThresholdRowProps {
    row: ThresholdAnalysisItem;
    baselineThreshold: number;
    originalDecision?: string;
    index: number;
}

export default function ThresholdRow({ row, baselineThreshold, originalDecision, index }: ThresholdRowProps) {
    const isBaseline = Math.abs(row.threshold - baselineThreshold) < 0.001;
    const isFlipped = originalDecision ? row.decision !== originalDecision : false;
    const delta = row.threshold - baselineThreshold;

    // Alternating rows in var(--s1) and var(--s2)
    const bgClass = index % 2 === 0 ? "bg-s1" : "bg-s2";

    return (
        <tr className={`border-t border-rim ${bgClass}`}>
            <td className="px-4 py-3 font-mono text-mono text-t1">
                {isBaseline ? "Baseline (Current)" : `${formatSignedNumber(delta * 100, 0)}% strictness`}
            </td>
            <td className="px-4 py-3 font-mono text-mono text-t2">
                {formatThreshold(row.threshold * 100)}
            </td>
            <td className="px-4 py-3 font-mono text-mono text-t1">
                {row.decision}
            </td>
            <td className="px-4 py-3">
                {isFlipped ? (
                    <span className="rounded-[4px] bg-a-crimson-surface border border-a-crimson/40 px-2 py-1 font-mono text-xs uppercase tracking-wider text-a-crimson">
                        FLIPPED
                    </span>
                ) : (
                    <span className="font-mono text-xs uppercase tracking-wider text-t2">
                        UNCHANGED
                    </span>
                )}
            </td>
        </tr>
    );
}
