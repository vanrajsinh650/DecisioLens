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
        <section className="landing-section landing-section-muted">
            <div className="landing-container">
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

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: "24px",
                        marginBottom: "32px",
                    }}
                >
                    <h2
                        className="font-display"
                        style={{
                            margin: 0,
                            maxWidth: "640px",
                            fontSize: "clamp(1.55rem, 3vw, 2.35rem)",
                            lineHeight: 1.12,
                            letterSpacing: "-0.035em",
                            color: "var(--t1)",
                        }}
                    >
                        One decision in. A complete fairness audit out.
                    </h2>
                    <p
                        className="font-mono"
                        style={{
                            margin: 0,
                            maxWidth: "300px",
                            color: "var(--t3)",
                            fontSize: "0.72rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            lineHeight: 1.8,
                        }}
                    >
                        profile → stress test → stability map → appeal packet
                    </p>
                </div>

                <div className="landing-feature-grid">
                    {FEATURES.map((feature, index) => (
                        <article
                            key={feature.title}
                            className="panel landing-feature-card"
                        >
                            <span
                                className="font-mono"
                                style={{
                                    color: index === 1 ? "var(--aurora-crimson)" : "var(--aurora-amber)",
                                    fontSize: "0.68rem",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    fontWeight: 700,
                                }}
                            >
                                0{index + 1} / {feature.stat}
                            </span>
                            <h3 className="font-display" style={{ margin: "18px 0 0", fontSize: "1.2rem", lineHeight: 1.25, fontWeight: 700, color: "var(--t1)" }}>{feature.title}</h3>
                            <p className="font-body" style={{ margin: "10px 0 0", fontSize: "0.9rem", lineHeight: 1.7, color: "var(--t2)" }}>{feature.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}