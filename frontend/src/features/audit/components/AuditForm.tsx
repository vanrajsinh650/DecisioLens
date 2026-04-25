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
                    SELECT DECISION TYPE
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
            <div style={{ height: "1px", background: "var(--rim)" }} />

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
                            DEFINE CUSTOM SCHEMA
                        </label>
                        <CustomFieldBuilder onChange={onCustomFieldsChange} disabled={isLoading} />
                    </div>
                    <div style={{ height: "1px", background: "var(--rim)" }} />
                </>
            )}

            {/* Candidate Profile — section overline */}
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
                    PROFILE DETAILS
                </p>

                {/* Full-width rule under overline */}
                <div style={{ height: "1px", background: "var(--rim)" }} />

                <ProfileFields
                    fields={profileFields}
                    profile={profile}
                    onChange={onProfileChange}
                    disabled={isLoading}
                />
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--rim)" }} />

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
                    SET STRICTNESS LEVEL
                </p>
                <p className="font-body" style={{ fontSize: "var(--fs-micro)", color: "var(--t3)" }}>
                    People who score below this number will not pass. Drag to make it stricter or easier.
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
