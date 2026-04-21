"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AuditForm from "./components/AuditForm";
import AuditPresetCard from "./components/AuditPresetCard";
import SectionHeader from "@/components/layout/SectionHeader";
import Card from "@/components/shared/Card";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Walkthrough from "@/components/shared/Walkthrough";
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
import { useAuditHistory } from "@/hooks/useAuditHistory";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
    DEFAULT_DOMAIN,
    DEFAULT_PROFILE,
    DOMAIN_OPTIONS,
} from "@/lib/constants";
import { DomainFieldConfig } from "@/lib/domains";
import { getDomainConfig } from "@/lib/domains/registry";
import { AUDIT_WALKTHROUGH_STEPS } from "@/lib/walkthrough-steps";
import {
    clearAuditDraft,
    clearAuditSession,
    readAuditDraft,
    saveAuditDraft,
    saveAuditSession,
} from "@/lib/session";
import { TrustVerdict, AuditProfile, AuditRequest, AuditSession, DomainType } from "@/types/audit";

function createSessionId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function clampThreshold(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function deriveTrustVerdict(riskScore: number): TrustVerdict {
    if (riskScore >= 70) {
        return "HIGH_RISK";
    }

    if (riskScore >= 35) {
        return "UNSTABLE";
    }

    return "STABLE";
}

function normalizeProfileValue(field: DomainFieldConfig, value: unknown): string | number {
    if (field.type === "number") {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return field.min ?? 0;
        }

        const withMin = typeof field.min === "number" ? Math.max(field.min, numeric) : numeric;
        const withMax = typeof field.max === "number" ? Math.min(field.max, withMin) : withMin;
        return withMax;
    }

    const text = typeof value === "string" ? value : String(value ?? "");
    if (field.type === "select") {
        if ((field.options ?? []).includes(text)) {
            return text;
        }
        return field.options?.[0] ?? "";
    }

    return text;
}

function buildProfileFromFields(fields: DomainFieldConfig[], seed: AuditProfile): AuditProfile {
    return fields.reduce<AuditProfile>((profile, field) => {
        const seedValue = seed[field.key];
        profile[field.key] = normalizeProfileValue(field, seedValue ?? field.placeholder ?? "");
        return profile;
    }, {});
}

function alignProfileWithDomain(domain: DomainType, profile: AuditProfile): AuditProfile {
    const config = getDomainConfig(domain);
    return buildProfileFromFields(config.fields, {
        ...config.defaultProfile,
        ...profile,
    });
}

export default function AuditWorkspace() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isCompareMode = searchParams.get("mode") === "compare";
    const { submitAudit, loading, error, result, lastRequest, clearResult } = useAudit();
    const { save: saveHistory } = useAuditHistory();
    const { showWalkthrough, completeOnboarding } = useOnboarding();

    const [domain, setDomain] = useState<DomainType>(DEFAULT_DOMAIN);
    const [profile, setProfile] = useState<AuditProfile>({ ...DEFAULT_PROFILE });
    const [threshold, setThreshold] = useState<number>(getDomainConfig(DEFAULT_DOMAIN).defaultThreshold);
    const [customFields, setCustomFields] = useState<DomainFieldConfig[]>(getDomainConfig("custom").fields);
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
        setProfile(alignProfileWithDomain(draft.domain, draft.profile));
        setThreshold(draft.threshold);
    }, []);

    const activeDomainConfig = useMemo(() => {
        return getDomainConfig(domain);
    }, [domain, customFields]);

    const activeProfileFields = activeDomainConfig.fields;

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

    const updateProfile = (field: string, value: string | number) => {
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
        const nextConfig = getDomainConfig(value);
        const nextProfile = alignProfileWithDomain(value, profile);
        const nextThreshold = nextConfig.defaultThreshold;

        setDomain(value);
        setProfile(nextProfile);
        setThreshold(nextThreshold);
        persistDraft(value, nextProfile, nextThreshold);
    };

    const onCustomFieldsChange = (fields: DomainFieldConfig[]) => {
        setCustomFields(fields);

        if (domain !== "custom") {
            return;
        }

        const nextProfile = buildProfileFromFields(fields, profile);
        setProfile(nextProfile);
        persistDraft(domain, nextProfile, threshold);
    };

    const onThresholdChange = (value: number) => {
        const nextThreshold = clampThreshold(value);
        setThreshold(nextThreshold);
        persistDraft(domain, profile, nextThreshold);
    };

    const activeDomain = DOMAIN_OPTIONS.find((option) => option.value === domain);
    const canRunAudit = Boolean(activeDomain);

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
        const nextProfile = { ...getDomainConfig(DEFAULT_DOMAIN).defaultProfile };
        setDomain(DEFAULT_DOMAIN);
        setProfile(nextProfile);
        setThreshold(getDomainConfig(DEFAULT_DOMAIN).defaultThreshold);
        clearAuditDraft();
        clearCurrentResult();
    };

    const runAudit = async (thresholdOverride?: number) => {
        const nextThreshold = thresholdOverride ?? threshold;
        const payload: AuditRequest = {
            domain,
            profile,
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

        saveHistory({
            id: createSessionId(),
            domain,
            submittedAt,
            request: payload,
            response,
            trustVerdict: deriveTrustVerdict(response.insights.risk_score),
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
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            id="btn-compare-mode"
                            data-no-print
                            onClick={() => router.push(isCompareMode ? "/audit" : "/audit?mode=compare")}
                            className="rounded-lg border border-signal-caution/45 bg-signal-cautionSoft/30 px-3 py-2 text-xs font-semibold text-signal-caution transition hover:opacity-90"
                        >
                            ⚖️ {isCompareMode ? "Exit Compare Mode" : "Switch to Compare Mode"}
                        </button>
                        <button
                            type="button"
                            onClick={resetDraft}
                            className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100 transition hover:border-ink-300 hover:text-ink-50"
                        >
                            Reset Draft
                        </button>
                    </div>
                }
            />

            <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
                <Card title="Input Form" subtitle="Domain + profile + threshold">
                    <AuditForm
                        domain={domain}
                        domainOptions={DOMAIN_OPTIONS}
                        domainDescription={activeDomainDescription}
                        profile={profile}
                        profileFields={activeProfileFields}
                        threshold={threshold}
                        isLoading={loading}
                        canSubmit={canRunAudit}
                        onDomainChange={onDomainChange}
                        onProfileChange={updateProfile}
                        onCustomFieldsChange={onCustomFieldsChange}
                        onThresholdChange={onThresholdChange}
                        onSubmit={runAudit}
                    />
                </Card>

                <div className="space-y-4">
                    <AuditPresetCard />

                    <Card title="MVP Note" subtitle="Pitch-ready context for judges">
                        <p className="text-sm text-ink-100">
                            DecisioLens now supports hiring, lending, education, and custom domain schemas.
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

                    <div className="print-section">
                        <ResultHeroCard
                            session={latestSession}
                            onRerun={rerunAtHigherThreshold}
                            onClear={clearCurrentResult}
                        />
                    </div>
                    <div className="print-section">
                        <DecisionSummaryCard session={latestSession} />
                    </div>

                    <div className="print-section">
                        <ThresholdSensitivityCard
                            rows={latestSession.response.threshold_analysis}
                            baselineThreshold={latestSession.request.threshold}
                            originalScore={latestSession.response.original.score}
                            confidenceZone={latestSession.response.original.confidence_zone ?? "Unknown"}
                        />
                    </div>
                    <div className="print-section">
                        <VariationsComparisonCard variations={latestSession.response.variations} />
                    </div>
                    <div className="print-section">
                        <RiskInsightCard
                            insights={latestSession.response.insights}
                            reasonTags={latestSession.response.insights.reason_tags}
                        />
                    </div>
                    <div className="print-section">
                        <ExplanationCard explanation={latestSession.response.explanation} />
                    </div>
                    <div className="print-section">
                        <AppealCard appeal={latestSession.response.appeal} />
                    </div>
                    {latestSession.response.ai_jury_view ? (
                        <div className="print-section">
                            <JuryPanel jury={latestSession.response.ai_jury_view} />
                        </div>
                    ) : null}
                </div>
            ) : null}

            {showWalkthrough ? (
                <Walkthrough steps={AUDIT_WALKTHROUGH_STEPS} onComplete={completeOnboarding} />
            ) : null}
        </div>
    );
}
