import VariationRow from "./VariationRow";
import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import { VariationResult } from "@/types/audit";

interface VariationsComparisonCardProps {
    variations: VariationResult[];
}

export default function VariationsComparisonCard({ variations }: VariationsComparisonCardProps) {
    const baselineRow =
        variations.find((row) => row.label === "baseline") ?? variations[0] ?? null;
    const flippedCount =
        baselineRow
            ? variations.filter((row) => row.decision !== baselineRow.decision).length
            : 0;

    if (!baselineRow) {
        return null;
    }

    return (
        <Card
            title="Section 4 — Variations Comparison Card"
            subtitle="Original vs counterfactual scenarios with decision change indicators"
            rightSlot={
                <Badge
                    label={flippedCount > 0 ? `Flipped ${flippedCount}` : "Stable"}
                    tone={flippedCount > 0 ? "risk" : "stable"}
                />
            }
        >
            <div className="overflow-x-auto rounded-xl border border-ink-600/70">
                <table className="min-w-full divide-y divide-ink-600/70 text-sm">
                    <thead className="bg-ink-700/60 text-left text-xs uppercase tracking-wide text-ink-200">
                        <tr>
                            <th className="px-3 py-2">Scenario</th>
                            <th className="px-3 py-2">Score</th>
                            <th className="px-3 py-2">Decision</th>
                            <th className="px-3 py-2">Changed?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-700/70">
                        {variations.map((row) => (
                            <VariationRow
                                key={row.label}
                                row={row}
                                baselineScore={baselineRow.score}
                                baselineDecision={baselineRow.decision}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
