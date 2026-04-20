import { toneClasses } from "@/lib/format";

type Tone = "stable" | "caution" | "risk" | "info";

interface BadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
}

export default function Badge({ label, tone = "info", className = "" }: BadgeProps) {
  const palette = toneClasses[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${palette.soft} ${palette.border} ${palette.text} ${className}`}
    >
      {label}
    </span>
  );
}
