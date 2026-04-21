const DEFAULT_LOADING_STEPS = [
  "Analyzing decision…",
  "Testing variations…",
  "Generating appeal…",
];

interface LoadingStateProps {
  label?: string;
  description?: string;
  compact?: boolean;
  steps?: string[];
}

export default function LoadingState({
  label = "Running audit...",
  description = "Please wait while we evaluate the profile and prepare findings.",
  compact = false,
  steps = DEFAULT_LOADING_STEPS,
}: LoadingStateProps) {
  const visibleSteps = compact ? steps.slice(0, 2) : steps;

  return (
    <div
      className={`rounded-2xl border border-ink-600/70 bg-ink-800/80 ${compact ? "p-4" : "p-6"} shadow-card`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-signal-info"
          aria-hidden
        />
        <p className="font-semibold text-ink-50">{label}</p>
      </div>
      <p className={`mt-2 text-ink-200 ${compact ? "text-xs" : "text-sm"}`}>{description}</p>

      <div className={`mt-3 ${compact ? "flex flex-wrap gap-2" : "grid gap-2 sm:grid-cols-3"}`}>
        {visibleSteps.map((step) => (
          <span
            key={step}
            className="inline-flex rounded-full border border-signal-info/30 bg-signal-infoSoft/40 px-2.5 py-1 text-xs font-medium text-signal-info"
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
