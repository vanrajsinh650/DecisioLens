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
        <div className="dl-segmented">
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value as DomainType)}
                        disabled={disabled}
                        className={`dl-segment ${isSelected ? "is-active" : ""}`}
                        title={option.description}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
