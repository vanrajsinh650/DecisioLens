import { signalClasses, SignalTone } from "@/lib/format";

interface BadgeProps {
    label: string;
    tone?: SignalTone | "info" | "stable" | "caution";
    className?: string;
    dot?: boolean;
}

function resolveSignalTone(tone: string): SignalTone {
    if (tone === "stable") return "safe";
    if (tone === "caution") return "warn";
    if (tone === "info") return "neutral";
    return tone as SignalTone;
}

export default function Badge({ label, tone = "neutral", className = "", dot = false }: BadgeProps) {
    const resolved = resolveSignalTone(tone);
    const palette = signalClasses[resolved];

    return (
        <span
            className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider ${className}`}
            style={{
                fontSize: "var(--fs-micro)",
                padding: "5px 14px",
                borderRadius: "100px",
                border: "1px solid var(--rim)",
                background: palette.surfaceVar,
                color: palette.colorVar,
            }}
        >
            {dot ? <span aria-hidden className="inline-block rounded-full bg-current" style={{ width: "6px", height: "6px" }} /> : null}
            {label}
        </span>
    );
}
