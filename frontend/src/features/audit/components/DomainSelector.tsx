import { DomainType } from "@/types/audit";

interface DomainOption {
    value: string;
    label: string;
    description: string;
}

interface DomainSelectorProps {
    options: DomainOption[];
    value: DomainType;
    onChange: (value: DomainType) => void;
    disabled?: boolean;
}

export default function DomainSelector({
    options,
    value,
    onChange,
    disabled = false,
}: DomainSelectorProps) {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value as DomainType)}
                        disabled={disabled}
                        className="font-mono"
                        style={{
                            fontSize: "var(--fs-mono)",
                            padding: "8px 14px",
                            borderRadius: "4px",
                            border: isSelected
                                ? "1px solid var(--aurora-violet)"
                                : "1px solid var(--rim)",
                            background: isSelected ? "var(--s2)" : "var(--s1)",
                            color: isSelected ? "var(--t1)" : "var(--t2)",
                            cursor: disabled ? "not-allowed" : "pointer",
                            opacity: disabled ? 0.5 : 1,
                            transition: "all 0.15s ease",
                        }}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
