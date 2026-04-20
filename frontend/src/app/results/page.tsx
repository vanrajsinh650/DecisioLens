"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import DemoStepRail from "@/components/features/DemoStepRail";
import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import CopyButton from "@/components/shared/CopyButton";
import EmptyState from "@/components/shared/EmptyState";
import StatPill from "@/components/shared/StatPill";
import {
    formatPercent,
    formatReasonTag,
    formatThreshold,
    formatVariationName,
    normalizeConfidenceTone,
    normalizeDecisionTone,
    normalizeRiskTone,
} from "@/lib/format";
import {
    clearAuditSession,
    readAuditSession,
    saveAuditDraft,
} from "@/lib/session";
import { AuditSession, VariationResult } from "@/types/audit";

const deltaTone = (
    row: VariationResult,
    baselineDecision: "ACCEPT" | "REJECT",
    baselineScore: number,
): "stable" | "caution" | "risk" => {
    if (row.decision !== baselineDecision) return "risk";
    if (Math.abs(row.score - baselineScore) >= 0.03) return "caution";
    return "stable";
};

const clampThreshold = (value: number): number => {
    return Math.max(0, Math.min(1, value));
};

export default function ResultsPage() {
    const router = useRouter();
    const [session, setSession] = useState<AuditSession | null>(null);

    useEffect(() => {
        setSession(readAuditSession());
    }, []);

    const thresholdSwitchPoints = useMemo(() => {
        if (!session) return [] as number[];
        const rows = [...session.response.threshold_analysis].sort((a, b) => a.threshold - b.threshold);
        const switches: number[] = [];

        for (let index = 1; index < rows.length; index += 1) {
            if (rows[index].decision !== rows[index - 1].decision) {
                switches.push(rows[index].threshold);
            }
        }

        return switches;
    }, [session]);

    if (!session) {
        return (
            <div className="space-y-6">
                <DemoStepRail activeStep={3} />
                <EmptyState
                    title="No audit results yet"
                    description="Run an audit first to see threshold sensitivity, variation testing outcomes, and appeal-ready action guidance."
                    ctaLabel="Go to Audit Workspace"
                    ctaHref="/audit"
                />
            </div>
        );
    }

    const { request, response } = session;
    const baselineDecision = response.original.decision;
    const baselineScore = response.original.score;
    const sortedThresholdRows = [...response.threshold_analysis].sort((a, b) => a.threshold - b.threshold);
    const hasBiasFlag = response.reason_tags.includes("bias_detected") || response.insights.bias_detected;
    const hasInstabilityFlag = response.insights.instability || response.reason_tags.includes("profile_instability");

    const createThresholdRerunDraft = (delta: number) => {
        saveAuditDraft({
            domain: session.domain,
            profile: request.profile,
            threshold: clampThreshold(request.threshold + delta),
        });
        router.push("/audit");
    };

    return (
        <div className="space-y-6">
            <DemoStepRail activeStep={3} />

            <SectionHeader
                eyebrow="Structured Evidence Review"
                title="Audit results: instability, bias, and action"
                description="This screen is optimized for demos and judge walkthroughs: clear labels, measurable signals, and an appeal-ready output."
                actions={
                    <>
                        <button
                            type="button"
                            onClick={() => createThresholdRerunDraft(0.02)}
                            className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/25"
                        >
                            Re-run at +0.02 threshold
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                clearAuditSession();
                                setSession(null);
                            }}
                            className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100 transition hover:border-ink-300"
                        >
                            Clear Result
                        </button>
                    </>
                }
            />

            <Card title="Decision Snapshot" subtitle="Immediate quality and risk posture">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatPill
                        label="Decision"
                        value={baselineDecision}
                        tone={normalizeDecisionTone(baselineDecision)}
                    />
                    <StatPill
                        label="Model Score"
                        value={formatPercent(baselineScore)}
                        tone={normalizeConfidenceTone(response.confidence_zone)}
                    />
                    <StatPill
                        label="Confidence Zone"
                        value={response.confidence_zone}
                        tone={normalizeConfidenceTone(response.confidence_zone)}
                    />
                    <StatPill
                        label="Risk"
                        value={`${response.risk.level} (${response.risk.score}/100)`}
                        tone={normalizeRiskTone(response.risk.level)}
                    />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-200">
                    <span>Submitted: {new Date(session.submittedAt).toLocaleString()}</span>
                    <span>·</span>
                    <span>Domain: {session.domain}</span>
                    <span>·</span>
                    <span>Baseline threshold: {formatThreshold(request.threshold)}</span>
                </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card title="Instability & Bias Signals" subtitle="Binary flags plus reason-level evidence">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Badge label={hasInstabilityFlag ? "Instability Detected" : "Stable Pattern"} tone={hasInstabilityFlag ? "caution" : "stable"} />
                        <Badge label={hasBiasFlag ? "Bias Flags Present" : "No Bias Flag"} tone={hasBiasFlag ? "risk" : "stable"} />
                        <Badge
                            label={`Risk: ${response.insights.risk_level}`}
                            tone={normalizeRiskTone(response.insights.risk_level)}
                        />
                    </div>

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-200">Reason Tags</p>
                    <div className="flex flex-wrap gap-2">
                        {(response.reason_tags.length > 0 ? response.reason_tags : ["none"]).map((tag) => (
                            <Badge
                                key={tag}
                                label={formatReasonTag(tag)}
                                tone={tag.includes("bias") ? "risk" : tag.includes("instability") ? "caution" : "info"}
                            />
                        ))}
                    </div>
                </Card>

                <Card title="AI Jury View" subtitle="Structured perspective split for credibility">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-ink-600/70 bg-ink-700/50 p-3">
                            <p className="text-xs uppercase tracking-wide text-ink-200">Auditor</p>
                            <p className="mt-2 text-sm text-ink-50">{response.ai_jury_view.auditor}</p>
                        </div>
                        <div className="rounded-xl border border-ink-600/70 bg-ink-700/50 p-3">
                            <p className="text-xs uppercase tracking-wide text-ink-200">Challenger</p>
                            <p className="mt-2 text-sm text-ink-50">{response.ai_jury_view.challenger}</p>
                        </div>
                        <div className="rounded-xl border border-ink-600/70 bg-ink-700/50 p-3">
                            <p className="text-xs uppercase tracking-wide text-ink-200">Judge</p>
                            <p className="mt-2 text-sm text-ink-50">{response.ai_jury_view.judge}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card
                title="Threshold Sensitivity"
                subtitle="Unique feature: where decision flips as threshold moves"
                rightSlot={
                    <Badge
                        label={`${thresholdSwitchPoints.length} switch ${thresholdSwitchPoints.length === 1 ? "point" : "points"}`}
                        tone={thresholdSwitchPoints.length > 0 ? "caution" : "stable"}
                    />
                }
            >
                <div className="mb-4 flex flex-wrap gap-2">
                    {thresholdSwitchPoints.length > 0 ? (
                        thresholdSwitchPoints.map((point) => (
                            <Badge
                                key={point}
                                label={`Flip @ ${formatThreshold(point)}`}
                                tone="caution"
                            />
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
                            {sortedThresholdRows.map((row) => (
                                <tr key={row.threshold} className="bg-ink-800/50">
                                    <td className="px-3 py-2 text-ink-100">{formatThreshold(row.threshold)}</td>
                                    <td className="px-3 py-2">
                                        <Badge label={row.decision} tone={normalizeDecisionTone(row.decision)} />
                                    </td>
                                    <td className="px-3 py-2 text-ink-200">
                                        {Math.abs(row.threshold - request.threshold) < 0.0001 ? "Current threshold" : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Scenario Variation Testing" subtitle="Unique feature: counterfactual stability checks">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {response.variations.map((row) => {
                        const delta = row.score - baselineScore;
                        const tone = deltaTone(row, baselineDecision, baselineScore);
                        const isBaseline = row.variation === "baseline";

                        return (
                            <div
                                key={row.variation}
                                className="rounded-xl border border-ink-600/70 bg-ink-700/50 p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-ink-50">
                                        {formatVariationName(row.variation)}
                                    </p>
                                    <Badge label={row.decision} tone={normalizeDecisionTone(row.decision)} />
                                </div>
                                <p className="mt-2 text-xs text-ink-200">Score: {formatPercent(row.score)}</p>
                                <p className="mt-1 text-xs text-ink-200">
                                    Delta vs baseline: {delta >= 0 ? "+" : ""}
                                    {formatPercent(delta)}
                                </p>
                                <div className="mt-2">
                                    <Badge label={isBaseline ? "Reference" : "Variation"} tone={tone} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card
                    title="Structured Explanation"
                    subtitle="Narrative output with copy shortcut"
                    rightSlot={<CopyButton value={response.explanation} label="Copy Explanation" />}
                >
                    <pre className="whitespace-pre-wrap rounded-xl border border-ink-600/70 bg-ink-900/60 p-4 text-sm leading-relaxed text-ink-100">
                        {response.explanation}
                    </pre>
                </Card>

                <Card
                    title="Action + Appeal"
                    subtitle="Demo finish: concrete next step for user"
                    rightSlot={<CopyButton value={response.appeal} label="Copy Appeal" />}
                >
                    <pre className="whitespace-pre-wrap rounded-xl border border-ink-600/70 bg-ink-900/60 p-4 text-sm leading-relaxed text-ink-100">
                        {response.appeal}
                    </pre>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => createThresholdRerunDraft(0.02)}
                            className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/25"
                        >
                            Re-test with +0.02 threshold
                        </button>
                        <Link
                            href="/audit"
                            className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100 transition hover:border-ink-300"
                        >
                            Adjust input profile
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
