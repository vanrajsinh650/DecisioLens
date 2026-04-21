import { toneClasses } from "@/lib/format";

type Tone = "stable" | "caution" | "risk" | "info";

interface BadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}

export default function Badge({ label, tone = "info", className = "", dot = false }: BadgeProps) {
  const palette = toneClasses[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide shadow-card transition ${palette.soft} ${palette.border} ${palette.text} ${className}`}
    >
      {dot ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {label}
    </span>
  );
}
