"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/* ── Custom Geometric SVG Icons (stroke-only, 32×32, strokeWidth 1.5) ── */

function SensitivityIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 20L12 10L18 16L26 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 16V26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
            <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="26" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

function DriftIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="22" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14 16H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 20V26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
            <path d="M22 20V26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
        </svg>
    );
}

function DecodedIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="7" width="22" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 13H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 18H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 22H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

const FEATURES = [
    {
        icon: <SensitivityIcon />,
        overline: "THRESHOLD SENSITIVITY",
        heading: "Where the Score Flips",
        body: "AI decisions live on threshold edges. We test every boundary to show exactly where acceptance turns to rejection.",
        accentColor: "var(--aurora-amber)",
        iconColor: "var(--aurora-amber)",
    },
    {
        icon: <DriftIcon />,
        overline: "SCENARIO DRIFT",
        heading: "Hidden Disparate Impact",
        body: "Parallel profiles surface demographic bias that aggregate statistics conceal. Every variable tested independently.",
        accentColor: "var(--aurora-crimson)",
        iconColor: "var(--aurora-crimson)",
    },
    {
        icon: <DecodedIcon />,
        overline: "DECODED VERDICT",
        heading: "No Black Boxes",
        body: "Every result includes structured reasoning, a trust score, and a ready-to-use appeal letter for accountability.",
        accentColor: "var(--aurora-green)",
        iconColor: "var(--aurora-green)",
    },
];

export default function HeroSection() {
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cardsRef.current) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            const els = cardsRef.current.querySelectorAll(".dl-reveal-card");
            els.forEach((el) => el.classList.add("revealed"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target as HTMLElement;
                        const delay = el.dataset.staggerDelay;
                        if (delay) {
                            setTimeout(() => el.classList.add("revealed"), parseFloat(delay) * 1000);
                        } else {
                            el.classList.add("revealed");
                        }
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.15 }
        );

        const cards = cardsRef.current.querySelectorAll(".dl-reveal-card");
        cards.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
    }, []);

    return (
        <section
            className="mx-auto flex flex-col items-center justify-center text-center"
            style={{
                maxWidth: "680px",
                minHeight: "calc(100vh - 56px)",
                paddingTop: "0",
            }}
        >
            {/* Overline with 6px aurora-violet dot */}
            <p className="hero-stagger-1 flex items-center gap-2 font-body uppercase tracking-[0.12em]"
                style={{
                    fontSize: "var(--fs-label)",
                    fontWeight: 600,
                    color: "var(--t2)",
                }}
            >
                <span
                    aria-hidden="true"
                    className="inline-block rounded-full"
                    style={{
                        width: "6px",
                        height: "6px",
                        backgroundColor: "var(--aurora-violet)",
                    }}
                />
                DECISION INTEGRITY SCANNER
            </p>

            {/* Headline — Syne 800 */}
            <h1
                className="hero-stagger-2 mt-6 font-display"
                style={{
                    fontSize: "clamp(2.8rem, 5.5vw, 4rem)",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: "var(--t1)",
                }}
            >
                Can you trust<br />this AI decision?
            </h1>

            {/* Subheadline */}
            <p
                className="hero-stagger-3 mt-6 font-body"
                style={{
                    fontSize: "var(--fs-body)",
                    fontWeight: 400,
                    lineHeight: 1.8,
                    color: "var(--t2)",
                }}
            >
                DecisioLens stress-tests algorithmic decisions — revealing threshold
                fragility, scenario bias, and confidence gaps before they become consequences.
            </p>

            {/* CTA Button */}
            <Link
                href="/audit"
                className="hero-stagger-4 mt-8 inline-flex items-center font-body font-semibold transition-all duration-150"
                style={{
                    background: "var(--aurora-violet)",
                    color: "#fff",
                    padding: "13px 30px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "var(--fs-body)",
                }}
                onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = "translateY(-2px)";
                    el.style.background = "hsl(265, 65%, 70%)";
                    el.style.boxShadow = "0 12px 32px hsl(265, 65%, 62%, 0.22)";
                }}
                onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = "translateY(0)";
                    el.style.background = "var(--aurora-violet)";
                    el.style.boxShadow = "none";
                }}
            >
                Analyze a Decision →
            </Link>

            {/* Signal Strip */}
            <p
                className="hero-stagger-5 mt-5 font-mono"
                style={{
                    fontSize: "var(--fs-micro)",
                    color: "var(--t3)",
                    letterSpacing: "0.05em",
                }}
            >
                ◈ Threshold Sensitivity · ◈ Scenario Drift · ◈ Bias Detection
            </p>

            {/* Three-card feature row */}
            <div
                ref={cardsRef}
                className="mt-16 grid w-full gap-6 text-left sm:grid-cols-3"
            >
                {FEATURES.map((feature, index) => (
                    <div
                        key={feature.overline}
                        className="dl-reveal-card dl-card"
                        data-stagger-delay={index * 0.1}
                        style={{
                            borderLeft: `2px solid ${feature.accentColor}`,
                        }}
                    >
                        {/* 32×32 stroke-only icon */}
                        <div style={{ color: feature.iconColor, marginBottom: "16px" }}>
                            {feature.icon}
                        </div>

                        {/* Uppercase overline in accent color */}
                        <p
                            className="font-body uppercase"
                            style={{
                                fontSize: "var(--fs-label)",
                                fontWeight: 600,
                                letterSpacing: "0.12em",
                                color: feature.accentColor,
                            }}
                        >
                            {feature.overline}
                        </p>

                        {/* Heading */}
                        <h2
                            className="mt-3 font-body"
                            style={{
                                fontSize: "var(--fs-h2)",
                                fontWeight: 600,
                                color: "var(--t1)",
                            }}
                        >
                            {feature.heading}
                        </h2>

                        {/* Body — two lines max */}
                        <p
                            className="mt-2 font-body"
                            style={{
                                fontSize: "0.875rem",
                                lineHeight: 1.6,
                                color: "var(--t2)",
                            }}
                        >
                            {feature.body}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}