"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AppealCard from "./components/AppealCard";
import ExplanationCard from "./components/ExplanationCard";
import JuryPanel from "./components/JuryPanel";
import ResultHeroCard from "./components/ResultHeroCard";
import RiskInsightCard from "./components/RiskInsightCard";
import ThresholdSensitivityCard from "./components/ThresholdSensitivityCard";
import VariationsComparisonCard from "./components/VariationsComparisonCard";
import SectionHeader from "@/components/layout/SectionHeader";
import CopyButton from "@/components/shared/CopyButton";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { printAuditReport } from "@/lib/export";
import { decodeSession, encodeSession } from "@/lib/share";
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

    useEffect(() => {
        const encoded = searchParams.get("data");
        const historyId = searchParams.get("id") ?? getSelectedHistoryAuditId();

        if (encoded) {
            const decodedSession = decodeSession(encoded);
            if (!decodedSession) {
                setError("Shared link is invalid or corrupted.");
                setSession(null);
                setReadOnly(true);
                setIsSessionReady(true);
                return;
            }

            setSession(decodedSession);
            setError(null);
            setReadOnly(true);
            setIsSessionReady(true);
            return;
        }

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

    const shareUrl = useMemo(() => {
        if (!session || typeof window === "undefined") {
            return "";
        }

        return `${window.location.origin}/results?data=${encodeSession(session)}`;
    }, [session]);

    if (!isSessionReady) {
        return (
            <LoadingState
                label="Fetching results..."
                description="Loading the latest audit snapshot, variation checks, and appeal text."
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
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            id="btn-download-report"
                            data-no-print
                            type="button"
                            onClick={() => printAuditReport(String(session.request.profile.name ?? "Audit Report"))}
                            className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100"
                        >
                            ⬇ Download Report
                        </button>
                        <CopyButton
                            id="btn-share-result"
                            value={shareUrl}
                            label="Copy Share Link"
                            copiedLabel="Share Link Copied"
                        />
                    </div>
                }
            />

            <div className="print-section">
                <ResultHeroCard
                    session={session}
                    onRerun={() => rerunWithDelta(0.02)}
                    onClear={clearResult}
                    readOnly={readOnly}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="print-section xl:col-span-2">
                    <ThresholdSensitivityCard
                        rows={session.response.threshold_analysis}
                        baselineThreshold={session.request.threshold}
                        originalScore={session.response.original.score}
                        confidenceZone={session.response.original.confidence_zone ?? "Unknown"}
                    />
                </div>

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
                    <AppealCard appeal={session.response.appeal} />
                </div>

                {session.response.ai_jury_view ? (
                    <div className="print-section xl:col-span-2">
                        <JuryPanel jury={session.response.ai_jury_view} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
