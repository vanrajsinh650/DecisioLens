"use client";

import { useEffect, useState } from "react";

import ThresholdRow from "./ThresholdRow";
import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import {
    formatThreshold,
    normalizeConfidenceTone,
    normalizeDecisionTone,
    shouldRecommendHumanReview,
} from "@/lib/format";
import { Decision, ThresholdAnalysisRow } from "@/types/audit";

interface ThresholdSensitivityCardProps {
    rows: ThresholdAnalysisRow[];
    baselineThreshold: number;
    originalScore: number;
    confidenceZone: string;
}

const clampThreshold = (value: number): number => {
    return Math.max(0, Math.min(1, value));
};

const getDecisionAtThreshold = (score: number, threshold: number): Decision => {
    return score >= threshold ? "ACCEPT" : "REJECT";
};

export default function ThresholdSensitivityCard({
    rows,
    baselineThreshold,
    originalScore,
    confidenceZone,
}: ThresholdSensitivityCardProps) {
    const sortedRows = [...rows].sort((a, b) => a.threshold - b.threshold);
    const [selectedThreshold, setSelectedThreshold] = useState(baselineThreshold);

    useEffect(() => {
        setSelectedThreshold(baselineThreshold);
    }, [baselineThreshold]);

    const switchPoints: number[] = [];
    for (let index = 1; index < sortedRows.length; index += 1) {
        if (sortedRows[index].decision !== sortedRows[index - 1].decision) {
            switchPoints.push(sortedRows[index].threshold);
        }
    }

    const firstSwitchPoint = switchPoints[0];
    const baselineDecision = getDecisionAtThreshold(originalScore, baselineThreshold);
    const simulatedDecision = getDecisionAtThreshold(originalScore, selectedThreshold);
    const hasBorderlineSignal =
        confidenceZone.toLowerCase().includes("borderline") || switchPoints.length > 0;
    const humanReviewRecommended = shouldRecommendHumanReview({
        riskScore: hasBorderlineSignal ? 71 : 30,
        reasonTags: switchPoints.length > 0 ? ["threshold_sensitive"] : [],
        instabilityDetected: switchPoints.length > 0,
        confidenceZone,
    });

    const baselineConfidenceLabel = confidenceZone || "Unknown";

    return (
        <Card
            title="Threshold Sensitivity"
            subtitle="Threshold-wise outcomes and points where the decision flips"
            rightSlot={
                <Badge
                    label={hasBorderlineSignal ? "Borderline / Unstable Flag" : "Stable Threshold Pattern"}
                    tone={hasBorderlineSignal ? "caution" : "stable"}
                    dot
                />
            }
        >
            <div className="mb-4 rounded-xl border border-ink-600/70 bg-ink-700/50 p-3">
                <p className="text-sm font-semibold text-ink-50">
                    {firstSwitchPoint !== undefined
                        ? `Decision flips at threshold ${formatThreshold(firstSwitchPoint)}`
                        : "No decision flip in scanned thresholds"}
                </p>
                <p className="mt-1 text-sm text-ink-200">
                    {hasBorderlineSignal
                        ? "This indicates a borderline outcome"
                        : "This indicates a stable outcome"}
                </p>
            </div>

            <div className="mb-4 rounded-xl border border-ink-600/70 bg-ink-700/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">
                        Interactive Threshold Simulator (Threshold: {formatThreshold(selectedThreshold)})
                    </p>
                    <Badge label={simulatedDecision} tone={normalizeDecisionTone(simulatedDecision)} dot />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px] sm:items-center">
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={selectedThreshold}
                        onChange={(event) => setSelectedThreshold(clampThreshold(Number(event.target.value)))}
                        className="w-full accent-signal-info"
                    />
                    <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.01}
                        value={selectedThreshold.toFixed(2)}
                        onChange={(event) => setSelectedThreshold(clampThreshold(Number(event.target.value)))}
                        className="rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50 outline-none transition focus:border-signal-info/60 focus:ring-2 focus:ring-signal-info/20"
                    />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-200">
                    <span>Score: {formatThreshold(originalScore)}</span>
                    <span>·</span>
                    <span>Baseline decision: {baselineDecision}</span>
                    <span>·</span>
                    <Badge label={baselineConfidenceLabel} tone={normalizeConfidenceTone(baselineConfidenceLabel)} dot />
                </div>
            </div>

            {humanReviewRecommended ? (
                <div className="mb-4 rounded-xl border border-signal-caution/40 bg-signal-cautionSoft/25 p-3">
                    <Badge label="Human Review Recommended" tone="caution" dot />
                    <p className="mt-1 text-sm text-ink-100">
                        Threshold-sensitive behavior was detected. Consider manual review to ensure a fair final decision.
                    </p>
                </div>
            ) : null}

            <div className="mb-3 flex flex-wrap gap-2">
                {switchPoints.length > 0 ? (
                    switchPoints.map((point) => (
                        <Badge key={point} label={`Decision Flipped @ Threshold: ${formatThreshold(point)}`} tone="caution" dot />
                    ))
                ) : (
                    <Badge label="No flips across scanned thresholds" tone="stable" dot />
                )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink-600/70">
                <table className="min-w-full divide-y divide-ink-600/70 text-sm">
                    <thead className="bg-ink-700/60 text-left text-xs uppercase tracking-wide text-ink-200">
                        <tr>
                            <th className="px-3 py-2">Threshold</th>
                            <th className="px-3 py-2">Decision</th>
                            <th className="px-3 py-2">Change vs Baseline</th>
                            <th className="px-3 py-2">Marker</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-700/70">
                        {sortedRows.map((row) => (
                            <ThresholdRow
                                key={row.threshold}
                                row={row}
                                baselineThreshold={baselineThreshold}
                                selectedThreshold={selectedThreshold}
                                baselineDecision={baselineDecision}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
