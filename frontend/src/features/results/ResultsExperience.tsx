"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AppealCard from "./components/AppealCard";
import ExplanationCard from "./components/ExplanationCard";
import JuryPanel from "./components/JuryPanel";
import ResultHeroCard from "./components/ResultHeroCard";
import RiskInsightCard from "./components/RiskInsightCard";
import ThresholdSensitivityCard from "./components/ThresholdSensitivityCard";
import VariationsComparisonCard from "./components/VariationsComparisonCard";
import SectionHeader from "@/components/layout/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { clearAuditSession, readAuditSession, saveAuditDraft } from "@/lib/session";
import { AuditSession } from "@/types/audit";

const clampThreshold = (value: number): number => {
    return Math.max(0, Math.min(1, value));
};

export default function ResultsExperience() {
    const router = useRouter();
    const [session, setSession] = useState<AuditSession | null>(null);
    const [isSessionReady, setIsSessionReady] = useState(false);

    useEffect(() => {
        setSession(readAuditSession());
        setIsSessionReady(true);
    }, []);

    if (!isSessionReady) {
        return (
            <LoadingState
                label="Fetching results..."
                description="Loading the latest audit snapshot, variation checks, and appeal text."
            />
        );
    }

    if (!session) {
        return (
            <div className="space-y-6">
                <EmptyState
                    title="No results yet"
                    description="Test an AI decision first to see if it's stable, fair, and explainable."
                    ctaLabel="Test a Decision"
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
            <SectionHeader
                eyebrow="DecisioLens"
                title="Decision Trust Report"
                description="See if this AI decision is stable, fair, and explainable."
            />

            <ResultHeroCard
                session={session}
                onRerun={() => rerunWithDelta(0.02)}
                onClear={clearResult}
            />

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="xl:col-span-2">
                    <ThresholdSensitivityCard
                        rows={session.response.threshold_analysis}
                        baselineThreshold={session.request.threshold}
                        originalScore={session.response.original.score}
                        confidenceZone={session.response.original.confidence_zone ?? "Unknown"}
                    />
                </div>

                <VariationsComparisonCard variations={session.response.variations} />

                <RiskInsightCard
                    insights={session.response.insights}
                    reasonTags={session.response.insights.reason_tags}
                />

                <ExplanationCard explanation={session.response.explanation} />
                <AppealCard appeal={session.response.appeal} />

                {session.response.ai_jury_view ? (
                    <div className="xl:col-span-2">
                        <JuryPanel jury={session.response.ai_jury_view} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
