interface LoadingStateProps {
  label?: string;
  description?: string;
  compact?: boolean;
}

export default function LoadingState({
  label = "Analyzing decision behavior...",
  description = "Running threshold sensitivity and counterfactual variation checks.",
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      className={`rounded-2xl border border-ink-600/70 bg-ink-800/80 ${compact ? "p-4" : "p-6"} shadow-card`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-accent"
          aria-hidden
        />
        <p className="font-semibold text-ink-50">{label}</p>
      </div>
      {!compact && <p className="mt-3 text-sm text-ink-200">{description}</p>}
    </div>
  );
}
