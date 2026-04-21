import Link from "next/link";

import Card from "@/components/shared/Card";
import CopyButton from "@/components/shared/CopyButton";

interface AppealCardProps {
    appeal: string;
    onRetest: () => void;
}

export default function AppealCard({ appeal, onRetest }: AppealCardProps) {
    return (
        <Card
            title="Explainable Appeal"
            subtitle="Appeal-ready response with clear action"
            rightSlot={<CopyButton value={appeal} label="Copy Appeal" />}
        >
            <pre className="whitespace-pre-wrap rounded-xl border border-ink-600/70 bg-ink-900/60 p-4 text-sm leading-relaxed text-ink-100">
                {appeal}
            </pre>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onRetest}
                    className="rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-3 py-2 text-xs font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
                >
                    Re-test with +0.02 threshold
                </button>
                <Link
                    href="/audit"
                    className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100 transition hover:border-ink-300"
                >
                    Adjust input profile
                </Link>
            </div>
        </Card>
    );
}
