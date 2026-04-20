interface DemoStepRailProps {
    activeStep: 1 | 2 | 3 | 4;
}

const STEPS: Array<{ id: 1 | 2 | 3 | 4; label: string; hint: string }> = [
    { id: 1, label: "Understand", hint: "What this product audits" },
    { id: 2, label: "Run Audit", hint: "Input profile and threshold" },
    { id: 3, label: "Inspect Signals", hint: "Instability + bias evidence" },
    { id: 4, label: "Take Action", hint: "Appeal text and next steps" },
];

export default function DemoStepRail({ activeStep }: DemoStepRailProps) {
    return (
        <ol className="grid gap-3 rounded-2xl border border-ink-700/80 bg-ink-800/70 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((step) => {
                const isActive = step.id === activeStep;
                const isComplete = step.id < activeStep;

                return (
                    <li
                        key={step.id}
                        className={`rounded-xl border p-3 transition ${isActive
                            ? "border-accent/50 bg-accent/10"
                            : isComplete
                                ? "border-signal-stable/40 bg-signal-stableSoft/20"
                                : "border-ink-600/70 bg-ink-700/40"
                            }`}
                    >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-200">
                            Step {step.id}
                        </p>
                        <p className="mt-1 font-display text-base font-semibold text-ink-50">{step.label}</p>
                        <p className="mt-1 text-xs text-ink-200">{step.hint}</p>
                    </li>
                );
            })}
        </ol>
    );
}
