import Link from "next/link";

import Card from "@/components/shared/Card";

export default function CTASection() {
    return (
        <Card
            title="Move from product story to live proof"
            subtitle="Landing explains the value. The audit workspace makes the pitch real."
        >
            <div className="flex flex-wrap items-center gap-3">
                <Link
                    href="/audit"
                    className="inline-flex items-center rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/25"
                >
                    Run Live Audit
                </Link>
                <Link
                    href="/results"
                    className="inline-flex items-center rounded-lg border border-ink-500 bg-ink-700/60 px-4 py-2 text-sm font-semibold text-ink-100 transition hover:border-ink-300"
                >
                    Preview Results
                </Link>
            </div>
        </Card>
    );
}