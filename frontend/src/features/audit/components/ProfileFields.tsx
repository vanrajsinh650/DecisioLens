import { AuditProfile } from "@/types/audit";

const CONTROL_CLASS_NAME =
    "mt-2 w-full rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50 outline-none transition focus:border-signal-info/60 focus:ring-2 focus:ring-signal-info/20";

interface ProfileFieldsProps {
    profile: AuditProfile;
    onChange: (field: keyof AuditProfile, value: string | number) => void;
}

const TEXT_FIELDS: Array<{ field: "name" | "location"; label: string }> = [
    { field: "name", label: "Name" },
    { field: "location", label: "Location" },
];

const GENDER_OPTIONS = ["Female", "Male", "Non-binary", "Prefer not to say"];
const COLLEGE_TIER_OPTIONS = ["Tier 1", "Tier 2", "Tier 3"];

export default function ProfileFields({ profile, onChange }: ProfileFieldsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">Name</label>
                <input
                    value={profile.name}
                    onChange={(event) => onChange("name", event.target.value)}
                    className={CONTROL_CLASS_NAME}
                />
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">Skills Score</label>
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
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">Years of Experience</label>
                <input
                    type="number"
                    min={0}
                    max={50}
                    value={profile.experience}
                    onChange={(event) => onChange("experience", Math.round(Number(event.target.value)))}
                    className={CONTROL_CLASS_NAME}
                />
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">Gender</label>
                <select
                    value={profile.gender}
                    onChange={(event) => onChange("gender", event.target.value)}
                    className={CONTROL_CLASS_NAME}
                >
                    {GENDER_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">College Tier</label>
                <select
                    value={profile.college}
                    onChange={(event) => onChange("college", event.target.value)}
                    className={CONTROL_CLASS_NAME}
                >
                    {COLLEGE_TIER_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            {TEXT_FIELDS.map((item) => {
                if (item.field === "name") return null;

                return (
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
                );
            })}
        </div>
    );
}
