import Link from "next/link";

import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";

export default function HeroSection() {
    return (
        <section className="space-y-4 rounded-2xl border border-signal-info/30 bg-[linear-gradient(135deg,rgba(21,27,39,0.95),rgba(16,21,31,0.92))] p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
                <Badge label="DecisioLens" tone="info" />
                <Badge label="Threshold Sensitivity" tone="caution" />
                <Badge label="Scenario Testing" tone="risk" />
            </div>

            <SectionHeader
                eyebrow="AI decision auditing platform"
                title="DecisioLens"
                description="Audit automated decisions using threshold sensitivity and scenario testing to uncover instability, bias signals, and appeal-ready evidence."
                actions={
                    <Link
                        href="/audit"
                        className="inline-flex items-center rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-4 py-2 text-sm font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
                    >
                        Start Audit
                    </Link>
                }
            />
        </section>
    );
}