import Card from "@/components/shared/Card";
import CopyButton from "@/components/shared/CopyButton";

interface AppealCardProps {
    appeal: string;
}

export default function AppealCard({ appeal }: AppealCardProps) {
    return (
        <Card
            title="Pass 2 — Appeal"
            subtitle="Action layer with ready-to-copy review request text"
            rightSlot={<CopyButton value={appeal} label="Copy Appeal" copiedLabel="Appeal Copied" />}
        >
            <div className="rounded-xl border border-ink-600/70 bg-ink-900/60 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-200">Appeal Draft</p>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-ink-100">
                    {appeal}
                </pre>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    className="rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-3 py-2 text-xs font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
                >
                    Use in Review Request
                </button>
            </div>
        </Card>
    );
}
