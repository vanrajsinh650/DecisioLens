import Card from "@/components/shared/Card";
import { AIJuryView } from "@/types/audit";

interface JuryPanelProps {
    jury: AIJuryView;
}

export default function JuryPanel({ jury }: JuryPanelProps) {
    const cards = [
        {
            role: "Auditor",
            verdict: jury.auditor,
            accentClass: "border-signal-info/35 bg-signal-infoSoft/20",
            roleClass: "text-signal-info",
        },
        {
            role: "Challenger",
            verdict: jury.challenger,
            accentClass: "border-signal-caution/35 bg-signal-cautionSoft/20",
            roleClass: "text-signal-caution",
        },
        {
            role: "Judge",
            verdict: jury.judge,
            accentClass: "border-signal-stable/35 bg-signal-stableSoft/20",
            roleClass: "text-signal-stable",
        },
    ];

    return (
        <Card title="Pass 3 — Jury Panel" subtitle="Short verdicts from Auditor, Challenger, and Judge">
            <div className="grid gap-3 sm:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.role} className={`rounded-xl border p-3 ${card.accentClass}`}>
                        <p className={`text-xs uppercase tracking-wide ${card.roleClass}`}>{card.role}</p>
                        <p className="mt-2 line-clamp-3 text-sm text-ink-50">{card.verdict}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
}
