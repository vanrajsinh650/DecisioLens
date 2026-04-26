import Card from "@/components/shared/Card";

const FEATURES = [
    {
        title: "Is it consistent?",
        description: "We test the same profile at 10 different passing bars and show you exactly where the result flips.",
        stat: "DECISION_LEVEL_TEST",
    },
    {
        title: "Is it fair?",
        description: "We swap gender, city, category, or school and check if the result changes when it shouldn't.",
        stat: "FAIRNESS_CHECK",
    },
    {
        title: "Can you appeal it?",
        description: "Get a plain-language breakdown of the decision and a formal appeal letter ready to send.",
        stat: "APPEAL_LETTER",
    },
    {
        title: "Why use this?",
        description: "Most fairness tools need a full dataset. We work with just one profile and one decision. Anyone can use it.",
        stat: "ONE_PROFILE_TESTING",
    },
];

export default function FeatureHighlights() {
    return (
        <section>
            {/* Section overline */}
            <p
                className="font-mono uppercase"
                style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    color: "var(--aurora-teal)",
                    marginBottom: "24px",
                    fontWeight: 600,
                }}
            >
                {">> WHAT WE DO"}
            </p>

            <div className="grid gap-4 md:grid-cols-3">
                {FEATURES.map((feature) => (
                    <Card key={feature.title}>
                        <h2 className="font-display" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--t1)" }}>{feature.title}</h2>
                        <p className="font-body" style={{ marginTop: "8px", fontSize: "0.875rem", color: "var(--t2)" }}>{feature.description}</p>
                        <p
                            className="font-mono"
                            style={{
                                marginTop: "12px",
                                fontSize: "0.75rem",
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