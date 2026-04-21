import Link from "next/link";

import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";

export default function HeroSection() {
    return (
        <section className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Badge label="DecisioLens" tone="info" />
                <Badge label="Threshold Sensitivity" tone="caution" />
                <Badge label="Scenario Variation Testing" tone="risk" />
            </div>

            <SectionHeader
                eyebrow="Audit automated decisions with threshold sensitivity, scenario testing, and explainable appeals."
                title="DecisioLens"
                description="See how AI really decides."
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