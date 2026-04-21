import VariationRow from "./VariationRow";
import Card from "@/components/shared/Card";
import { VariationResult } from "@/types/audit";

interface VariationsComparisonCardProps {
    variations: VariationResult[];
}

export default function VariationsComparisonCard({ variations }: VariationsComparisonCardProps) {
    const baselineRow =
        variations.find((row) => row.variation === "baseline") ?? variations[0] ?? null;

    if (!baselineRow) {
        return null;
    }

    return (
        <Card
            title="Section 4 — Variations Comparison Card"
            subtitle="Original vs counterfactual scenarios with decision change indicators"
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
                                key={row.variation}
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
