"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AuditForm from "./components/AuditForm";
import AuditPresetCard from "./components/AuditPresetCard";
import SectionHeader from "@/components/layout/SectionHeader";
import Card from "@/components/shared/Card";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { useAudit } from "@/hooks/useAudit";
import {
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

    const activeDomain = DOMAIN_OPTIONS.find((option) => option.value === domain);
    const canRunAudit = activeDomain?.status !== "coming-soon";

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
                        isLoading={isLoading}
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

                    {isLoading ? <LoadingState compact /> : null}
                    {error ? <ErrorState message={error} onRetry={runAudit} /> : null}
                </div>
            </div>
        </div>
    );
}
