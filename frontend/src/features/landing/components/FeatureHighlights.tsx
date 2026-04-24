import Card from "@/components/shared/Card";

const FEATURES = [
    {
        title: "Is it stable?",
        description: "Shift the decision threshold and see exactly where the outcome flips — tested across 10 sensitivity points.",
        stat: "THRESHOLD_SIMULATION",
    },
    {
        title: "Is it fair?",
        description: "Swap gender, city, category, or college and check if the simulated decision changes when it shouldn't.",
        stat: "COUNTERFACTUAL_SCAN",
    },
    {
        title: "Can you appeal it?",
        description: "Get a plain-language breakdown of the decision and a formal appeal letter — ready to send to whoever made the call.",
        stat: "APPEAL_GENERATOR",
    },
    {
        title: "Why us?",
        description: "Unlike tools that analyze datasets, DecisioLens tests individual decision behavior through profile-level simulation — anyone can use it.",
        stat: "USER_LEVEL_SIMULATION",
    },
];

export default function FeatureHighlights() {
    return (
        <section>
            {/* Section overline */}
            <p
                className="font-pixel uppercase"
                style={{
                    fontSize: "0.8rem",
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