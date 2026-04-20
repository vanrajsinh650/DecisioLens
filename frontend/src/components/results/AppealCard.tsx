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
            title="Action + Appeal"
            subtitle="Demo finish: concrete next step for the user"
            rightSlot={<CopyButton value={appeal} label="Copy Appeal" />}
        >
            <pre className="whitespace-pre-wrap rounded-xl border border-ink-600/70 bg-ink-900/60 p-4 text-sm leading-relaxed text-ink-100">
                {appeal}
            </pre>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onRetest}
                    className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/25"
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
