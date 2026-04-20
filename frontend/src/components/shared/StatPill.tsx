import Badge from "@/components/shared/Badge";

type Tone = "stable" | "caution" | "risk" | "info";

interface StatPillProps {
  label: string;
  value: string;
  tone?: Tone;
}

export default function StatPill({ label, value, tone = "info" }: StatPillProps) {
  return (
    <div className="rounded-xl border border-ink-600/70 bg-ink-700/60 px-3 py-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-ink-200">{label}</p>
        <Badge label={tone.toUpperCase()} tone={tone} className="px-2 py-0.5 text-[10px]" />
      </div>
      <p className="text-base font-semibold text-ink-50">{value}</p>
    </div>
  );
}
