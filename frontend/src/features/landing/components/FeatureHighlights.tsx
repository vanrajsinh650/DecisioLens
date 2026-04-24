import Card from "@/components/shared/Card";

const FEATURES = [
    {
        title: "Is it stable?",
        description: "Move the decision threshold and see exactly where the outcome flips from ACCEPT to REJECT.",
        stat: "STABILITY_CHECK",
    },
    {
        title: "Is it fair?",
        description: "Swap gender, location, or education and check if the decision changes it shouldn't.",
        stat: "FAIRNESS_SCAN",
    },
    {
        title: "Can you explain it?",
        description: "Get a structured breakdown of why the AI decided this way, plus appeal-ready text you can copy.",
        stat: "DECODE_VERDICT",
    },
];

export default function FeatureHighlights() {
    return (
        <section>
            {/* Section overline */}
            <p
                className="font-pixel uppercase"
                style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: "var(--aurora-teal)",
                    marginBottom: "24px",
                }}
            >
                {">> CORE CAPABILITIES"}
            </p>

            <div className="grid gap-4 md:grid-cols-3">
                {FEATURES.map((feature) => (
                    <Card key={feature.title}>
                        <h2 className="font-display" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--t1)" }}>{feature.title}</h2>
                        <p className="font-body" style={{ marginTop: "8px", fontSize: "0.875rem", color: "var(--t2)" }}>{feature.description}</p>
                        <p
                            className="font-data"
                            style={{
                                marginTop: "12px",
                                fontSize: "0.9rem",
                                color: "var(--t3)",
                                letterSpacing: "0.04em",
                            }}
                        >
                            {"// "}{feature.stat}
                        </p>
                    </Card>
                ))}
            </div>
        </section>
    );
}