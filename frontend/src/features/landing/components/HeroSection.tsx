"use client";

import Link from "next/link";

import { useScrollReveal } from "@/hooks/useScrollReveal";

function CrosshairIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="16" cy="16" r="2.4" stroke="currentColor" strokeWidth="1.4" />
            <path d="M16 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M16 24V29" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M3 16H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M24 16H29" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    );
}

function ConcentricRingsIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.4" />
            <path d="M16 2V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M30 16H27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M16 30V27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M2 16H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    );
}

function DocumentCheckIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M9 5H20L25 10V26H9V5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M20 5V10H25" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M12 17L14.5 19.5L19.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 23H21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    );
}

const FEATURES = [
    {
        title: "Threshold Sensitivity",
        description:
            "Probe boundary pressure to reveal exactly where a small threshold shift flips acceptance into rejection.",
        color: "var(--aurora-amber)",
        icon: <CrosshairIcon />,
    },
    {
        title: "Scenario Drift",
        description:
            "Run controlled profile variations in parallel and detect where outcomes diverge under demographic perturbations.",
        color: "var(--aurora-crimson)",
        icon: <ConcentricRingsIcon />,
    },
    {
        title: "Decoded Verdict",
        description:
            "Translate the final decision into a transparent narrative with risk signals, drivers, and response protocol.",
        color: "var(--aurora-green)",
        icon: <DocumentCheckIcon />,
    },
];

export default function HeroSection() {
    const revealRef = useScrollReveal();

    return (
        <section
            ref={revealRef}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "64px",
                paddingTop: "24px",
                paddingBottom: "64px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "720px",
                    margin: "0 auto",
                    textAlign: "center",
                }}
            >
                <p
                    className="hero-stagger-1 font-mono uppercase"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "var(--fs-label)",
                        letterSpacing: "0.12em",
                        color: "var(--aurora-violet)",
                    }}
                >
                    <span
                        aria-hidden
                        className="dl-pulse-dot"
                        style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "var(--aurora-violet)",
                        }}
                    />
                    DECISION INTEGRITY SCANNER
                </p>

                <h1
                    className="hero-stagger-2 font-display"
                    style={{
                        marginTop: "24px",
                        marginBottom: 0,
                        fontSize: "var(--fs-hero)",
                        fontWeight: 800,
                        lineHeight: 1.08,
                        color: "var(--t1)",
                    }}
                >
                    Can you trust
                    <br />
                    <em style={{ color: "var(--aurora-violet)", fontStyle: "normal" }}>
                        this AI decision?
                    </em>
                </h1>

                <p
                    className="hero-stagger-3"
                    style={{
                        marginTop: "24px",
                        marginBottom: 0,
                        fontSize: "var(--fs-body)",
                        color: "var(--t2)",
                        lineHeight: 1.75,
                    }}
                >
                    DecisioLens peers into the void where algorithmic decisions are made — exposing
                    threshold fragility, hidden bias, and the invisible forces that determine who gets
                    accepted and who gets left behind.
                </p>

                <div className="hero-stagger-4" style={{ marginTop: "32px" }}>
                    <Link href="/audit" className="dl-btn-primary dl-btn-hero">
                        Analyze a Decision →
                    </Link>
                </div>

                <p
                    className="hero-stagger-5 font-mono"
                    style={{
                        marginTop: "16px",
                        marginBottom: 0,
                        fontSize: "var(--fs-micro)",
                        letterSpacing: "0.06em",
                        color: "var(--t3)",
                    }}
                >
                    ◈ THRESHOLD SENSITIVITY&nbsp;&nbsp;&nbsp;◈ SCENARIO DRIFT&nbsp;&nbsp;&nbsp;◈ DECODED VERDICT
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "24px",
                }}
            >
                {FEATURES.map((feature, index) => (
                    <article
                        key={feature.title}
                        className="dl-reveal-card dl-card"
                        data-stagger-delay={String(index * 0.1)}
                        style={{
                            padding: "24px",
                            borderLeft: `2px solid ${feature.color}`,
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                        }}
                    >
                        <div style={{ color: feature.color, marginBottom: "16px" }}>{feature.icon}</div>
                        <p
                            className="font-mono uppercase"
                            style={{
                                margin: 0,
                                fontSize: "var(--fs-label)",
                                letterSpacing: "0.12em",
                                color: feature.color,
                            }}
                        >
                            {feature.title}
                        </p>
                        <p
                            style={{
                                marginTop: "12px",
                                marginBottom: 0,
                                fontSize: "0.875rem",
                                color: "var(--t2)",
                                lineHeight: 1.7,
                            }}
                        >
                            {feature.description}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
