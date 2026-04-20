interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-signal-risk/40 bg-signal-riskSoft/40 p-5">
      <h3 className="font-display text-base font-semibold text-signal-risk">{title}</h3>
      <p className="mt-2 text-sm text-ink-100">{message}</p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex rounded-lg border border-signal-risk/40 bg-signal-risk/10 px-3 py-1.5 text-sm font-semibold text-signal-risk transition hover:bg-signal-risk/20"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
