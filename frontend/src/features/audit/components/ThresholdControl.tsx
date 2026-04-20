const QUICK_ACTIONS = [
    { id: "down", label: "-0.02", delta: -0.02 },
    { id: "up", label: "+0.02", delta: 0.02 },
];

interface ThresholdControlProps {
    threshold: number;
    onChange: (value: number) => void;
}

export default function ThresholdControl({ threshold, onChange }: ThresholdControlProps) {
    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-200">
                    Threshold ({threshold.toFixed(2)})
                </label>
                <div className="flex items-center gap-2">
                    {QUICK_ACTIONS.map((action) => (
                        <button
                            key={action.id}
                            type="button"
                            onClick={() => onChange(threshold + action.delta)}
                            className="rounded-lg border border-ink-500 bg-ink-700/60 px-2.5 py-1 text-xs font-semibold text-ink-100 transition hover:border-ink-300"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={threshold}
                onChange={(event) => onChange(Number(event.target.value))}
                className="mt-3 w-full accent-accent"
            />
        </div>
    );
}
