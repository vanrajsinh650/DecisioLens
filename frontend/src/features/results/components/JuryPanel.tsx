import Card from "@/components/shared/Card";
import { AIJuryView } from "@/types/audit";

interface JuryPanelProps {
    jury: AIJuryView;
}

export default function JuryPanel({ jury }: JuryPanelProps) {
    const cards = [
        { role: "Auditor", verdict: jury.auditor },
        { role: "Challenger", verdict: jury.challenger },
        { role: "Judge", verdict: jury.judge },
    ];

    return (
        <Card title="Section 8 — AI Jury Panel (Optional)" subtitle="Short verdicts from Auditor, Challenger, and Judge">
            <div className="grid gap-3 sm:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.role} className="rounded-xl border border-ink-600/70 bg-ink-700/50 p-3">
                        <p className="text-xs uppercase tracking-wide text-ink-200">{card.role}</p>
                        <p className="mt-2 line-clamp-3 text-sm text-ink-50">{card.verdict}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
}
