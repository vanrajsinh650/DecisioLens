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
        <Card title="Scenario Variation Testing" subtitle="Counterfactual stability checks">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {variations.map((row) => (
                    <VariationRow
                        key={row.variation}
                        row={row}
                        baselineScore={baselineRow.score}
                        baselineDecision={baselineRow.decision}
                    />
                ))}
            </div>
        </Card>
    );
}
