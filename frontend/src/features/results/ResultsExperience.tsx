"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";

import AppealCard from "./components/AppealCard";
import ExplanationCard from "./components/ExplanationCard";
import HumanReviewCard from "./components/HumanReviewCard";
import ImpactAnalysisCard from "./components/ImpactAnalysisCard";
import JuryPanel from "./components/JuryPanel";
import RecourseCard from "./components/RecourseCard";
import ResultHeroCard from "./components/ResultHeroCard";
import RiskInsightCard from "./components/RiskInsightCard";
import StabilityZoneCard from "./components/StabilityZoneCard";
import ThresholdSensitivityCard from "./components/ThresholdSensitivityCard";
import VariationsComparisonCard from "./components/VariationsComparisonCard";
import SectionHeader from "@/components/layout/SectionHeader";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { clearAuditSession, readAuditSession, saveAuditDraft } from "@/lib/session";
import {
    clearSelectedHistoryAuditId,
    getAuditHistory,
    getSelectedHistoryAuditId,
    getAuditHistoryItem,
} from "@/lib/storage";
import { AuditSession } from "@/types/audit";

const clampThreshold = (value: number): number => {
    return Math.max(0, Math.min(1, value));
};

export default function ResultsExperience() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [session, setSession] = useState<AuditSession | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [readOnly, setReadOnly] = useState(false);
    const [isSessionReady, setIsSessionReady] = useState(false);
    const revealContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const historyId = searchParams.get("id") ?? getSelectedHistoryAuditId();
        
        if (historyId) {
            const fromHistory = getAuditHistoryItem(historyId)
                ?? getAuditHistory().find((item) => item.id === historyId)
                ?? null;

            if (!fromHistory) {
                setError("The selected history record could not be found.");
                setSession(null);
                setReadOnly(true);
                setIsSessionReady(true);
                return;
            }

            setSession({
                domain: fromHistory.domain,
                request: fromHistory.request,
                response: fromHistory.response,
                submittedAt: fromHistory.submittedAt,
            });
            clearSelectedHistoryAuditId();
            setError(null);
            setReadOnly(true);
            setIsSessionReady(true);
            return;
        }

        setSession(readAuditSession());
        setError(null);
        setReadOnly(false);
        setIsSessionReady(true);
    }, [searchParams.toString()]);

    // IntersectionObserver for scroll reveal
    useEffect(() => {
        if (!session || !revealContainerRef.current) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            const els = revealContainerRef.current.querySelectorAll(".dl-reveal, .dl-reveal-card, .dl-gauge");
            els.forEach((el) => el.classList.add("revealed"));
            return;
        }

        // Small delay so DOM has time to render the results
        const timer = setTimeout(() => {
            if (!revealContainerRef.current) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const el = entry.target as HTMLElement;
                            const delay = el.dataset.staggerDelay;
                            if (delay) {
                                setTimeout(() => el.classList.add("revealed"), parseFloat(delay) * 1000);
                            } else {
                                el.classList.add("revealed");
                            }
                            observer.unobserve(el);
                        }
                    });
                },
                { threshold: 0.15 }
            );

            const elements = revealContainerRef.current.querySelectorAll(".dl-reveal, .dl-reveal-card, .dl-gauge");
            elements.forEach((el) => observer.observe(el));

            return () => observer.disconnect();
        }, 100);

        return () => clearTimeout(timer);
    }, [session]);

    if (!isSessionReady) {
        return (
            <LoadingState
                label="Fetching results"
                description="Loading the latest audit snapshot."
            />
        );
    }

    if (error) {
        return (
            <EmptyState
                title="Unable to load report"
                description={error}
                ctaLabel="Run a fresh audit"
                ctaHref="/audit"
            />
        );
    }

    if (!session) {
        return (
            <EmptyState
                title="No results yet"
                description="Scan an AI decision first to see where it could be wrong and why."
                ctaLabel="Scan a Decision"
                ctaHref="/audit"
            />
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
        <div ref={revealContainerRef} style={{ display: "flex", flexDirection: "column", gap: "64px" }}>
            <SectionHeader
                overline={`${session.domain?.toUpperCase() ?? "ANALYSIS"} · YOUR RESULT`}
                title="Decision Trust Report"
                subtitle="This report shows if the AI decision about you was fair, stable, and trustworthy."
            />

            {/* Section 1 Verdict Hero */}
            <div className="print-section">
                <ResultHeroCard
                    session={session}
                    onRerun={() => rerunWithDelta(0.02)}
                    onClear={clearResult}
                    readOnly={readOnly}
                />
            </div>

            {/* Section 2 Decision Stability Zone */}
            {session.response.stability_zone && (
                <div className="print-section">
                    <StabilityZoneCard stabilityZone={session.response.stability_zone} />
                </div>
            )}

            {/* Section 3 Impact Analysis */}
            {session.response.impact_analysis && session.response.impact_analysis.length > 0 && (
                <div className="print-section">
                    <ImpactAnalysisCard impacts={session.response.impact_analysis} />
                </div>
            )}

            {/* Section 4 Threshold Sensitivity */}
            <div className="print-section">
                <ThresholdSensitivityCard
                    rows={session.response.threshold_analysis}
                    baselineThreshold={session.request.threshold}
                    originalScore={session.response.original.score}
                    confidenceZone={session.response.original.confidence_zone ?? "Unknown"}
                />
            </div>

            {/* Section 5 What happens if we change small details? */}
            <div className="print-section">
                <VariationsComparisonCard variations={session.response.variations} />
            </div>

            {/* Section 4 Risk Summary */}
            <div className="print-section">
                <RiskInsightCard
                    insights={session.response.insights}
                    reasonTags={session.response.insights.reason_tags}
                />
            </div>

            {/* Section 4a Request Human Review */}
            {session.response.human_review && (
                <div className="print-section">
                    <HumanReviewCard humanReview={session.response.human_review} />
                </div>
            )}

            {/* Section 5 What This Means For You */}
            <div className="print-section">
                <ExplanationCard explanation={session.response.explanation} />
            </div>

            {/* Section 5a How To Improve Your Chances */}
            {session.response.recourse && session.response.recourse.length > 0 && (
                <div className="print-section">
                    <RecourseCard
                        recourse={session.response.recourse}
                        originalDecision={session.response.original.decision}
                    />
                </div>
            )}

            {/* Section 6 What You Can Do Next */}
            <div className="print-section">
                <AppealCard
                    appeal={session.response.appeal}
                    explanationRequest={session.response.explanation_request}
                />
            </div>

            {/* Section 7 What Our System Says */}
            {session.response.ai_jury_view ? (
                <div className="print-section">
                    <JuryPanel jury={session.response.ai_jury_view} />
                </div>
            ) : null}
        </div>
    );
}
