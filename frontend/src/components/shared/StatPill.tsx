import { toneClasses } from "@/lib/format";

type Tone = "stable" | "caution" | "risk" | "info";

interface StatPillProps {
  label: string;
  value: string;
  tone?: Tone;
  className?: string;
  emphasize?: boolean;
}

export default function StatPill({
  label,
  value,
  tone = "info",
  className = "",
  emphasize = false,
}: StatPillProps) {
  const palette = toneClasses[tone];
  const emphasisClasses = emphasize ? "shadow-lift ring-1 ring-signal-info/25" : "";
  const valueSizeClasses = emphasize ? "text-lg" : "";

  return (
    <div className={`rounded-xl border border-ink-600/70 bg-ink-700/60 px-3 py-2 transition ${emphasisClasses} ${className}`}>
      <p className="text-[11px] uppercase tracking-wide text-ink-200">{label}</p>
      <p className={`mt-1 text-base font-semibold ${valueSizeClasses} ${palette.text}`}>{value}</p>
    </div>
  );
}
