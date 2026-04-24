"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";

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
    const revealContainerRef = useRef<HTMLDivElement>(null);

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

    const shareUrl = useMemo(() => {
        if (!session || typeof window === "undefined") {
            return "";
        }

        return `${window.location.origin}/results?data=${encodeSession(session)}`;
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
                description="Scan an AI decision first to see where it could be wrong — and why."
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
                overline="VERDICT CHAMBER"
                title="Decision Trust Report"
                subtitle="Scrollable narrative. Each section is a chapter. Understand the verdict before reading details."
                actions={
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                        <button
                            id="btn-download-report"
                            data-no-print
                            type="button"
                            onClick={() => printAuditReport(String(session.request.profile.name ?? "Audit Report"))}
                            className="font-mono uppercase"
                            style={{
                                fontSize: "var(--fs-label)",
                                letterSpacing: "0.12em",
                                color: "var(--t2)",
                                background: "var(--s2)",
                                border: "1px solid var(--rim)",
                                borderRadius: "6px",
                                padding: "8px 12px",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                            }}
                        >
                            Download Report
                        </button>
                        <CopyButton
                            id="btn-share-result"
                            value={shareUrl}
                            label="Share Link →"
                            copiedLabel="✓ Copied"
                        />
                    </div>
                }
            />

            {/* Section 1 — Verdict Hero */}
            <div className="print-section">
                <ResultHeroCard
                    session={session}
                    onRerun={() => rerunWithDelta(0.02)}
                    onClear={clearResult}
                    readOnly={readOnly}
                />
            </div>

            {/* Section 2 — Signal Analysis */}
            <div className="print-section">
                <ThresholdSensitivityCard
                    rows={session.response.threshold_analysis}
                    baselineThreshold={session.request.threshold}
                    originalScore={session.response.original.score}
                    confidenceZone={session.response.original.confidence_zone ?? "Unknown"}
                />
            </div>

            {/* Section 3 — Scenario Drift */}
            <div className="print-section">
                <VariationsComparisonCard variations={session.response.variations} />
            </div>

            {/* Section 4 — Risk Intelligence */}
            <div className="print-section">
                <RiskInsightCard
                    insights={session.response.insights}
                    reasonTags={session.response.insights.reason_tags}
                />
            </div>

            {/* Section 5 — Decoded Insight */}
            <div className="print-section">
                <ExplanationCard explanation={session.response.explanation} />
            </div>

            {/* Section 6 — Response Protocol */}
            <div className="print-section">
                <AppealCard appeal={session.response.appeal} />
            </div>

            {/* Section 7 — Jury Panel */}
            {session.response.ai_jury_view ? (
                <div className="print-section">
                    <JuryPanel jury={session.response.ai_jury_view} />
                </div>
            ) : null}
        </div>
    );
}
