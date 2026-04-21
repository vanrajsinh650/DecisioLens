import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function EmptyState({ title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-500 bg-ink-800/50 p-8 text-center">
      <h3 className="font-display text-xl font-semibold text-ink-50">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-ink-200">{description}</p>

      {ctaLabel && ctaHref ? (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-4 py-2 text-sm font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
