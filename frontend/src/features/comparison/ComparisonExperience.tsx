"use client";

import { useMemo, useState } from "react";

import AuditForm from "@/features/audit/components/AuditForm";
import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import ResultHeroCard from "@/features/results/components/ResultHeroCard";
import ThresholdSensitivityCard from "@/features/results/components/ThresholdSensitivityCard";
import VariationsComparisonCard from "@/features/results/components/VariationsComparisonCard";
import { useComparison } from "@/hooks/useComparison";
import { DEFAULT_DOMAIN, DEFAULT_PROFILE, DOMAIN_OPTIONS } from "@/lib/constants";
import { DomainFieldConfig } from "@/lib/domains";
import { getDomainConfig } from "@/lib/domains/registry";
import { AuditProfile, AuditRequest, AuditSession, DomainType, TrustVerdict } from "@/types/audit";

interface ComparisonFormState {
    domain: DomainType;
    profile: AuditProfile;
    threshold: number;
    customFields: DomainFieldConfig[];
}

const clampThreshold = (value: number): number => Math.max(0, Math.min(1, value));
const PROTECTED_FIELDS = new Set(["gender", "category", "location", "city_tier", "state_tier"]);

function deriveTrustVerdict(riskScore: number): TrustVerdict {
    if (riskScore >= 70) return "HIGH_RISK";
    if (riskScore >= 35) return "UNSTABLE";
    return "STABLE";
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

function createInitialFormState(): ComparisonFormState {
    const defaultConfig = getDomainConfig(DEFAULT_DOMAIN);
    return {
        domain: DEFAULT_DOMAIN,
        profile: { ...(DEFAULT_PROFILE ?? defaultConfig.defaultProfile) },
        threshold: defaultConfig.defaultThreshold,
        customFields: getDomainConfig("custom").fields,
    };
}

function valuesEqual(a: unknown, b: unknown): boolean {
    if (typeof a === "number" || typeof b === "number") {
        const na = Number(a);
        const nb = Number(b);
        return Number.isFinite(na) && Number.isFinite(nb) ? Math.abs(na - nb) < 0.000001 : String(a) === String(b);
    }
    return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

function onlyProtectedFieldsDiffer(profileA: AuditProfile, profileB: AuditProfile): boolean {
    const keys = new Set([...Object.keys(profileA), ...Object.keys(profileB)].filter((key) => key !== "name"));
    const differing = [...keys].filter((key) => !valuesEqual(profileA[key], profileB[key]));
    return differing.length > 0 && differing.every((key) => PROTECTED_FIELDS.has(key));
}

interface SlotResultProps {
    title: string;
    session: AuditSession | null;
    loading: boolean;
    error: string | null;
    onClear: () => void;
    onRerun: () => void;
}

function SlotResult({ title, session, loading, error, onClear, onRerun }: SlotResultProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <SectionHeader
                overline={title.toUpperCase()}
                title={`${title} Result`}
                subtitle="Independent run against the same AI system"
            />

            {loading ? (
                <LoadingState compact label={`Running ${title} audit...`} description="Evaluating this slot now." />
            ) : null}

            {error ? (
                <ErrorState title={`${title} failed`} message={error} onRetry={onRerun} />
            ) : null}

            {!loading && !error && !session ? (
                <EmptyState
                    title={`No ${title} result yet`}
                    description="Submit this slot to generate comparison insights."
                />
            ) : null}

            {session ? (
                <div className="space-y-4">
                    <ResultHeroCard session={session} onRerun={onRerun} onClear={onClear} />
                    <ThresholdSensitivityCard
                        rows={session.response.threshold_analysis}
                        baselineThreshold={session.request.threshold}
                        originalScore={session.response.original.score}
                        originalDecision={session.response.original.decision}
                        confidenceZone={session.response.original.confidence_zone ?? "Unknown"}
                    />
                    <VariationsComparisonCard variations={session.response.variations} />
                </div>
            ) : null}
        </div>
    );
}

export default function ComparisonExperience() {
    const { slotA, slotB, submitSlot, clearSlot, reset } = useComparison();

    const [formA, setFormA] = useState<ComparisonFormState>(createInitialFormState);
    const [formB, setFormB] = useState<ComparisonFormState>(createInitialFormState);

    const buildRequest = (state: ComparisonFormState): AuditRequest => ({
        domain: state.domain,
        profile: state.profile,
        threshold: state.threshold,
    });

    const domainDescriptionA = useMemo(() => {
        return DOMAIN_OPTIONS.find((option) => option.value === formA.domain)?.description ?? "";
    }, [formA.domain]);

    const domainDescriptionB = useMemo(() => {
        return DOMAIN_OPTIONS.find((option) => option.value === formB.domain)?.description ?? "";
    }, [formB.domain]);

    const activeProfileFieldsA = useMemo(() => getDomainConfig(formA.domain).fields, [formA.domain, formA.customFields]);
    const activeProfileFieldsB = useMemo(() => getDomainConfig(formB.domain).fields, [formB.domain, formB.customFields]);

    const updateDomain = (slot: "A" | "B", domain: DomainType) => {
        // Sync both slots to the same domain - cross-domain comparison produces meaningless results
        const nextConfig = getDomainConfig(domain);
        const updater = (current: ComparisonFormState): ComparisonFormState => ({
            ...current,
            domain,
            profile: alignProfileWithDomain(domain, current.profile),
            threshold: nextConfig.defaultThreshold,
        });
        setFormA(updater);
        setFormB(updater);
    };

    const updateProfile = (slot: "A" | "B", field: string, value: string | number) => {
        const setter = slot === "A" ? setFormA : setFormB;
        setter((current) => ({
            ...current,
            profile: {
                ...current.profile,
                [field]: value,
            },
        }));
    };

    const updateThreshold = (slot: "A" | "B", threshold: number) => {
        const setter = slot === "A" ? setFormA : setFormB;
        setter((current) => ({
            ...current,
            threshold: clampThreshold(threshold),
        }));
    };

    const updateCustomFields = (slot: "A" | "B", fields: DomainFieldConfig[]) => {
        const setter = slot === "A" ? setFormA : setFormB;
        setter((current) => {
            if (current.domain !== "custom") {
                return current;
            }

            return {
                ...current,
                customFields: fields,
                profile: buildProfileFromFields(fields, current.profile),
            };
        });
    };

    const onSubmitSlot = async (slot: "A" | "B") => {
        const form = slot === "A" ? formA : formB;
        await submitSlot(slot, buildRequest(form));
    };

    const sessionA = useMemo<AuditSession | null>(() => {
        if (!slotA.request || !slotA.response) {
            return null;
        }

        return {
            domain: slotA.request.domain,
            request: slotA.request,
            response: slotA.response,
            submittedAt: new Date().toISOString(),
        };
    }, [slotA.request, slotA.response]);

    const sessionB = useMemo<AuditSession | null>(() => {
        if (!slotB.request || !slotB.response) {
            return null;
        }

        return {
            domain: slotB.request.domain,
            request: slotB.request,
            response: slotB.response,
            submittedAt: new Date().toISOString(),
        };
    }, [slotB.request, slotB.response]);

    const verdictA = sessionA ? deriveTrustVerdict(sessionA.response.insights.risk_score) : null;
    const verdictB = sessionB ? deriveTrustVerdict(sessionB.response.insights.risk_score) : null;
    const comparable = Boolean(
        sessionA
        && sessionB
        && sessionA.request.domain === sessionB.request.domain
        && Math.abs(sessionA.request.threshold - sessionB.request.threshold) < 0.000001
        && onlyProtectedFieldsDiffer(sessionA.request.profile, sessionB.request.profile),
    );
    const biasDetected = Boolean(comparable && verdictA && verdictB && verdictA !== verdictB);
    const hasVerdictDelta = Boolean(verdictA && verdictB && verdictA !== verdictB);

    const safeVerdictA = verdictA ?? "STABLE";
    const safeVerdictB = verdictB ?? "STABLE";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <SectionHeader
                overline="COMPARISON MODE"
                title="Side-by-Side Trust Audit"
                subtitle="Run two profiles against the same AI to detect demographic outcome gaps."
                actions={
                    <button
                        type="button"
                        onClick={() => {
                            reset();
                            setFormA(createInitialFormState());
                            setFormB(createInitialFormState());
                        }}
                        className="dl-btn-ghost"
                    >
                        Reset Comparison
                    </button>
                }
            />

            <Card>
                {verdictA && verdictB ? (
                    <div
                        style={{
                            borderRadius: "10px",
                            border: biasDetected ? "1px solid hsl(350, 68%, 30%)" : hasVerdictDelta ? "1px solid hsl(38, 82%, 30%)" : "1px solid hsl(140, 55%, 25%)",
                            background: biasDetected ? "var(--aurora-crimson-surface)" : hasVerdictDelta ? "var(--aurora-amber-surface)" : "var(--aurora-green-surface)",
                            padding: "12px",
                        }}
                    >
                        <p className="font-display" style={{ color: "var(--t1)", fontWeight: 700 }}>
                            {biasDetected
                                ? "Controlled protected-field change produced different trust verdicts → Bias Detected"
                                : hasVerdictDelta
                                    ? "Verdicts differ, but this is not a controlled protected-field comparison"
                                    : "Both profiles produced aligned trust verdicts"}
                        </p>
                        <p className="font-mono" style={{ marginTop: "4px", fontSize: "var(--fs-micro)", color: "var(--t2)" }}>
                            Slot A: {verdictA} · Slot B: {verdictB}
                            {!comparable ? " · Bias label requires same domain, same threshold, and only protected-field differences." : ""}
                        </p>
                    </div>
                ) : (
                    <p className="font-body" style={{ fontSize: "0.875rem", color: "var(--t2)" }}>
                        Submit both slots to unlock verdict delta insights.
                    </p>
                )}
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card title="Slot A Input" subtitle="Primary profile">
                    <AuditForm
                        domain={formA.domain}
                        domainOptions={DOMAIN_OPTIONS}
                        domainDescription={domainDescriptionA}
                        profile={formA.profile}
                        profileFields={activeProfileFieldsA}
                        threshold={formA.threshold}
                        isLoading={slotA.loading}
                        canSubmit
                        onDomainChange={(value) => updateDomain("A", value)}
                        onProfileChange={(field, value) => updateProfile("A", field, value)}
                        onCustomFieldsChange={(fields) => updateCustomFields("A", fields)}
                        onThresholdChange={(value) => updateThreshold("A", value)}
                        onSubmit={() => {
                            void onSubmitSlot("A");
                        }}
                    />
                </Card>

                <Card title="Slot B Input" subtitle="Alternative scenario profile">
                    <AuditForm
                        domain={formB.domain}
                        domainOptions={DOMAIN_OPTIONS}
                        domainDescription={domainDescriptionB}
                        profile={formB.profile}
                        profileFields={activeProfileFieldsB}
                        threshold={formB.threshold}
                        isLoading={slotB.loading}
                        canSubmit
                        onDomainChange={(value) => updateDomain("B", value)}
                        onProfileChange={(field, value) => updateProfile("B", field, value)}
                        onCustomFieldsChange={(fields) => updateCustomFields("B", fields)}
                        onThresholdChange={(value) => updateThreshold("B", value)}
                        onSubmit={() => {
                            void onSubmitSlot("B");
                        }}
                    />
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <SlotResult
                    title="Slot A"
                    session={sessionA}
                    loading={slotA.loading}
                    error={slotA.error}
                    onClear={() => clearSlot("A")}
                    onRerun={() => {
                        void onSubmitSlot("A");
                    }}
                />

                <SlotResult
                    title="Slot B"
                    session={sessionB}
                    loading={slotB.loading}
                    error={slotB.error}
                    onClear={() => clearSlot("B")}
                    onRerun={() => {
                        void onSubmitSlot("B");
                    }}
                />
            </div>

            {(sessionA && sessionB) ? (
                <Card title="Comparison Summary" subtitle="At-a-glance slot diagnostics">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div style={{ borderRadius: "10px", border: "1px solid var(--rim)", background: "var(--s2)", padding: "12px" }}>
                            <p className="font-mono uppercase" style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}>Slot A</p>
                            <p className="font-body" style={{ marginTop: "8px", fontSize: "0.875rem", color: "var(--t1)" }}>Decision: {sessionA.response.original.decision}</p>
                            <p className="font-mono" style={{ fontSize: "var(--fs-mono)", color: "var(--t1)" }}>Risk Score: {Math.round(sessionA.response.insights.risk_score)}/100</p>
                            <Badge
                                label={`Trust Verdict: ${safeVerdictA}`}
                                tone={safeVerdictA === "HIGH_RISK" ? "risk" : safeVerdictA === "UNSTABLE" ? "caution" : "stable"}
                                dot
                                className="mt-2"
                            />
                        </div>

                        <div style={{ borderRadius: "10px", border: "1px solid var(--rim)", background: "var(--s2)", padding: "12px" }}>
                            <p className="font-mono uppercase" style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}>Slot B</p>
                            <p className="font-body" style={{ marginTop: "8px", fontSize: "0.875rem", color: "var(--t1)" }}>Decision: {sessionB.response.original.decision}</p>
                            <p className="font-mono" style={{ fontSize: "var(--fs-mono)", color: "var(--t1)" }}>Risk Score: {Math.round(sessionB.response.insights.risk_score)}/100</p>
                            <Badge
                                label={`Trust Verdict: ${safeVerdictB}`}
                                tone={safeVerdictB === "HIGH_RISK" ? "risk" : safeVerdictB === "UNSTABLE" ? "caution" : "stable"}
                                dot
                                className="mt-2"
                            />
                        </div>
                    </div>
                </Card>
            ) : null}
        </div>
    );
}
