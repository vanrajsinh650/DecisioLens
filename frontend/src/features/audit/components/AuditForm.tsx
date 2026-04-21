import Card from "@/components/shared/Card";
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
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <Card className="border-ink-600/60 bg-ink-900/30 p-4" title="Domain">
                <DomainSelector
                    value={domain}
                    options={domainOptions}
                    description={domainDescription}
                    onChange={onDomainChange}
                />
            </Card>

            <Card className="border-ink-600/60 bg-ink-900/30 p-4" title="Candidate Profile">
                <ProfileFields profile={profile} onChange={onProfileChange} />
            </Card>

            <Card className="border-ink-600/60 bg-ink-900/30 p-4" title="Decision Threshold">
                <ThresholdControl threshold={threshold} onChange={onThresholdChange} />
            </Card>

            <div className="flex flex-wrap items-center gap-3">
                <SubmitAuditButton isLoading={isLoading} isDisabled={!canSubmit} />
            </div>

            {!canSubmit ? (
                <p className="text-xs text-signal-caution">
                    Lending and Education are coming soon. Please select Hiring (active) to run this audit.
                </p>
            ) : null}
        </form>
    );
}
