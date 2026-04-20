import Badge from "@/components/shared/Badge";
import { AuditPreset } from "@/types/audit";

interface AuditPresetCardProps {
    preset: AuditPreset;
    onApply: (presetId: string) => void;
}

export default function AuditPresetCard({ preset, onApply }: AuditPresetCardProps) {
    return (
        <button
            type="button"
            onClick={() => onApply(preset.id)}
            className="w-full rounded-xl border border-ink-600/70 bg-ink-700/50 p-3 text-left transition hover:border-ink-300"
        >
            <div className="flex items-center justify-between gap-2">
                <p className="font-display text-base font-semibold text-ink-50">{preset.title}</p>
                <Badge label={preset.domain.toUpperCase()} tone="info" />
            </div>
            <p className="mt-1 text-xs text-ink-200">{preset.description}</p>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-ink-300">
                Threshold {preset.threshold.toFixed(2)}
            </p>
        </button>
    );
}
