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
        title: "Threshold Simulation",
        description:
            "We shift the decision boundary across 10 points and show you exactly where the outcome flips. No guesswork.",
        color: "var(--aurora-amber)",
        icon: <CrosshairIcon />,
    },
    {
        title: "Counterfactual Drift",
        description:
            "We swap gender, city, category, or college and check if the simulated result changes when it has no good reason to.",
        color: "var(--aurora-crimson)",
        icon: <ConcentricRingsIcon />,
    },
    {
        title: "Appeal-Ready Report",
        description:
            "Gemini AI reads the findings and writes a plain-language explanation plus a formal appeal letter you can copy and send.",
        color: "var(--aurora-green)",
        icon: <DocumentCheckIcon />,
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

                {/* TOP: Text content — sits on top of 3D */}
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
                            fontSize: "var(--fs-hero)",
                            fontWeight: 700,
                            lineHeight: 1.12,
                            color: "var(--t1)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Was this AI decision <em style={{ color: "var(--aurora-violet)", fontStyle: "normal" }}>fair to you?</em>
                    </h1>

                    {/* Body copy — 2 lines */}
                    <p
                        className="hero-stagger-3 font-body"
                        style={{
                            marginTop: "24px",
                            marginBottom: 0,
                            fontSize: "var(--fs-body)",
                            color: "var(--t2)",
                            lineHeight: 1.75,
                            maxWidth: "100%",
                            marginLeft: "auto",
                            marginRight: "auto",
                        }}
                    >
                        DecisioLens simulates AI decision behavior using realistic profiles.
                        <br />
                        It reveals threshold fragility, demographic bias, and hidden instability across hiring, lending, education, insurance, and government welfare.
                    </p>

                    {/* CTA — directly below body text */}
                    <div className="hero-stagger-4" style={{ marginTop: "28px" }}>
                        <Link href="/audit" className="dl-btn-primary dl-btn-hero">
                            Simulate a Decision →
                        </Link>
                    </div>
                </div>


            </div>

            {/* MIDDLE: Domain pills — sits between orbit and cards */}
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
                            padding: "28px 24px",
                            background: "var(--s1)",
                            border: "1px solid var(--rim)",
                            borderRadius: "10px",
                            borderLeft: `2px solid ${feature.color}`,
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            cursor: "default",
                        }}
                    >
                        <div style={{ color: feature.color, marginBottom: "16px" }}>{feature.icon}</div>

                        {/* Card title */}
                        <p
                            className="font-mono uppercase"
                            style={{
                                margin: 0,
                                fontSize: "0.75rem",
                                letterSpacing: "0.08em",
                                lineHeight: 1.6,
                                color: feature.color,
                                fontWeight: 600,
                            }}
                        >
                            {feature.title}
                        </p>

                        {/* Description */}
                        <p
                            className="font-body"
                            style={{
                                marginTop: "14px",
                                marginBottom: 0,
                                fontSize: "0.875rem",
                                color: "var(--t2)",
                                lineHeight: 1.7,
                            }}
                        >
                            {feature.description}
                        </p>

                        <div
                            className="font-mono"
                            style={{
                                marginTop: "16px",
                                paddingTop: "12px",
                                borderTop: "1px solid var(--rim)",
                                fontSize: "0.75rem",
                                color: "var(--t3)",
                                letterSpacing: "0.03em",
                            }}
                        >
                            {index === 0 && "[ 10 threshold test points ]"}
                            {index === 1 && "[ gender · city · category · college ]"}
                            {index === 2 && "[ appeal letter auto-generated ]"}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
