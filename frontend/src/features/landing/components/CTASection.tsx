import Link from "next/link";

import Card from "@/components/shared/Card";

export default function CTASection() {
    return (
        <Card
            title="Ready to audit an automated decision?"
            subtitle="Start with the hiring domain and review threshold behavior, profile variations, and risk signals."
        >
            <div className="flex flex-wrap items-center gap-3">
                <Link
                    href="/audit"
                    className="inline-flex items-center rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-4 py-2 text-sm font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
                >
                    Go to Audit Workspace
                </Link>
            </div>
        </Card>
    );
}