"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AppealCard from "./components/AppealCard";
import DecisionSummaryCard from "./components/DecisionSummaryCard";
import ExplanationCard from "./components/ExplanationCard";
import JuryPanel from "./components/JuryPanel";
import ResultHeroCard from "./components/ResultHeroCard";
import RiskInsightCard from "./components/RiskInsightCard";
import ThresholdSensitivityCard from "./components/ThresholdSensitivityCard";
import VariationsComparisonCard from "./components/VariationsComparisonCard";
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
            <ResultHeroCard
                session={session}
                onRerun={() => rerunWithDelta(0.02)}
                onClear={clearResult}
            />
            <DecisionSummaryCard session={session} />

            <ThresholdSensitivityCard
                rows={session.response.threshold_analysis}
                baselineThreshold={session.request.threshold}
                originalScore={session.response.original.score}
                confidenceZone={session.response.confidence_zone}
            />
            <VariationsComparisonCard variations={session.response.variations} />
            <RiskInsightCard insights={session.response.insights} reasonTags={session.response.reason_tags} />
            <ExplanationCard explanation={session.response.explanation} />
            <AppealCard appeal={session.response.appeal} />
            <JuryPanel jury={session.response.ai_jury_view} />
        </div>
    );
}
