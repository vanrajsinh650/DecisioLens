import Link from "next/link";

import Card from "@/components/shared/Card";

export default function CTASection() {
    return (
        <Card
            title="Test if an AI decision is fair and stable before trusting it."
            subtitle="Enter a candidate profile, set a threshold, and get a full trust report in seconds."
        >
            <div className="flex flex-wrap items-center gap-3">
                <Link
                    href="/audit"
                    className="inline-flex items-center rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-4 py-2 text-sm font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
                >
                    Analyze a Decision →
                </Link>
            </div>
        </Card>
    );
}