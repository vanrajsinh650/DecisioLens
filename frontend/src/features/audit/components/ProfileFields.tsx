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
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "16px",
            }}
        >
            {fields.map((field) => {
                const value = profile[field.key] ?? "";

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
                                className="dl-select"
                            >
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
                                value={value}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                disabled={disabled}
                                className="dl-input"
                            />
                        ) : (
                            <input
                                type="text"
                                placeholder={String(field.placeholder ?? "")}
                                value={String(value)}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                disabled={disabled}
                                className="dl-input"
                            />
                        )}
                    </label>
                );
            })}
        </div>
    );
}
