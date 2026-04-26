"use client";

const STEPS = [
    {
        num: "01",
        title: "Enter a profile",
        description: "Give us the basics — age, income, location, education. Just one person's details.",
    },
    {
        num: "02",
        title: "We change small things",
        description: "We swap the gender, change the city, adjust the school. Then we run the decision again.",
    },
    {
        num: "03",
        title: "See what flipped",
        description: "If the result changed when it shouldn't have, we flag it. You get a full trust report in seconds.",
    },
];

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            style={{
                paddingTop: "80px",
                paddingBottom: "80px",
            }}
        >
            {/* Section overline */}
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
                How it works
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
                Three steps. One answer.
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "24px",
                }}
            >
                {STEPS.map((step) => (
                    <article
                        key={step.num}
                        className="panel"
                        style={{
                            position: "relative",
                            padding: "32px 28px",
                            borderRadius: "12px",
                            overflow: "hidden",
                        }}
                    >
                        {/* Step number */}
                        <span
                            className="font-mono"
                            style={{
                                fontSize: "0.7rem",
                                letterSpacing: "0.1em",
                                color: "var(--aurora-amber)",
                                fontWeight: 700,
                            }}
                        >
                            STEP {step.num}
                        </span>

                        <h3
                            className="font-display"
                            style={{
                                marginTop: "16px",
                                fontSize: "1.15rem",
                                fontWeight: 700,
                                color: "var(--t1)",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {step.title}
                        </h3>

                        <p
                            className="font-body"
                            style={{
                                marginTop: "12px",
                                fontSize: "0.9rem",
                                lineHeight: 1.65,
                                color: "var(--t2)",
                            }}
                        >
                            {step.description}
                        </p>

                        {/* Subtle scanline decoration */}
                        <div className="scanline" aria-hidden />
                    </article>
                ))}
            </div>
        </section>
    );
}
