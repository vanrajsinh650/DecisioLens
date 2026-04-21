import { toneClasses } from "@/lib/format";

type Tone = "stable" | "caution" | "risk" | "info";

interface StatPillProps {
  label: string;
  value: string;
  tone?: Tone;
  className?: string;
}

export default function StatPill({ label, value, tone = "info", className = "" }: StatPillProps) {
  const palette = toneClasses[tone];

  return (
    <div className={`rounded-xl border border-ink-600/70 bg-ink-700/60 px-3 py-2 ${className}`}>
      <p className="text-[11px] uppercase tracking-wide text-ink-200">{label}</p>
      <p className={`mt-1 text-base font-semibold ${palette.text}`}>{value}</p>
    </div>
  );
}
