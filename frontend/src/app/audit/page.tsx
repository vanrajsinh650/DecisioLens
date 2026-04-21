"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import SectionHeader from "@/components/layout/SectionHeader";
import Card from "@/components/shared/Card";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import AuditForm from "@/features/audit/components/AuditForm";
import { useAudit } from "@/hooks/useAudit";
import {
    DEFAULT_DOMAIN,
    DEFAULT_PROFILE,
    DEFAULT_THRESHOLD,
    DOMAIN_OPTIONS,
} from "@/lib/constants";
import { saveAuditSession } from "@/lib/session";
import { AuditProfile, AuditRequest, DomainType } from "@/types/audit";

const clampThreshold = (value: number): number => {
    return Math.max(0, Math.min(1, value));
};

export default function AuditPage() {
    const router = useRouter();
    const { submitAudit, loading, error } = useAudit();

    const [domain, setDomain] = useState<DomainType>(DEFAULT_DOMAIN);
    const [profile, setProfile] = useState<AuditProfile>({ ...DEFAULT_PROFILE });
    const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);

    const activeDomain = useMemo(() => {
        return DOMAIN_OPTIONS.find((option) => option.value === domain);
    }, [domain]);

    const canRunAudit = activeDomain?.status !== "coming-soon";
    const domainDescription = activeDomain?.description ?? "";

    const updateProfile = (field: keyof AuditProfile, value: string | number) => {
        setProfile((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const runAudit = async (thresholdOverride?: number) => {
        if (!canRunAudit) {
            return;
        }

        const nextThreshold = clampThreshold(thresholdOverride ?? threshold);
        const payload: AuditRequest = {
            profile: {
                ...profile,
                score: Number(profile.score),
                experience: Number(profile.experience),
            },
            threshold: nextThreshold,
        };

        const response = await submitAudit(payload);
        if (response) {
            const submittedAt = new Date().toISOString();
            saveAuditSession({
                domain,
                request: payload,
                submittedAt,
                response,
            });

            router.push("/results");
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                eyebrow="DecisioLens"
                title="Test AI Decision"
                description="Enter a candidate profile, set a decision threshold, and see if the outcome is stable, fair, and explainable."
            />

            <Card title="Decision Input" subtitle="Hiring domain is active. Lending and education are coming soon.">
                <AuditForm
                    domain={domain}
                    domainOptions={DOMAIN_OPTIONS}
                    domainDescription={domainDescription}
                    profile={profile}
                    threshold={threshold}
                    isLoading={loading}
                    canSubmit={canRunAudit}
                    onDomainChange={setDomain}
                    onProfileChange={updateProfile}
                    onThresholdChange={(value) => setThreshold(clampThreshold(value))}
                    onSubmit={runAudit}
                />
            </Card>

            {loading ? (
                <LoadingState
                    compact
                    label="Analyzing decision..."
                    description="Testing thresholds, running profile variations, and checking for bias signals."
                />
            ) : null}

            {error ? (
                <ErrorState
                    title="Analysis could not be completed"
                    message={error}
                    nextStep="Check the profile values and try again."
                    onRetry={runAudit}
                />
            ) : null}
        </div>
    );
}
