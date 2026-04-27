"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AuditForm from "./components/AuditForm";

import SectionHeader from "@/components/layout/SectionHeader";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Walkthrough from "@/components/shared/Walkthrough";
import AppealCard from "@/features/results/components/AppealCard";
import DecisionSummaryCard from "@/features/results/components/DecisionSummaryCard";
import ExplanationCard from "@/features/results/components/ExplanationCard";
import HumanReviewCard from "@/features/results/components/HumanReviewCard";
import ImpactAnalysisCard from "@/features/results/components/ImpactAnalysisCard";
import JuryPanel from "@/features/results/components/JuryPanel";
import RawAuditPayloadCard from "@/features/results/components/RawAuditPayloadCard";
import RecourseCard from "@/features/results/components/RecourseCard";
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

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const profileNumber = (profile: AuditProfile, key: string, fallback: number): number => {
    const value = profile[key];
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

function computePreviewScore(domain: DomainType, profile: AuditProfile): number {
    const gender = String(profile.gender ?? "").toLowerCase();
    const genderEffect = gender === "female" || gender === "f" ? -0.03 : 0;

    if (domain === "hiring") {
        const rawScore = profileNumber(profile, "score", 50);
        const rawExp = profileNumber(profile, "experience", 0);
        const education = String(profile.education ?? profile.college ?? "").toLowerCase();
        const interview = profileNumber(profile, "interview_score", 50);
        const location = String(profile.location ?? "").toLowerCase();
        const expComponent = 1 - Math.exp(-rawExp / 10);
        const educationComponent = education.includes("phd") || education.includes("doctorate") || education.includes("tier 1") || education.includes("iit") || education.includes("nit")
            ? 1
            : education.includes("master")
                ? 0.85
                : education.includes("bachelor") || education.includes("tier 2")
                    ? 0.7
                    : education.includes("tier 3")
                        ? 0.45
                        : education.includes("diploma")
                            ? 0.4
                            : 0.5;
        const locationEffect = ["nagpur", "jaipur", "lucknow", "patna", "bhopal", "rural", "village"].includes(location) ? -0.02 : 0;
        return clamp01((0.35 * expComponent) + (0.30 * (rawScore / 100)) + (0.20 * educationComponent) + (0.15 * (interview / 100)) + genderEffect + locationEffect);
    }

    if (domain === "lending") {
        const credit = profileNumber(profile, "credit_score", 600);
        const income = profileNumber(profile, "income", 5);
        const loan = profileNumber(profile, "loan_amount", 10);
        const employment = String(profile.employment_type ?? "").toLowerCase();
        const employmentYears = profileNumber(profile, "employment_years", 3);
        const location = String(profile.location ?? "").toLowerCase();
        const creditComponent = clamp01((credit - 300) / 600);
        const incomeComponent = clamp01(income / 30);
        const dtiComponent = clamp01((loan / Math.max(income, 0.5)) / 10);
        const stabilityComponent = clamp01(employmentYears / 15);
        const employmentComponent = employment.includes("salaried") || employment.includes("full") ? 1 : employment.includes("self") ? 0.65 : employment.includes("freelance") || employment.includes("contract") ? 0.45 : 0.55;
        const locationEffect = ["rural", "remote", "village", "small town"].includes(location) ? -0.02 : 0;
        return clamp01((0.35 * creditComponent) + (0.25 * incomeComponent) - (0.20 * dtiComponent) + (0.10 * stabilityComponent) + (0.10 * employmentComponent) + genderEffect + locationEffect);
    }

    if (domain === "education") {
        const entrance = profileNumber(profile, "score", 50);
        const grade12 = profileNumber(profile, "grade_12", 50);
        const extracurricular = profileNumber(profile, "extracurricular", 5);
        const college = String(profile.college ?? "").toLowerCase();
        const category = String(profile.category ?? "general").toLowerCase();
        const incomeBand = String(profile.income_band ?? "middle").toLowerCase();
        const location = String(profile.location ?? "").toLowerCase();
        const collegeComponent = college.includes("tier 1") || college.includes("iit") || college.includes("nit") ? 1 : college.includes("tier 2") ? 0.65 : college.includes("tier 3") ? 0.35 : 0.5;
        const incomeComponent = incomeBand.includes("low") ? 1 : incomeBand.includes("middle") ? 0.7 : incomeBand.includes("high") ? 0.4 : 0.6;
        const locationEffect = ["rural", "village", "remote", "small town"].includes(location) ? -0.02 : 0;
        const categoryEffect = ["sc", "st", "obc", "ews"].includes(category) ? -0.02 : 0;
        return clamp01((0.42 * (grade12 / 100)) + (0.33 * (entrance / 100)) + (0.10 * incomeComponent) + (0.08 * clamp01(extracurricular / 10)) + (0.07 * collegeComponent) + genderEffect + locationEffect + categoryEffect);
    }

    if (domain === "insurance") {
        const claim = profileNumber(profile, "claim_amount", 2);
        const age = profileNumber(profile, "age", 40);
        const preExisting = String(profile.pre_existing ?? "None").toLowerCase();
        const coverage = profileNumber(profile, "coverage_amount", 10);
        const tenure = profileNumber(profile, "policy_tenure", 0);
        const cityTier = String(profile.city_tier ?? "Tier 1").toLowerCase();
        const healthComponent = preExisting.includes("both") ? 0.3 : preExisting === "diabetes" || preExisting === "hypertension" ? 0.5 : 1;
        const ageComponent = age < 25 ? 0.6 : age < 35 ? 0.85 : age <= 50 ? 1 : age <= 60 ? 0.7 : 0.4;
        const locationEffect = cityTier.includes("tier 3") || cityTier.includes("rural") ? -0.02 : 0;
        return clamp01((0.32 * healthComponent) + (0.28 * ageComponent) - (0.20 * clamp01(claim / 50)) - (0.10 * clamp01(coverage / 100)) + (0.10 * clamp01(tenure / 10)) + genderEffect + locationEffect);
    }

    if (domain === "welfare") {
        const income = profileNumber(profile, "annual_income", 3);
        const familySize = profileNumber(profile, "family_size", 4);
        const land = profileNumber(profile, "land_holding", 0);
        const stateTier = String(profile.state_tier ?? "Developed State").toLowerCase();
        const category = String(profile.category ?? "general").toLowerCase();
        const aadhaar = String(profile.aadhaar_linked ?? "").toLowerCase();
        const employmentStatus = String(profile.employment_status ?? "employed").toLowerCase();
        const housing = String(profile.housing_status ?? "owned").toLowerCase();
        const incomeComponent = clamp01(1 - (income / 15));
        const categoryComponent = category === "sc" || category === "st" ? 1 : category === "obc" || category === "ews" ? 0.85 : 0.45;
        const employmentComponent = employmentStatus.includes("unemploy") ? 1 : employmentStatus.includes("part") || employmentStatus.includes("casual") || employmentStatus.includes("daily") ? 0.75 : employmentStatus.includes("self") ? 0.40 : 0.20;
        const housingComponent = housing.includes("homeless") || housing.includes("shelter") ? 1 : housing.includes("rent") ? 0.80 : housing.includes("shared") ? 0.40 : 0.15;
        const locationEffect = stateTier.includes("remote") || stateTier.includes("developing") ? -0.02 : 0;
        return clamp01((0.30 * incomeComponent) + (0.15 * clamp01(familySize / 10)) + (0.10 * employmentComponent) + (0.10 * housingComponent) + (0.15 * (1 - clamp01(land / 10))) + (0.10 * (aadhaar === "yes" ? 1 : 0)) + (0.10 * categoryComponent) + genderEffect + locationEffect);
    }

    return clamp01(profileNumber(profile, "score", 50) / 100);
}

function normalizeProfileValue(field: DomainFieldConfig, value: unknown): string | number {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    if (field.type === "number") {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return "";
        }

        const withMin = typeof field.min === "number" ? Math.max(field.min, numeric) : numeric;
        const withMax = typeof field.max === "number" ? Math.min(field.max, withMin) : withMin;
        return withMax;
    }

    const text = typeof value === "string" ? value : String(value ?? "");
    if (field.type === "select") {
        if (text.trim().length === 0) {
            return "";
        }

        if ((field.options ?? []).includes(text)) {
            return text;
        }
        return "";
    }

    return text;
}

function buildProfileFromFields(fields: DomainFieldConfig[], seed: AuditProfile): AuditProfile {
    return fields.reduce<AuditProfile>((profile, field) => {
        const seedValue = seed[field.key];
        profile[field.key] = normalizeProfileValue(field, seedValue);
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

/** Risk Preview reactive spectrum widget for sticky right panel */
function RiskPreview({ threshold, score }: { threshold: number; score: number }) {
    const thresholdPos = threshold * 100;
    const scorePos = Math.min(100, Math.max(0, score * 100));
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
                SCORE PREVIEW
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
                    {formatSignedNumber(distance, 1, " pts margin")}
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
    const [draftRestored, setDraftRestored] = useState(false);
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
        setDraftRestored(true);
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
        setDraftRestored(false);
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
    const currentScore = computePreviewScore(domain, profile);



    return (
        <div ref={revealRef} style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            <SectionHeader
                overline="TEST A DECISION"
                title="Set Up Your Test"
                subtitle="Fill in a profile, choose a category, and hit the button. We'll show you if the result is fair."
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
                            {isCompareMode ? "Exit Compare" : "Compare Side-by-Side"}
                        </button>
                        <button
                            type="button"
                            onClick={resetDraft}
                            className="dl-btn-ghost"
                        >
                            Start Fresh
                        </button>
                    </div>
                }
            />

            {/* Single-column instrument panel */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>

                {draftRestored && (
                    <div
                        className="font-body"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            padding: "12px 16px",
                            background: "var(--aurora-teal-surface)",
                            border: "1px solid hsl(172, 60%, 24%)",
                            borderRadius: "8px",
                            fontSize: "var(--fs-micro)",
                            color: "var(--aurora-teal)",
                        }}
                    >
                        <span>📋 Your previous test data has been restored. You can continue where you left off, or start fresh.</span>
                        <button
                            type="button"
                            onClick={resetDraft}
                            className="dl-btn-ghost"
                            style={{ padding: "4px 10px", fontSize: "var(--fs-micro)", flexShrink: 0 }}
                        >
                            Start Fresh
                        </button>
                    </div>
                )}

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

                {/* Score Preview - compact inline */}
                <RiskPreview threshold={threshold} score={currentScore} />

                {error ? (
                    <ErrorState
                        title="Something went wrong"
                        message={error}
                        nextStep="Please check the profile details and try again."
                        onRetry={runAudit}
                    />
                ) : null}
            </div>

            {latestSession ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                    <SectionHeader
                        overline="TEST RESULTS"
                        title="Here's What We Found"
                        subtitle="Your results are below. Scroll down to see each section."
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
                            originalDecision={latestSession.response.original.decision}
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
                    {latestSession.response.human_review && (
                        <div className="print-section">
                            <HumanReviewCard humanReview={latestSession.response.human_review} />
                        </div>
                    )}
                    {latestSession.response.recourse && latestSession.response.recourse.length > 0 && (
                        <div className="print-section">
                            <RecourseCard
                                recourse={latestSession.response.recourse}
                                originalDecision={latestSession.response.original.decision}
                            />
                        </div>
                    )}
                    <div className="print-section">
                        <AppealCard
                            appeal={latestSession.response.appeal}
                            explanationRequest={latestSession.response.explanation_request}
                        />
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
                    label="RUNNING TEST"
                    description="Checking the decision, swapping small details, and putting together your result."
                />
            ) : null}
        </div>
    );
}
