"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AuditForm from "@/components/audit/AuditForm";
import AuditPresetCard from "@/components/audit/AuditPresetCard";
import SectionHeader from "@/components/layout/SectionHeader";
import Card from "@/components/shared/Card";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { useAudit } from "@/hooks/useAudit";
import {
    AUDIT_PRESETS,
    DEFAULT_DOMAIN,
    DEFAULT_PROFILE,
    DEFAULT_THRESHOLD,
    DOMAIN_OPTIONS,
} from "@/lib/constants";
import {
    clearAuditDraft,
    readAuditDraft,
    saveAuditDraft,
    saveAuditSession,
} from "@/lib/session";
import { AuditProfile, DomainType } from "@/types/audit";

function clampThreshold(value: number): number {
    return Math.max(0, Math.min(1, value));
}

export default function AuditWorkspace() {
    const router = useRouter();
    const { run, isLoading, error } = useAudit();

    const [domain, setDomain] = useState<DomainType>(DEFAULT_DOMAIN);
    const [profile, setProfile] = useState<AuditProfile>({ ...DEFAULT_PROFILE });
    const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);

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

    const applyPreset = (presetId: string) => {
        const preset = AUDIT_PRESETS.find((item) => item.id === presetId);
        if (!preset) return;

        const nextProfile = { ...preset.profile };
        setDomain(preset.domain);
        setProfile(nextProfile);
        setThreshold(preset.threshold);
        persistDraft(preset.domain, nextProfile, preset.threshold);
    };

    const resetDraft = () => {
        const nextProfile = { ...DEFAULT_PROFILE };
        setDomain(DEFAULT_DOMAIN);
        setProfile(nextProfile);
        setThreshold(DEFAULT_THRESHOLD);
        clearAuditDraft();
    };

    const runAudit = async () => {
        const payload = {
            profile: {
                ...profile,
                score: Number(profile.score),
                experience: Number(profile.experience),
            },
            threshold,
        };

        const response = await run(payload);
        if (!response) {
            return;
        }

        saveAuditSession({
            domain,
            submittedAt: new Date().toISOString(),
            request: payload,
            response,
        });

        router.push("/results");
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                eyebrow="Live Audit Workspace"
                title="Run a decision stress test"
                description="Collect the profile, set the threshold, and launch one audit run that demonstrates instability, bias, and appeal readiness."
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
                <Card title="Input Profile + Threshold" subtitle="Collect inputs, then start the audit flow">
                    <AuditForm
                        domain={domain}
                        domainOptions={DOMAIN_OPTIONS}
                        domainDescription={activeDomainDescription}
                        profile={profile}
                        threshold={threshold}
                        isLoading={isLoading}
                        onDomainChange={onDomainChange}
                        onProfileChange={updateProfile}
                        onThresholdChange={onThresholdChange}
                        onSubmit={runAudit}
                    />
                </Card>

                <div className="space-y-4">
                    <Card title="Quick Presets" subtitle="Fast paths for live demos">
                        <div className="space-y-3">
                            {AUDIT_PRESETS.map((preset) => (
                                <AuditPresetCard key={preset.id} preset={preset} onApply={applyPreset} />
                            ))}
                        </div>
                    </Card>

                    <Card title="What judges should notice" subtitle="Keep the narrative focused">
                        <ul className="space-y-2 text-sm text-ink-100">
                            <li>1. Baseline decision quality and risk score.</li>
                            <li>2. Threshold flip points for sensitivity evidence.</li>
                            <li>3. Counterfactual variation outcomes for bias checks.</li>
                            <li>4. Structured action and appeal output.</li>
                        </ul>
                    </Card>

                    {isLoading ? <LoadingState compact /> : null}
                    {error ? <ErrorState message={error} onRetry={runAudit} /> : null}
                </div>
            </div>
        </div>
    );
}
