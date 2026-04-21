import Link from "next/link";

import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";

export default function HeroSection() {
    return (
        <section className="space-y-4 rounded-2xl border border-signal-info/30 bg-[linear-gradient(135deg,rgba(21,27,39,0.95),rgba(16,21,31,0.92))] p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
                <Badge label="AI Trust Checker" tone="info" />
                <Badge label="Stability Testing" tone="caution" />
                <Badge label="Fairness Audit" tone="risk" />
            </div>

            <SectionHeader
                eyebrow="DecisioLens"
                title="Can you trust this AI decision?"
                description="DecisioLens helps you test if AI decisions are stable, fair, and explainable — before you act on them."
                actions={
                    <Link
                        href="/audit"
                        className="inline-flex items-center rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-4 py-2 text-sm font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
                    >
                        Test a Decision →
                    </Link>
                }
            />
        </section>
    );
}