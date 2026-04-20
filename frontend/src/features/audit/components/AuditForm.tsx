import Link from "next/link";

import DomainSelector from "./DomainSelector";
import ProfileFields from "./ProfileFields";
import SubmitAuditButton from "./SubmitAuditButton";
import ThresholdControl from "./ThresholdControl";
import { AuditProfile, DomainOption, DomainType } from "@/types/audit";

interface AuditFormProps {
    domain: DomainType;
    domainOptions: DomainOption[];
    domainDescription: string;
    profile: AuditProfile;
    threshold: number;
    isLoading: boolean;
    onDomainChange: (value: DomainType) => void;
    onProfileChange: (field: keyof AuditProfile, value: string | number) => void;
    onThresholdChange: (value: number) => void;
    onSubmit: () => void;
}

export default function AuditForm({
    domain,
    domainOptions,
    domainDescription,
    profile,
    threshold,
    isLoading,
    onDomainChange,
    onProfileChange,
    onThresholdChange,
    onSubmit,
}: AuditFormProps) {
    return (
        <div className="space-y-4">
            <DomainSelector
                value={domain}
                options={domainOptions}
                description={domainDescription}
                onChange={onDomainChange}
            />
            <ProfileFields profile={profile} onChange={onProfileChange} />
            <ThresholdControl threshold={threshold} onChange={onThresholdChange} />

            <div className="flex flex-wrap items-center gap-3">
                <SubmitAuditButton isLoading={isLoading} onSubmit={onSubmit} />
                <Link
                    href="/"
                    className="rounded-lg border border-ink-500 bg-ink-700/60 px-4 py-2 text-sm font-semibold text-ink-100 transition hover:border-ink-300"
                >
                    Back to Landing
                </Link>
            </div>
        </div>
    );
}
