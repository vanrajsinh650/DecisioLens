import Card from "@/components/shared/Card";

const FEATURES = [
    {
        title: "Is it stable?",
        description: "Move the decision threshold and see exactly where the outcome flips from ACCEPT to REJECT.",
    },
    {
        title: "Is it fair?",
        description: "Swap gender, location, or education and check if the decision changes — it shouldn't.",
    },
    {
        title: "Can you explain it?",
        description: "Get a structured breakdown of why the AI decided this way, plus appeal-ready text you can copy.",
    },
];

export default function FeatureHighlights() {
    return (
        <section>
            <div className="grid gap-4 md:grid-cols-3">
                {FEATURES.map((feature) => (
                    <Card key={feature.title}>
                        <h2 className="font-display" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--t1)" }}>{feature.title}</h2>
                        <p className="font-body" style={{ marginTop: "8px", fontSize: "0.875rem", color: "var(--t2)" }}>{feature.description}</p>
                    </Card>
                ))}
            </div>
        </section>
    );
}