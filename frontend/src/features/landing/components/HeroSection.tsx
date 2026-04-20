import Link from "next/link";

import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";

const CORE_VALUE_CARDS = [
    {
        title: "Audit AI decisions",
        description:
            "Turn one model output into a structured review with decision, score, confidence zone, and risk.",
        tone: "info" as const,
    },
    {
        title: "Reveal instability + bias",
        description:
            "Stress the same decision across threshold changes and counterfactual profile variations.",
        tone: "risk" as const,
    },
    {
        title: "Generate action + appeal",
        description:
            "Finish with evidence-backed next steps and a copyable appeal that feels serious and demo-ready.",
        tone: "stable" as const,
    },
];

export default function HeroSection() {
    return (
        <section className="space-y-5">
            <div className="flex flex-wrap gap-2">
                <Badge label="AI Decision Audit" tone="info" />
                <Badge label="Threshold Sensitivity" tone="caution" />
                <Badge label="Scenario Variation Testing" tone="risk" />
            </div>

            <SectionHeader
                eyebrow="Hackathon Demo Ready"
                title="See what an AI decision hides in under 10 seconds"
                description="DecisioLens audits one AI decision, exposes instability and bias signals, and gives you action plus appeal output for a strong live pitch."
                actions={
                    <Link
                        href="/audit"
                        className="inline-flex items-center rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/25"
                    >
                        Start Audit
                    </Link>
                }
            />

            <div className="grid gap-4 md:grid-cols-3">
                {CORE_VALUE_CARDS.map((item) => (
                    <Card key={item.title}>
                        <Badge label="Core Value" tone={item.tone} />
                        <h2 className="mt-3 font-display text-xl font-semibold text-ink-50">{item.title}</h2>
                        <p className="mt-2 text-sm text-ink-200">{item.description}</p>
                    </Card>
                ))}
            </div>
        </section>
    );
}