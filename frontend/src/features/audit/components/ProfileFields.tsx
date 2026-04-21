import { DomainFieldConfig } from "@/lib/domains";
import { AuditProfile } from "@/types/audit";

const CONTROL_CLASS_NAME =
    "mt-2 w-full rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50 outline-none transition focus:border-signal-info/60 focus:ring-2 focus:ring-signal-info/20";

interface ProfileFieldsProps {
    profile: AuditProfile;
    fields: DomainFieldConfig[];
    onChange: (field: string, value: string | number) => void;
}

export default function ProfileFields({ profile, fields, onChange }: ProfileFieldsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => {
                const value = profile[field.key];
                return (
                    <div key={field.key}>
                        <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">
                            {field.label}
                        </label>
                        {field.type === "select" ? (
                            <select
                                value={String(value ?? "")}
                                onChange={(event) => onChange(field.key, event.target.value)}
                                className={CONTROL_CLASS_NAME}
                            >
                                {(field.options ?? []).map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type === "number" ? "number" : "text"}
                                min={field.type === "number" ? field.min : undefined}
                                max={field.type === "number" ? field.max : undefined}
                                value={String(value ?? "")}
                                placeholder={field.placeholder}
                                onChange={(event) =>
                                    onChange(
                                        field.key,
                                        field.type === "number" ? Number(event.target.value) : event.target.value,
                                    )
                                }
                                className={CONTROL_CLASS_NAME}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
