import Card from "@/components/shared/Card";

const FEATURES = [
    {
        title: "Threshold Sensitivity",
        description: "See exactly where a decision flips as threshold changes.",
    },
    {
        title: "Scenario Variation Testing",
        description: "Run controlled profile changes to test decision stability.",
    },
    {
        title: "Explainable Appeals",
        description: "Generate clear evidence and appeal-ready reasoning.",
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