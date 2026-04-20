import { AuditProfile } from "@/types/audit";

const CONTROL_CLASS_NAME =
    "mt-2 w-full rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20";

interface ProfileFieldsProps {
    profile: AuditProfile;
    onChange: (field: keyof AuditProfile, value: string | number) => void;
}

const TEXT_FIELDS: Array<{
    field: "name" | "gender" | "location" | "college";
    label: string;
}> = [
        { field: "name", label: "Candidate name" },
        { field: "gender", label: "Gender" },
        { field: "location", label: "Location" },
        { field: "college", label: "College" },
    ];

export default function ProfileFields({ profile, onChange }: ProfileFieldsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">Score (0-100)</label>
                <input
                    type="number"
                    min={0}
                    max={100}
                    value={profile.score}
                    onChange={(event) => onChange("score", Number(event.target.value))}
                    className={CONTROL_CLASS_NAME}
                />
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">
                    Experience (years)
                </label>
                <input
                    type="number"
                    min={0}
                    max={50}
                    value={profile.experience}
                    onChange={(event) => onChange("experience", Math.round(Number(event.target.value)))}
                    className={CONTROL_CLASS_NAME}
                />
            </div>

            {TEXT_FIELDS.map((item) => (
                <div key={item.field}>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">
                        {item.label}
                    </label>
                    <input
                        value={profile[item.field]}
                        onChange={(event) => onChange(item.field, event.target.value)}
                        className={CONTROL_CLASS_NAME}
                    />
                </div>
            ))}
        </div>
    );
}
