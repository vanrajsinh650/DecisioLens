import { FormEvent } from "react";
import DomainSelector from "./DomainSelector";
import ProfileFields from "./ProfileFields";
import SubmitAuditButton from "./SubmitAuditButton";
import ThresholdControl from "./ThresholdControl";
import CustomFieldBuilder from "./CustomFieldBuilder";
import { DomainFieldConfig } from "@/lib/domains";
import { AuditProfile, DomainType } from "@/types/audit";

interface AuditFormProps {
    domain: DomainType;
    domainOptions: { value: string; label: string; description: string }[];
    domainDescription: string;
    profile: AuditProfile;
    profileFields: DomainFieldConfig[];
    threshold: number;
    isLoading: boolean;
    canSubmit: boolean;
    onDomainChange: (domain: DomainType) => void;
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
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (canSubmit) {
            onSubmit();
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Domain selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                    className="font-body uppercase"
                    style={{
                        fontSize: "var(--fs-label)",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        color: "var(--t2)",
                    }}
                >
                    WHAT ARE WE TESTING?
                </label>
                <DomainSelector
                    options={domainOptions}
                    value={domain}
                    onChange={onDomainChange}
                    disabled={isLoading}
                />
                <p className="font-body" style={{ fontSize: "var(--fs-micro)", color: "var(--t3)" }}>
                    {domainDescription}
                </p>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)" }} />

            {/* Custom field builder for custom domain */}
            {domain === "custom" && (
                <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label
                            className="font-body uppercase"
                            style={{
                                fontSize: "var(--fs-label)",
                                fontWeight: 600,
                                letterSpacing: "0.12em",
                                color: "var(--t2)",
                            }}
                        >
                            SET UP YOUR OWN FIELDS
                        </label>
                        <CustomFieldBuilder onChange={onCustomFieldsChange} disabled={isLoading} />
                    </div>
                    <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)" }} />
                </>
            )}

            {/* Candidate Profile section overline */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p
                    className="font-body uppercase"
                    style={{
                        fontSize: "var(--fs-label)",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        color: "var(--t1)",
                    }}
                >
                    PERSON'S DETAILS
                </p>

                {/* Full-width rule under overline */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)" }} />

                <ProfileFields
                    fields={profileFields}
                    profile={profile}
                    onChange={onProfileChange}
                    disabled={isLoading}
                />
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)" }} />

            {/* Decision Threshold section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p
                    className="font-body uppercase"
                    style={{
                        fontSize: "var(--fs-label)",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        color: "var(--t1)",
                    }}
                >
                    HOW STRICT IS THE PASSING BAR?
                </p>
                <p className="font-body" style={{ fontSize: "var(--fs-micro)", color: "var(--t3)" }}>
                    People scoring below this number will not pass. Slide left to make it easier, right to make it stricter.
                </p>

                <ThresholdControl
                    value={threshold}
                    onChange={onThresholdChange}
                    disabled={isLoading}
                />
            </div>

            <SubmitAuditButton isLoading={isLoading} disabled={!canSubmit} />
        </form>
    );
}
