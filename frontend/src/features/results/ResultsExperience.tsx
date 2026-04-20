"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AppealCard from "@/components/results/AppealCard";
import DecisionSummaryCard from "@/components/results/DecisionSummaryCard";
import ExplanationCard from "@/components/results/ExplanationCard";
import JuryPanel from "@/components/results/JuryPanel";
import ResultHeroCard from "@/components/results/ResultHeroCard";
import RiskInsightCard from "@/components/results/RiskInsightCard";
import ThresholdSensitivityCard from "@/components/results/ThresholdSensitivityCard";
import VariationsComparisonCard from "@/components/results/VariationsComparisonCard";
import EmptyState from "@/components/shared/EmptyState";
import { clearAuditSession, readAuditSession, saveAuditDraft } from "@/lib/session";
import { AuditSession } from "@/types/audit";

const clampThreshold = (value: number): number => {
    return Math.max(0, Math.min(1, value));
};

export default function ResultsExperience() {
    const router = useRouter();
    const [session, setSession] = useState<AuditSession | null>(null);

    useEffect(() => {
        setSession(readAuditSession());
    }, []);

    if (!session) {
        return (
            <div className="space-y-6">
                <EmptyState
                    title="No audit results yet"
                    description="Run an audit first to see threshold sensitivity, variation outcomes, and appeal-ready actions."
                    ctaLabel="Go to Audit Workspace"
                    ctaHref="/audit"
                />
            </div>
        );
    }

    const rerunWithDelta = (delta: number) => {
        saveAuditDraft({
            domain: session.domain,
            profile: session.request.profile,
            threshold: clampThreshold(session.request.threshold + delta),
        });
        router.push("/audit");
    };

    const clearResult = () => {
        clearAuditSession();
        setSession(null);
    };

    return (
        <div className="space-y-6">
            <ResultHeroCard onRerun={() => rerunWithDelta(0.02)} onClear={clearResult} />
            <DecisionSummaryCard session={session} />

            <div className="grid gap-4 xl:grid-cols-2">
                <RiskInsightCard insights={session.response.insights} reasonTags={session.response.reason_tags} />
                <JuryPanel jury={session.response.ai_jury_view} />
            </div>

            <ThresholdSensitivityCard
                rows={session.response.threshold_analysis}
                baselineThreshold={session.request.threshold}
            />

            <VariationsComparisonCard variations={session.response.variations} />

            <div className="grid gap-4 xl:grid-cols-2">
                <ExplanationCard explanation={session.response.explanation} />
                <AppealCard appeal={session.response.appeal} onRetest={() => rerunWithDelta(0.02)} />
            </div>
        </div>
    );
}
