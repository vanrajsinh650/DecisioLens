import Card from "@/components/shared/Card";
import { AIJuryView } from "@/types/audit";

interface JuryPanelProps {
    jury: AIJuryView;
}

export default function JuryPanel({ jury }: JuryPanelProps) {
    return (
        <Card title="AI Jury View" subtitle="Structured perspective split for credibility">
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-ink-600/70 bg-ink-700/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Auditor</p>
                    <p className="mt-2 text-sm text-ink-50">{jury.auditor}</p>
                </div>
                <div className="rounded-xl border border-ink-600/70 bg-ink-700/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Challenger</p>
                    <p className="mt-2 text-sm text-ink-50">{jury.challenger}</p>
                </div>
                <div className="rounded-xl border border-ink-600/70 bg-ink-700/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-200">Judge</p>
                    <p className="mt-2 text-sm text-ink-50">{jury.judge}</p>
                </div>
            </div>
        </Card>
    );
}
