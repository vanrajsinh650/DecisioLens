import { DomainOption, DomainType } from "@/types/audit";
import Badge from "@/components/shared/Badge";

const CONTROL_CLASS_NAME =
    "mt-2 w-full rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm text-ink-50 outline-none transition focus:border-signal-info/60 focus:ring-2 focus:ring-signal-info/20";

interface DomainSelectorProps {
    value: DomainType;
    options: DomainOption[];
    description: string;
    onChange: (value: DomainType) => void;
}

export default function DomainSelector({
    value,
    options,
    description,
    onChange,
}: DomainSelectorProps) {
    const activeOption = options.find((option) => option.value === value);

    return (
        <div>
            <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">Domain</label>
                <Badge
                    label={activeOption?.status === "coming-soon" ? "Coming soon" : "Active"}
                    tone={activeOption?.status === "coming-soon" ? "caution" : "stable"}
                    dot
                />
            </div>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value as DomainType)}
                className={CONTROL_CLASS_NAME}
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.status === "coming-soon"}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            <p className="mt-2 text-xs text-ink-200">{description}</p>
            {activeOption?.status === "coming-soon" ? (
                <p className="mt-1 text-xs text-signal-caution">Coming soon. Use Hiring (active) for MVP demo.</p>
            ) : null}
        </div>
    );
}
