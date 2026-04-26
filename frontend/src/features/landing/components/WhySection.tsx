const REASONS = [
    {
        icon: "⊘",
        title: "Decisions should not change because of who you are",
        description: "If the AI gives a different answer just because you changed a name or zip code, that's a problem.",
    },
    {
        icon: "◎",
        title: "One profile is enough to find a flaw",
        description: "You don't need a dataset. A single real-world profile can expose inconsistency and unfairness.",
    },
    {
        icon: "△",
        title: "You deserve to know why",
        description: "Every test comes with a plain-language breakdown and a ready-to-send appeal letter.",
    },
];

export default function WhySection() {
    return (
        <section
            style={{
                paddingTop: "40px",
                paddingBottom: "80px",
            }}
        >
            <p
                className="font-mono"
                style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--aurora-amber)",
                    marginBottom: "12px",
                    fontWeight: 600,
                }}
            >
                Why this matters
            </p>

            <h2
                className="font-display"
                style={{
                    fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                    fontWeight: 700,
                    color: "var(--t1)",
                    marginBottom: "48px",
                    letterSpacing: "-0.03em",
                }}
            >
                AI decides your future. You should be able to check it.
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "24px",
                }}
            >
                {REASONS.map((r) => (
                    <div
                        key={r.title}
                        style={{
                            padding: "28px 24px",
                            borderLeft: "2px solid var(--aurora-amber)",
                        }}
                    >
                        <span
                            className="font-mono"
                            style={{
                                fontSize: "1.4rem",
                                color: "var(--aurora-amber)",
                                lineHeight: 1,
                            }}
                        >
                            {r.icon}
                        </span>

                        <h3
                            className="font-display"
                            style={{
                                marginTop: "16px",
                                fontSize: "1.05rem",
                                fontWeight: 700,
                                color: "var(--t1)",
                                letterSpacing: "-0.01em",
                                lineHeight: 1.35,
                            }}
                        >
                            {r.title}
                        </h3>

                        <p
                            className="font-body"
                            style={{
                                marginTop: "10px",
                                fontSize: "0.88rem",
                                lineHeight: 1.65,
                                color: "var(--t2)",
                            }}
                        >
                            {r.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
