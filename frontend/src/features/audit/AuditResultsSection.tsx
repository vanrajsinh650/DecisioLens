"use client";

import SectionHeader from "@/components/layout/SectionHeader";
import AppealCard from "@/features/results/components/AppealCard";
import DecisionSummaryCard from "@/features/results/components/DecisionSummaryCard";
import ExplanationCard from "@/features/results/components/ExplanationCard";
import ImpactAnalysisCard from "@/features/results/components/ImpactAnalysisCard";
import JuryPanel from "@/features/results/components/JuryPanel";
import RawAuditPayloadCard from "@/features/results/components/RawAuditPayloadCard";
import ResultHeroCard from "@/features/results/components/ResultHeroCard";
import RiskInsightCard from "@/features/results/components/RiskInsightCard";
import StabilityZoneCard from "@/features/results/components/StabilityZoneCard";
import ThresholdSensitivityCard from "@/features/results/components/ThresholdSensitivityCard";
import VariationsComparisonCard from "@/features/results/components/VariationsComparisonCard";
import { AuditSession } from "@/types/audit";

interface AuditResultsSectionProps {
    session: AuditSession;
    onRerun: () => Promise<void>;
    onClear: () => void;
}

export default function AuditResultsSection({ session, onRerun, onClear }: AuditResultsSectionProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            <SectionHeader
                overline="ANALYSIS RESULTS"
                title="Live Results"
                subtitle="Your analysis results appear below. Scroll to see each section."
            />

            <RawAuditPayloadCard session={session} />

            <div className="print-section">
                <ResultHeroCard
                    session={session}
                    onRerun={onRerun}
                    onClear={onClear}
                />
            </div>
            <div className="print-section">
                <DecisionSummaryCard session={session} />
            </div>

            <div className="print-section">
                <ThresholdSensitivityCard
                    rows={session.response.threshold_analysis}
                    baselineThreshold={session.request.threshold}
                    originalScore={session.response.original.score}
                    originalDecision={session.response.original.decision}
                    confidenceZone={session.response.original.confidence_zone ?? "Unknown"}
                />
            </div>

            {session.response.stability_zone && (
                <div className="print-section">
                    <StabilityZoneCard stabilityZone={session.response.stability_zone} />
                </div>
            )}

            {session.response.impact_analysis && session.response.impact_analysis.length > 0 && (
                <div className="print-section">
                    <ImpactAnalysisCard impacts={session.response.impact_analysis} />
                </div>
            )}

            <div className="print-section">
                <VariationsComparisonCard variations={session.response.variations} />
            </div>
            <div className="print-section">
                <RiskInsightCard
                    insights={session.response.insights}
                    reasonTags={session.response.insights.reason_tags}
                />
            </div>
            <div className="print-section">
                <ExplanationCard explanation={session.response.explanation} />
            </div>
            <div className="print-section">
                <AppealCard appeal={session.response.appeal} explanationRequest={session.response.explanation_request} />
            </div>
            {session.response.ai_jury_view ? (
                <div className="print-section">
                    <JuryPanel jury={session.response.ai_jury_view} />
                </div>
            ) : null}
        </div>
    );
}
