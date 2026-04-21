"use client";

import { useEffect, useMemo, useState } from "react";

import AuditForm from "./components/AuditForm";
import AuditPresetCard from "./components/AuditPresetCard";
import SectionHeader from "@/components/layout/SectionHeader";
import Card from "@/components/shared/Card";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import AppealCard from "@/features/results/components/AppealCard";
import DecisionSummaryCard from "@/features/results/components/DecisionSummaryCard";
import ExplanationCard from "@/features/results/components/ExplanationCard";
import JuryPanel from "@/features/results/components/JuryPanel";
import RawAuditPayloadCard from "@/features/results/components/RawAuditPayloadCard";
import ResultHeroCard from "@/features/results/components/ResultHeroCard";
import RiskInsightCard from "@/features/results/components/RiskInsightCard";
import ThresholdSensitivityCard from "@/features/results/components/ThresholdSensitivityCard";
import VariationsComparisonCard from "@/features/results/components/VariationsComparisonCard";
import { useAudit } from "@/hooks/useAudit";
import {
    DEFAULT_DOMAIN,
    DEFAULT_PROFILE,
    DEFAULT_THRESHOLD,
    DOMAIN_OPTIONS,
} from "@/lib/constants";
import {
    clearAuditDraft,
    clearAuditSession,
    readAuditDraft,
    saveAuditDraft,
    saveAuditSession,
} from "@/lib/session";
import { AuditProfile, AuditRequest, AuditSession, DomainType } from "@/types/audit";

function clampThreshold(value: number): number {
    return Math.max(0, Math.min(1, value));
}

export default function AuditWorkspace() {
    const { submitAudit, loading, error, result, lastRequest, clearResult } = useAudit();

    const [domain, setDomain] = useState<DomainType>(DEFAULT_DOMAIN);
    const [profile, setProfile] = useState<AuditProfile>({ ...DEFAULT_PROFILE });
    const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);
    const [lastSubmission, setLastSubmission] = useState<{
        domain: DomainType;
        request: AuditRequest;
        submittedAt: string;
    } | null>(null);

    useEffect(() => {
        const draft = readAuditDraft();

        if (!draft) {
            return;
        }

        setDomain(draft.domain);
        setProfile(draft.profile);
        setThreshold(draft.threshold);
    }, []);

    const activeDomainDescription = useMemo(() => {
        const selected = DOMAIN_OPTIONS.find((option) => option.value === domain);
        return selected?.description ?? "";
    }, [domain]);

    const persistDraft = (nextDomain: DomainType, nextProfile: AuditProfile, nextThreshold: number) => {
        saveAuditDraft({
            domain: nextDomain,
            profile: nextProfile,
            threshold: nextThreshold,
        });
    };

    const updateProfile = (field: keyof AuditProfile, value: string | number) => {
        setProfile((current) => {
            const next: AuditProfile = {
                ...current,
                [field]: value,
            };
            persistDraft(domain, next, threshold);
            return next;
        });
    };

    const onDomainChange = (value: DomainType) => {
        setDomain(value);
        persistDraft(value, profile, threshold);
    };

    const onThresholdChange = (value: number) => {
        const nextThreshold = clampThreshold(value);
        setThreshold(nextThreshold);
        persistDraft(domain, profile, nextThreshold);
    };

    const activeDomain = DOMAIN_OPTIONS.find((option) => option.value === domain);
    const canRunAudit = activeDomain?.status !== "coming-soon";

    const latestSession = useMemo<AuditSession | null>(() => {
        if (!result || !lastSubmission || !lastRequest) {
            return null;
        }

        return {
            domain: lastSubmission.domain,
            request: lastRequest,
            submittedAt: lastSubmission.submittedAt,
            response: result,
        };
    }, [lastRequest, lastSubmission, result]);

    const clearCurrentResult = () => {
        clearResult();
        setLastSubmission(null);
        clearAuditSession();
    };

    const resetDraft = () => {
        const nextProfile = { ...DEFAULT_PROFILE };
        setDomain(DEFAULT_DOMAIN);
        setProfile(nextProfile);
        setThreshold(DEFAULT_THRESHOLD);
        clearAuditDraft();
        clearCurrentResult();
    };

    const runAudit = async (thresholdOverride?: number) => {
        const nextThreshold = thresholdOverride ?? threshold;
        const payload: AuditRequest = {
            profile: {
                ...profile,
                score: Number(profile.score),
                experience: Number(profile.experience),
            },
            threshold: nextThreshold,
        };

        const response = await submitAudit(payload);
        if (!response) {
            return;
        }

        const submittedAt = new Date().toISOString();
        setLastSubmission({
            domain,
            request: payload,
            submittedAt,
        });

        saveAuditSession({
            domain,
            submittedAt,
            request: payload,
            response,
        });
    };

    const rerunAtHigherThreshold = async () => {
        const baselineThreshold = latestSession?.request.threshold ?? threshold;
        const nextThreshold = clampThreshold(baselineThreshold + 0.02);

        setThreshold(nextThreshold);
        persistDraft(domain, profile, nextThreshold);

        await runAudit(nextThreshold);
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                eyebrow="Audit Workspace"
                title="Run a clean input-to-audit flow"
                description="Enter profile details, set threshold, and run a structured audit in one step."
                actions={
                    <button
                        type="button"
                        onClick={resetDraft}
                        className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100 transition hover:border-ink-300 hover:text-ink-50"
                    >
                        Reset Draft
                    </button>
                }
            />

            <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
                <Card title="Input Form" subtitle="Domain + profile + threshold">
                    <AuditForm
                        domain={domain}
                        domainOptions={DOMAIN_OPTIONS}
                        domainDescription={activeDomainDescription}
                        profile={profile}
                        threshold={threshold}
                        isLoading={loading}
                        canSubmit={canRunAudit}
                        onDomainChange={onDomainChange}
                        onProfileChange={updateProfile}
                        onThresholdChange={onThresholdChange}
                        onSubmit={runAudit}
                    />
                </Card>

                <div className="space-y-4">
                    <AuditPresetCard />

                    <Card title="MVP Note" subtitle="Pitch-ready context for judges">
                        <p className="text-sm text-ink-100">
                            This MVP demonstrates hiring-domain auditing. Platform architecture supports
                            multi-domain expansion.
                        </p>
                    </Card>

                    {loading ? (
                        <LoadingState
                            compact
                            label="Running audit..."
                            description="Checking thresholds, variation shifts, and appeal signals."
                        />
                    ) : null}
                    {error ? (
                        <ErrorState
                            title="Audit could not be completed"
                            message={`What failed: ${error}`}
                            nextStep="Please check the profile input and try again."
                            onRetry={runAudit}
                        />
                    ) : null}
                </div>
            </div>

            {latestSession ? (
                <div className="space-y-6">
                    <SectionHeader
                        eyebrow="Audit Results"
                        title="Live result from your latest submission"
                        description="Form submit triggers backend audit, stores the result in hook state, and renders all result cards below."
                    />

                    <RawAuditPayloadCard session={latestSession} />

                    <ResultHeroCard
                        session={latestSession}
                        onRerun={rerunAtHigherThreshold}
                        onClear={clearCurrentResult}
                    />
                    <DecisionSummaryCard session={latestSession} />

                    <ThresholdSensitivityCard
                        rows={latestSession.response.threshold_analysis}
                        baselineThreshold={latestSession.request.threshold}
                        originalScore={latestSession.response.original.score}
                        confidenceZone={latestSession.response.original.confidence_zone ?? "Unknown"}
                    />
                    <VariationsComparisonCard variations={latestSession.response.variations} />
                    <RiskInsightCard
                        insights={latestSession.response.insights}
                        reasonTags={latestSession.response.insights.reason_tags}
                    />
                    <ExplanationCard explanation={latestSession.response.explanation} />
                    <AppealCard appeal={latestSession.response.appeal} />
                    {latestSession.response.ai_jury_view ? (
                        <JuryPanel jury={latestSession.response.ai_jury_view} />
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
