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
    { value: "1,284", label: "Decisions tested" },
    { value: "37%", label: "Had fairness issues" },
    { value: "<2s", label: "Average test time" },
];

export default function HeroSection() {
    const revealRef = useScrollReveal();

    return (
        <section
            ref={revealRef}
            className="landing-hero"
            style={{
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* ── Hero: two-column on desktop, stacked on mobile ── */}
            <div
                className="hero-grid landing-container"
                style={{
                    position: "relative",
                    minHeight: "min(760px, calc(100vh - 56px))",
                    display: "grid",
                    alignItems: "center",
                    gap: "clamp(32px, 5vw, 72px)",
                    paddingTop: "clamp(72px, 8vw, 112px)",
                    paddingBottom: "clamp(72px, 8vw, 112px)",
                }}
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
                        background: "radial-gradient(circle, rgba(255,69,0,0.12) 0%, rgba(245,124,0,0.05) 38%, transparent 72%)",
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
                        If the answer flips, the system isn't being fair — and you get a clear report you can actually use.
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

                    <div
                        className="hero-stagger-5 hero-signal-card"
                        style={{
                            marginTop: "36px",
                            maxWidth: "560px",
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "1px",
                            overflow: "hidden",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            background: "rgba(255, 255, 255, 0.06)",
                        }}
                    >
                        {["Hiring", "Lending", "Benefits"].map((label, index) => (
                            <div
                                key={label}
                                style={{
                                    padding: "14px 16px",
                                    background: "rgba(10, 10, 10, 0.76)",
                                }}
                            >
                                <p
                                    className="font-mono"
                                    style={{
                                        margin: 0,
                                        fontSize: "0.62rem",
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        color: "var(--t3)",
                                    }}
                                >
                                    lane 0{index + 1}
                                </p>
                                <p
                                    className="font-body"
                                    style={{
                                        margin: "4px 0 0",
                                        color: "var(--t1)",
                                        fontSize: "0.86rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {label}
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
