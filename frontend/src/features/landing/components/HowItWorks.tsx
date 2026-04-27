"use client";

import { useRef, useEffect } from "react";

const STEPS = [
    {
        num: "01",
        label: "CAPTURE",
        title: "Enter a profile",
        description: "Give us the basics: age, income, location, education. Just one person's details.",
        icon: "◈",
    },
    {
        num: "02",
        label: "MUTATE",
        title: "We change small things",
        description: "We swap the gender, change the city, adjust the school. Then we run the decision again.",
        icon: "⟳",
    },
    {
        num: "03",
        label: "VERDICT",
        title: "See what flipped",
        description: "If the result changed when it shouldn't have, we flag it. You get a full trust report in seconds.",
        icon: "◎",
    },
];

export default function HowItWorks() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const cards = sectionRef.current?.querySelectorAll(".step-card-reveal");
        if (!cards) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).classList.add("revealed");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        cards.forEach((c) => observer.observe(c));
        return () => observer.disconnect();
    }, []);

    return (
        <section id="how-it-works" ref={sectionRef} className="landing-section">
            <div className="landing-container">
                <p className="landing-eyebrow" style={{ marginBottom: "12px" }}>
                    THE PROTOCOL
                </p>

                <h2
                    className="font-display"
                    style={{
                        fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
                        fontWeight: 700,
                        color: "var(--t1)",
                        marginBottom: "12px",
                        letterSpacing: "-0.04em",
                        lineHeight: 1.08,
                    }}
                >
                    Three steps inside the audit workflow.
                </h2>

                <p
                    className="font-body"
                    style={{
                        maxWidth: "560px",
                        color: "var(--t2)",
                        margin: "0 0 56px",
                        lineHeight: 1.75,
                    }}
                >
                    Give DecisioLens one real-world case. It runs controlled variations, compares every outcome, and turns the result into a clear trust report.
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {STEPS.map((step, i) => (
                        <article
                            key={step.num}
                            className="step-card-reveal panel step-card"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            {/* Step tag */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                                <span className="font-mono step-num-badge">
                                    {step.num} / {step.label}
                                </span>
                                <span aria-hidden style={{ fontSize: "1.6rem", color: "var(--aurora-amber)", opacity: 0.7 }}>
                                    {step.icon}
                                </span>
                            </div>

                            {/* Glowing divider */}
                            <div className="step-divider" />

                            <h3
                                className="font-display"
                                style={{
                                    marginTop: "20px",
                                    fontSize: "1.2rem",
                                    fontWeight: 700,
                                    color: "var(--t1)",
                                    letterSpacing: "-0.02em",
                                    lineHeight: 1.25,
                                }}
                            >
                                {step.title}
                            </h3>

                            <p
                                className="font-body"
                                style={{
                                    marginTop: "12px",
                                    fontSize: "0.9rem",
                                    lineHeight: 1.7,
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
            </div>
        </section>
    );
}
