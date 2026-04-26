"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const DecisionLensScene = dynamic(
    () => import("@/components/shared/DecisionLensScene"),
    { ssr: false }
);

/* ── Lab-style stats ───────────────────────────────────────────────── */
const STATS = [
    { value: "1,284",  label: "Decisions tested" },
    { value: "37%",    label: "Had fairness issues" },
    { value: "<2s",    label: "Average test time" },
];

export default function HeroSection() {
    const revealRef = useScrollReveal();

    return (
        <section
            ref={revealRef}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                paddingBottom: "80px",
            }}
        >
            {/* ── Hero: two-column on desktop, stacked on mobile ── */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    minHeight: "640px",
                    display: "grid",
                    alignItems: "center",
                }}
                className="hero-grid"
            >
                {/* Ambient amber radial glow (behind everything) */}
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        top: "20%",
                        right: "10%",
                        width: "520px",
                        height: "520px",
                        background: "radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 70%)",
                        borderRadius: "50%",
                        pointerEvents: "none",
                        zIndex: 0,
                    }}
                />

                {/* LEFT COLUMN — text content */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 2,
                        maxWidth: "620px",
                        padding: "0 16px",
                    }}
                >
                    {/* Status bar */}
                    <div
                        className="hero-stagger-1 font-mono"
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "16px",
                            alignItems: "center",
                            fontSize: "0.65rem",
                            letterSpacing: "0.08em",
                            color: "var(--t3)",
                            textTransform: "uppercase",
                            marginBottom: "20px",
                        }}
                    >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <span
                                aria-hidden
                                className="dl-pulse-dot"
                                style={{
                                    width: "5px",
                                    height: "5px",
                                    borderRadius: "50%",
                                    background: "var(--aurora-green)",
                                }}
                            />
                            chamber online
                        </span>
                        <span style={{ color: "var(--t4)" }}>·</span>
                        <span>seed 0xA7F3</span>
                        <span style={{ color: "var(--t4)" }}>·</span>
                        <span>monitoring 1,284 decisions</span>
                    </div>

                    {/* Kicker chip */}
                    <div
                        className="hero-stagger-1"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 14px",
                            borderRadius: "4px",
                            border: "1px solid rgba(217,119,6,0.3)",
                            background: "rgba(217,119,6,0.06)",
                            marginBottom: "24px",
                        }}
                    >
                        <span
                            className="font-mono"
                            style={{
                                fontSize: "0.65rem",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: "var(--aurora-amber)",
                                fontWeight: 600,
                            }}
                        >
                            decision integrity lab
                        </span>
                    </div>

                    {/* Headline */}
                    <h1
                        className="hero-stagger-2 font-display"
                        style={{
                            margin: 0,
                            fontSize: "clamp(2.2rem, 5vw, 4rem)",
                            fontWeight: 800,
                            letterSpacing: "-0.04em",
                            lineHeight: 1.05,
                            color: "var(--t1)",
                        }}
                    >
                        Can this decision{" "}
                        <br className="hidden-mobile" />
                        be{" "}
                        <span className="text-gradient-amber">
                            trusted?
                        </span>
                    </h1>

                    {/* Subcopy */}
                    <p
                        className="hero-stagger-3 font-body"
                        style={{
                            marginTop: "24px",
                            fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
                            lineHeight: 1.65,
                            color: "var(--t2)",
                            maxWidth: "520px",
                        }}
                    >
                        We test what happens when small details change.
                        If the answer flips, the system isn't being fair.
                    </p>

                    {/* CTAs */}
                    <div
                        className="hero-stagger-4"
                        style={{
                            marginTop: "32px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "12px",
                            alignItems: "center",
                        }}
                    >
                        <Link href="/audit" className="dl-btn-primary dl-btn-hero">
                            Test a Decision →
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="dl-btn-ghost"
                            style={{ padding: "14px 24px" }}
                        >
                            How It Works
                        </Link>
                    </div>

                    {/* Lab stats */}
                    <div
                        className="hero-stagger-5"
                        style={{
                            marginTop: "48px",
                            display: "flex",
                            gap: "32px",
                            flexWrap: "wrap",
                        }}
                    >
                        {STATS.map((s) => (
                            <div key={s.label}>
                                <p
                                    className="font-display"
                                    style={{
                                        margin: 0,
                                        fontSize: "1.6rem",
                                        fontWeight: 700,
                                        color: "var(--t1)",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    {s.value}
                                </p>
                                <p
                                    className="font-mono"
                                    style={{
                                        margin: 0,
                                        marginTop: "4px",
                                        fontSize: "0.65rem",
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        color: "var(--t3)",
                                    }}
                                >
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN — 3D orbit scene */}
                <div
                    className="hero-orbit-col"
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        minHeight: "480px",
                    }}
                >
                    <DecisionLensScene />
                </div>
            </div>
        </section>
    );
}
