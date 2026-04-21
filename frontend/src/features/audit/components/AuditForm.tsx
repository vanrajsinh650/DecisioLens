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
    canSubmit: boolean;
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
    canSubmit,
    onDomainChange,
    onProfileChange,
    onThresholdChange,
    onSubmit,
}: AuditFormProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">A. Domain Selector</p>
                <DomainSelector
                    value={domain}
                    options={domainOptions}
                    description={domainDescription}
                    onChange={onDomainChange}
                />
            </div>

            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">B. Profile Input</p>
                <ProfileFields profile={profile} onChange={onProfileChange} />
            </div>

            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">C. Threshold Input</p>
                <ThresholdControl threshold={threshold} onChange={onThresholdChange} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <SubmitAuditButton isLoading={isLoading} isDisabled={!canSubmit} onSubmit={onSubmit} />
            </div>

            {!canSubmit ? (
                <p className="text-xs text-signal-caution">
                    Finance and Education are coming soon. Please select Hiring (active) to run this MVP audit.
                </p>
            ) : null}
        </div>
    );
}
