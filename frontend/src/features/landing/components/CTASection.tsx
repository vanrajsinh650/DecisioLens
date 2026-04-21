import Link from "next/link";

import Card from "@/components/shared/Card";

export default function CTASection() {
    return (
        <div className="space-y-4">
            <Card>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-200">
                    <span className="rounded-full border border-signal-info/40 bg-signal-infoSoft/70 px-2 py-1 text-signal-info">
                        Powered by Gemini
                    </span>
                    <span className="rounded-full border border-ink-500/70 bg-ink-700/60 px-2 py-1">
                        Structured decision analysis
                    </span>
                    <span className="rounded-full border border-ink-500/70 bg-ink-700/60 px-2 py-1">
                        Built for multi-domain auditing
                    </span>
                </div>
            </Card>

            <Card
                title="Ready to run your first audit?"
                subtitle="Input profile, adjust threshold, and get explainable output."
            >
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/audit"
                        className="inline-flex items-center rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-4 py-2 text-sm font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
                    >
                        Start Audit
                    </Link>
                </div>
            </Card>
        </div>
    );
}