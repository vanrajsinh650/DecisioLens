import Card from "@/components/shared/Card";

const FEATURES = [
    {
        title: "Threshold Sensitivity",
        description: "See exactly where ACCEPT/REJECT outcomes flip as decision thresholds move.",
    },
    {
        title: "Scenario Testing",
        description: "Run controlled profile changes (gender, location, education) to test stability.",
    },
    {
        title: "Explainable Outcomes",
        description: "Get structured explanations, risk tags, and formatted appeal text in one place.",
    },
];

export default function FeatureHighlights() {
    return (
        <section>
            <div className="grid gap-4 md:grid-cols-3">
                {FEATURES.map((feature) => (
                    <Card key={feature.title}>
                        <h2 className="font-display text-xl font-semibold text-ink-50">{feature.title}</h2>
                        <p className="mt-2 text-sm text-ink-200">{feature.description}</p>
                    </Card>
                ))}
            </div>
        </section>
    );
}