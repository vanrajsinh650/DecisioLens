import CustomFieldBuilder from "./CustomFieldBuilder";
import Card from "@/components/shared/Card";
import { DomainFieldConfig } from "@/lib/domains";
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
    profileFields: DomainFieldConfig[];
    threshold: number;
    isLoading: boolean;
    canSubmit: boolean;
    onDomainChange: (value: DomainType) => void;
    onProfileChange: (field: string, value: string | number) => void;
    onCustomFieldsChange: (fields: DomainFieldConfig[]) => void;
    onThresholdChange: (value: number) => void;
    onSubmit: () => void;
}

export default function AuditForm({
    domain,
    domainOptions,
    domainDescription,
    profile,
    profileFields,
    threshold,
    isLoading,
    canSubmit,
    onDomainChange,
    onProfileChange,
    onCustomFieldsChange,
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
                <div id="domain-selector">
                    <DomainSelector
                        value={domain}
                        options={domainOptions}
                        description={domainDescription}
                        onChange={onDomainChange}
                    />
                </div>
            </Card>

            <Card className="border-ink-600/60 bg-ink-900/30 p-4" title="Candidate Profile">
                <div id="profile-fields">
                    <ProfileFields profile={profile} fields={profileFields} onChange={onProfileChange} />
                </div>
            </Card>

            {domain === "custom" ? <CustomFieldBuilder onChange={onCustomFieldsChange} /> : null}

            <Card className="border-ink-600/60 bg-ink-900/30 p-4" title="Decision Threshold">
                <div id="threshold-control">
                    <ThresholdControl threshold={threshold} onChange={onThresholdChange} />
                </div>
            </Card>

            <div className="flex flex-wrap items-center gap-3">
                <SubmitAuditButton isLoading={isLoading} isDisabled={!canSubmit} />
            </div>
        </form>
    );
}
