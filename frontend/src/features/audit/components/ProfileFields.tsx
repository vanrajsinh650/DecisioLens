import { DomainFieldConfig } from "@/lib/domains";
import { AuditProfile } from "@/types/audit";

interface ProfileFieldsProps {
    fields: DomainFieldConfig[];
    profile: AuditProfile;
    onChange: (key: string, value: string | number) => void;
    disabled?: boolean;
}

export default function ProfileFields({
    fields,
    profile,
    onChange,
    disabled = false,
}: ProfileFieldsProps) {
    if (fields.length === 0) {
        return (
            <p className="font-mono" style={{ fontSize: "var(--fs-mono)", color: "var(--t2)" }}>
                No fields configured.
            </p>
        );
    }

    return (
        <div
            id="profile-fields"
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "16px",
            }}
        >
            {fields.map((field) => {
                const value = profile[field.key] ?? "";
                const required = true;
                const isInvalid = required && String(value).trim().length === 0;
                const showInlineRequiredMessage = field.key === "name" && isInvalid;

                return (
                    <label
                        key={field.key}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        <span
                            className="font-body uppercase"
                            style={{
                                fontSize: "var(--fs-label)",
                                fontWeight: 600,
                                letterSpacing: "0.12em",
                                color: "var(--t2)",
                            }}
                        >
                            {field.label}
                        </span>

                        {field.type === "select" ? (
                            <select
                                value={String(value)}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                disabled={disabled}
                                required={required}
                                aria-invalid={isInvalid}
                                className="dl-select"
                            >
                                <option value="" disabled>
                                    Select {field.label}
                                </option>
                                {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        ) : field.type === "number" ? (
                            <input
                                type="number"
                                min={field.min}
                                max={field.max}
                                placeholder={String(field.placeholder ?? "")}
                                value={typeof value === "string" || typeof value === "number" ? value : ""}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                disabled={disabled}
                                required={required}
                                aria-invalid={isInvalid}
                                className="dl-input"
                            />
                        ) : (
                            <input
                                type="text"
                                placeholder={String(field.placeholder ?? "")}
                                value={String(value)}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                disabled={disabled}
                                required={required}
                                aria-invalid={isInvalid}
                                className="dl-input"
                            />
                        )}
                        {showInlineRequiredMessage ? (
                            <span className="font-body" style={{ fontSize: "var(--fs-micro)", color: "var(--aurora-crimson)" }}>
                                {field.label} is required.
                            </span>
                        ) : null}
                    </label>
                );
            })}
        </div>
    );
}
