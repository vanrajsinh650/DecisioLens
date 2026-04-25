"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AuditForm from "./components/AuditForm";
import AuditPresetCard from "./components/AuditPresetCard";
import SectionHeader from "@/components/layout/SectionHeader";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Walkthrough from "@/components/shared/Walkthrough";
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
import { useAudit } from "@/hooks/useAudit";
import { useAuditHistory } from "@/hooks/useAuditHistory";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useScrollReveal } from "@/hooks/useScrollReveal";
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
import { formatSignedNumber } from "@/lib/format";
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
    if (riskScore > 60) {
        return "HIGH_RISK";
    }

    if (riskScore > 30) {
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

/** Risk Preview — reactive spectrum widget for sticky right panel */
function RiskPreview({ threshold, score }: { threshold: number; score: number }) {
    const thresholdPos = threshold * 100;
    const scorePos = Math.min(100, Math.max(0, score));
    const distance = scorePos - thresholdPos;

    // Color based on proximity
    const dotColor =
        Math.abs(distance) < 10
            ? "var(--aurora-teal)"
            : distance > 0
                ? "var(--aurora-green)"
                : "var(--aurora-crimson)";

    return (
        <div className="dl-card dl-reveal" style={{ padding: "20px" }}>
            <p
                className="font-body uppercase"
                style={{
                    fontSize: "var(--fs-label)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--t2)",
                    marginBottom: "16px",
                }}
            >
                RISK PREVIEW
            </p>

            <div style={{ position: "relative", height: "6px", width: "100%", borderRadius: "3px", overflow: "visible" }}>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "3px",
                        background: "linear-gradient(to right, var(--aurora-crimson) 0%, var(--aurora-teal) 45%, var(--aurora-teal) 55%, var(--aurora-green) 100%)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "-4px",
                        height: "14px",
                        width: "1px",
                        background: "var(--t3)",
                        left: `${thresholdPos}%`,
                        zIndex: 5,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: dotColor,
                        left: `${scorePos}%`,
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                        transition: "left 0.15s ease, background 0.15s ease",
                    }}
                />
            </div>

            <div
                className="font-mono"
                style={{
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "var(--fs-micro)",
                    color: "var(--t3)",
                }}
            >
                <span>0</span>
                <span style={{ color: dotColor }}>
                    {formatSignedNumber(distance, 0, " pts margin")}
                </span>
                <span>100</span>
            </div>
        </div>
    );
}

export default function AuditWorkspace() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const revealRef = useScrollReveal();
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

    // Derive score for the risk preview
    const currentScore = Number(profile.score ?? profile.credit_score ?? 50);

    // Analysis steps for the sticky right panel
    const ANALYSIS_STEPS = [
        "Scoring your profile using the domain-specific formula",
        "Testing the threshold at 9 different strictness levels",
        "Swapping gender, city, category, and other variables",
        "Building the verdict: risk level, bias flags, reason tags",
    ];

    return (
        <div ref={revealRef} style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            <SectionHeader
                overline="AUDIT CHAMBER"
                title="Instrument Panel"
                subtitle="Enter profile details, configure the decision boundary, and execute analysis."
                actions={
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                            type="button"
                            id="btn-compare-mode"
                            data-no-print
                            onClick={() => router.push(isCompareMode ? "/audit" : "/audit?mode=compare")}
                            className="dl-btn-ghost"
                            style={{
                                color: "var(--aurora-teal)",
                                background: "var(--aurora-teal-surface)",
                                border: "1px solid hsl(172, 60%, 24%)",
                            }}
                        >
                            {isCompareMode ? "Exit Compare" : "Compare Mode"}
                        </button>
                        <button
                            type="button"
                            onClick={resetDraft}
                            className="dl-btn-ghost"
                        >
                            Reset
                        </button>
                    </div>
                }
            />

            {/* 58/42 two-column split layout */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "32px",
                }}
                className="xl:[grid-template-columns:58fr_42fr]"
            >
                {/* Left: Instrument Panel */}
                <div className="dl-card">
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
                </div>

                {/* Right: Sticky mission briefing panel */}
                <div
                    style={{ display: "flex", flexDirection: "column", gap: "24px" }}
                    className="xl:sticky xl:top-[88px] xl:self-start"
                >
                    {/* What We Analyze */}
                    <div className="dl-card dl-reveal" style={{ padding: "20px" }}>
                        <p
                            className="font-body uppercase"
                            style={{
                                fontSize: "var(--fs-label)",
                                fontWeight: 600,
                                letterSpacing: "0.12em",
                                color: "var(--t2)",
                                marginBottom: "16px",
                            }}
                        >
                            WHAT WE ANALYZE
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {ANALYSIS_STEPS.map((step, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                    {/* 6px aurora-violet dot */}
                                    <span
                                        aria-hidden
                                        style={{
                                            marginTop: "7px",
                                            flexShrink: 0,
                                            width: "6px",
                                            height: "6px",
                                            borderRadius: "50%",
                                            background: "var(--aurora-violet)",
                                        }}
                                    />
                                    <p
                                        className="font-body"
                                        style={{
                                            fontSize: "var(--fs-body)",
                                            lineHeight: 1.8,
                                            color: "var(--t2)",
                                        }}
                                    >
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reactive risk preview spectrum */}
                    <RiskPreview threshold={threshold} score={currentScore} />

                    {/* Pull-quote */}
                    <div
                        className="dl-reveal"
                        style={{
                            borderLeft: "2px solid var(--aurora-violet)",
                            paddingLeft: "20px",
                        }}
                    >
                        <p
                            className="font-body"
                            style={{
                                fontStyle: "italic",
                                fontSize: "var(--fs-body)",
                                lineHeight: 1.8,
                                color: "var(--t2)",
                            }}
                        >
                            &ldquo;Unlike tools that analyze datasets, DecisioLens tests individual decision behavior through profile-level simulation — so anyone can check if an AI was fair to them.&rdquo;
                        </p>
                    </div>

                    <div className="dl-reveal">
                        <AuditPresetCard />
                    </div>

                    {error ? (
                        <ErrorState
                            title="Analysis Failed"
                            message={error}
                            nextStep="Please check profile and try again."
                            onRetry={runAudit}
                        />
                    ) : null}
                </div>
            </div>

            {latestSession ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                    <SectionHeader
                        overline="ANALYSIS RESULTS"
                        title="Live Verdict"
                        subtitle="Form submission triggers backend audit. Results render below as a scrollable narrative."
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

                    {latestSession.response.stability_zone && (
                        <div className="print-section">
                            <StabilityZoneCard stabilityZone={latestSession.response.stability_zone} />
                        </div>
                    )}

                    {latestSession.response.impact_analysis && latestSession.response.impact_analysis.length > 0 && (
                        <div className="print-section">
                            <ImpactAnalysisCard impacts={latestSession.response.impact_analysis} />
                        </div>
                    )}

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

            {loading ? (
                <LoadingState
                    label="ANALYSIS TERMINAL"
                    description="Running the threshold test, creating demographic clones, and putting together your verdict."
                />
            ) : null}
        </div>
    );
}
