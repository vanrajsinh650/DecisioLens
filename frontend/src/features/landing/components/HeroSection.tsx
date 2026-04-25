"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const DecisionLensScene = dynamic(
    () => import("@/components/shared/DecisionLensScene"),
    { ssr: false }
);

function CrosshairIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M9 5H20L25 10V26H9V5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M20 5V10H25" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M12 17L14.5 19.5L19.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 23H21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    );
}

const FEATURES = [
    {
        title: "Find Hidden Mistakes",
        description: "We test the AI to find exactly where it starts making unfair mistakes or changing its mind about you.",
        icon: <CrosshairIcon />,
        color: "var(--aurora-amber)",
    },
    {
        title: "Check for Fairness",
        description: "We see if the AI treats you differently just because of your age, location, or background.",
        icon: <ConcentricRingsIcon />,
        color: "var(--aurora-crimson)",
    },
    {
        title: "Write an Appeal",
        description: "We help you write a strong, clear letter to challenge the AI's decision if you were unfairly rejected.",
        icon: <DocumentCheckIcon />,
        color: "var(--aurora-green)",
    },
];

// ASCII art decoration
const ASCII_BORDER = "╔══════════════════════════════════════════╗";
const ASCII_BORDER_BOTTOM = "╚══════════════════════════════════════════╝";

export default function HeroSection() {
    const revealRef = useScrollReveal();

    return (
        <section
            ref={revealRef}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0",
                paddingTop: "0",
                paddingBottom: "80px",
            }}
        >
            {/* Hero block with 3D scene behind */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    minHeight: "640px",
                    height: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    paddingTop: "8px",
                    paddingBottom: "0",
                }}
            >
                {/* 3D Decision Lens scene */}
                <DecisionLensScene />

                {/* TOP: Text content sits on top of 3D */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 2,
                        width: "100%",
                        maxWidth: "1100px",
                        textAlign: "center",
                        padding: "0 16px",
                    }}
                >
                    {/* Overline badge */}
                    <p
                        className="hero-stagger-1 font-mono uppercase"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            fontSize: "0.7rem",
                            letterSpacing: "0.1em",
                            color: "var(--aurora-violet)",
                            padding: "8px 16px",
                            border: "1px solid hsl(265 40% 25%)",
                            borderRadius: "4px",
                            background: "hsl(265 36% 9% / 0.7)",
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
                        COUNTERFACTUAL SIMULATOR · 5 DOMAINS
                    </p>

                    {/* Main headline */}
                    <h1
                        className="hero-stagger-2 font-display"
                        style={{
                            marginTop: "28px",
                            marginBottom: 0,
                            fontSize: "clamp(2rem, 5vw, 4.5rem)",
                            fontWeight: 800,
                            letterSpacing: "-0.04em",
                            lineHeight: 1.05,
                            color: "var(--t1)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Was this AI decision <em style={{ 
                            fontStyle: "italic",
                            color: "var(--primary-accent)", 
                        }}>
                            fair to you?
                        </em>
                    </h1>

                    {/* Body copy */}
                    <p
                        className="hero-stagger-3 font-body"
                        style={{
                            marginTop: "32px",
                            marginBottom: 0,
                            fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
                            color: "var(--t2)",
                            lineHeight: 1.6,
                            maxWidth: "1000px",
                            marginLeft: "auto",
                            marginRight: "auto",
                            letterSpacing: "-0.01em",
                            padding: "0 16px",
                        }}
                    >
                        DecisioLens simulates AI decision behavior using realistic profiles. It reveals threshold fragility, demographic bias, and hidden instability across hiring, lending, education, insurance, and government welfare.
                    </p>

                    {/* CTA directly below body text */}
                    <div className="hero-stagger-4" style={{ marginTop: "28px" }}>
                        <Link href="/audit" className="dl-btn-primary dl-btn-hero">
                            Simulate a Decision →
                        </Link>
                    </div>
                </div>


            </div>

            {/* MIDDLE: Domain pills sits between orbit and cards */}
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    padding: "32px 16px 48px 16px",
                    position: "relative",
                    zIndex: 10,
                }}
            >
                <div
                    className="hero-stagger-5 font-mono"
                    style={{
                        width: "80%",
                        maxWidth: "700px",
                        textAlign: "center",
                        fontSize: "1rem",
                        letterSpacing: "0.04em",
                        color: "var(--t3)",
                    }}
                >
                    <div style={{ color: "var(--t3)", opacity: 0.5 }}>{ASCII_BORDER}</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap", padding: "4px 0" }}>
                        <span style={{ color: "var(--aurora-amber)" }}>◈ HIRING</span>
                        <span style={{ color: "var(--aurora-crimson)" }}>◈ LENDING</span>
                        <span style={{ color: "var(--aurora-green)" }}>◈ EDUCATION</span>
                        <span style={{ color: "var(--aurora-teal)" }}>◈ INSURANCE</span>
                        <span style={{ color: "var(--aurora-violet)" }}>◈ WELFARE</span>
                    </div>
                    <div style={{ color: "var(--t3)", opacity: 0.5 }}>{ASCII_BORDER_BOTTOM}</div>
                </div>
            </div>

            {/* Feature cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "24px",
                }}
            >
                {FEATURES.map((feature, index) => (
                    <article
                        key={feature.title}
                        className="dl-reveal-card dl-feature-card"
                        data-stagger-delay={String(index * 0.1)}
                        style={{
                            position: "relative",
                            overflow: "hidden",
                            padding: "32px 28px",
                            cursor: "default",
                        }}
                    >
                        {/* Premium subtle glow at the top-left */}
                        <div
                            style={{
                                position: "absolute",
                                top: "-40%",
                                left: "-20%",
                                width: "150px",
                                height: "150px",
                                background: feature.color,
                                filter: "blur(70px)",
                                opacity: 0.15,
                                pointerEvents: "none",
                                zIndex: 0,
                            }}
                        />

                        <div style={{ position: "relative", zIndex: 1 }}>
                            <div style={{ color: feature.color, marginBottom: "20px" }}>{feature.icon}</div>

                            {/* Card title */}
                            <p
                                className="font-mono uppercase"
                                style={{
                                    margin: 0,
                                    fontSize: "0.85rem",
                                    letterSpacing: "0.1em",
                                    lineHeight: 1.6,
                                    color: feature.color,
                                    fontWeight: 700,
                                }}
                            >
                                {feature.title}
                            </p>

                            {/* Description */}
                            <p
                                className="font-body"
                                style={{
                                    marginTop: "12px",
                                    marginBottom: 0,
                                    fontSize: "0.95rem",
                                    color: "var(--t1)",
                                    opacity: 0.85,
                                    lineHeight: 1.6,
                                }}
                            >
                                {feature.description}
                            </p>

                            <div
                                className="font-mono"
                                style={{
                                    marginTop: "24px",
                                    paddingTop: "16px",
                                    borderTop: "1px solid rgba(255,255,255,0.06)",
                                    fontSize: "0.75rem",
                                    color: "var(--t3)",
                                    letterSpacing: "0.03em",
                                }}
                            >
                                {index === 0 && "[ tested on 10 different strictness levels ]"}
                                {index === 1 && "[ tests age · location · gender · background ]"}
                                {index === 2 && "[ auto-generated challenge letter ]"}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
