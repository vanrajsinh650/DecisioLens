import ThresholdRow from "@/components/results/ThresholdRow";
import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import { formatThreshold } from "@/lib/format";
import { ThresholdAnalysisRow } from "@/types/audit";

interface ThresholdSensitivityCardProps {
    rows: ThresholdAnalysisRow[];
    baselineThreshold: number;
}

export default function ThresholdSensitivityCard({
    rows,
    baselineThreshold,
}: ThresholdSensitivityCardProps) {
    const sortedRows = [...rows].sort((a, b) => a.threshold - b.threshold);

    const switchPoints: number[] = [];
    for (let index = 1; index < sortedRows.length; index += 1) {
        if (sortedRows[index].decision !== sortedRows[index - 1].decision) {
            switchPoints.push(sortedRows[index].threshold);
        }
    }

    return (
        <Card
            title="Threshold Sensitivity"
            subtitle="Unique feature: where decision flips as threshold moves"
            rightSlot={
                <Badge
                    label={`${switchPoints.length} switch ${switchPoints.length === 1 ? "point" : "points"}`}
                    tone={switchPoints.length > 0 ? "caution" : "stable"}
                />
            }
        >
            <div className="mb-4 flex flex-wrap gap-2">
                {switchPoints.length > 0 ? (
                    switchPoints.map((point) => (
                        <Badge key={point} label={`Flip @ ${formatThreshold(point)}`} tone="caution" />
                    ))
                ) : (
                    <Badge label="No flips across scanned thresholds" tone="stable" />
                )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink-600/70">
                <table className="min-w-full divide-y divide-ink-600/70 text-sm">
                    <thead className="bg-ink-700/60 text-left text-xs uppercase tracking-wide text-ink-200">
                        <tr>
                            <th className="px-3 py-2">Threshold</th>
                            <th className="px-3 py-2">Decision</th>
                            <th className="px-3 py-2">At Baseline?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-700/70">
                        {sortedRows.map((row) => (
                            <ThresholdRow key={row.threshold} row={row} baselineThreshold={baselineThreshold} />
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
