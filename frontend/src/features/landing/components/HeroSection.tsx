"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";

const DecisionLensScene = dynamic(
    () => import("@/components/shared/DecisionLensScene"),
    { ssr: false }
);

export default function HeroSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) el.classList.add("hero-in-view"); },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="landing-hero hero-section-full"
            style={{ position: "relative", overflow: "visible" }}
        >
            {/* Subtle dot-grid */}
            <div className="hero-grid-lines" aria-hidden style={{ overflow: "hidden" }} />

            {/* Content grid */}
            <div
                className="hero-grid landing-container"
                style={{
                    position: "relative",
                    minHeight: "calc(100vh - 64px)",
                    display: "grid",
                    alignItems: "center",
                    gap: "clamp(32px, 5vw, 72px)",
                    paddingTop: "clamp(24px, 2vw, 36px)",
                    paddingBottom: "clamp(80px, 8vw, 120px)",
                }}
            >
                {/* Ambient amber glow */}
                <div aria-hidden style={{
                    position: "absolute", top: "15%", right: "8%",
                    width: "600px", height: "600px",
                    background: "radial-gradient(circle, rgba(255,69,0,0.1) 0%, rgba(245,124,0,0.04) 40%, transparent 70%)",
                    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                }} />
                <div aria-hidden style={{
                    position: "absolute", bottom: "20%", left: "-5%",
                    width: "400px", height: "400px",
                    background: "radial-gradient(circle, rgba(245,124,0,0.06) 0%, transparent 65%)",
                    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                }} />

                {/* LEFT COLUMN */}
                <div style={{ position: "relative", zIndex: 2, maxWidth: "740px" }}>

                    {/* Status chip */}
                    <div
                        className="hero-stagger-1 font-mono"
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "12px",
                            alignItems: "center",
                            fontSize: "0.63rem",
                            letterSpacing: "0.09em",
                            color: "var(--t3)",
                            textTransform: "uppercase",
                            marginBottom: "22px",
                        }}
                    >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
                            <span
                                aria-hidden
                                className="dl-pulse-dot"
                                style={{
                                    width: "6px", height: "6px", borderRadius: "50%",
                                    background: "var(--aurora-green)",
                                    boxShadow: "0 0 8px var(--aurora-green)",
                                }}
                            />
                            system online
                        </span>
                        <span style={{ color: "var(--t4)" }}>·</span>
                        <span>decision integrity engine</span>
                    </div>

                    {/* Kicker chip */}
                    <div className="hero-stagger-1 hero-chip">
                        <span className="font-mono hero-chip-text">
                            decision integrity lab
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="hero-stagger-2 font-display hero-headline">
                        Can this decision be{" "}
                        <span className="text-gradient-amber hero-trusted-word">
                            trusted?
                        </span>
                    </h1>

                    {/* Subcopy */}
                    <p className="hero-stagger-3 font-body hero-subcopy">
                        We test what happens when small details change.
                        If the answer flips, the system isn't being fair — and you get a clear report you can actually use.
                    </p>

                    {/* CTAs */}
                    <div className="hero-stagger-4 hero-cta-row">
                        <Link href="/audit" className="dl-btn-primary dl-btn-hero dl-btn-shine">
                            <span className="btn-shine-effect" />
                            Test a Decision →
                        </Link>
                        <Link href="#how-it-works" className="dl-btn-ghost hero-ghost-btn">
                            How It Works
                        </Link>
                    </div>

                    {/* What DecisioLens tests */}
                    <div
                        className="hero-stagger-5 hero-signal-card"
                        style={{
                            marginTop: "48px",
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
                            <div key={label} className="hero-lane-cell">
                                <p className="font-mono" style={{
                                    margin: 0, fontSize: "0.6rem", letterSpacing: "0.1em",
                                    textTransform: "uppercase", color: "var(--t3)",
                                }}>
                                    domain 0{index + 1}
                                </p>
                                <p className="font-body" style={{
                                    margin: "4px 0 0", color: "var(--t1)",
                                    fontSize: "0.86rem", fontWeight: 600,
                                }}>
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
                        position: "relative", width: "100%", height: "100%", minHeight: "500px",
                        overflow: "visible",
                    }}
                >
                    <DecisionLensScene />
                </div>
            </div>

            {/* Bottom fade */}
            <div className="hero-bottom-fade" aria-hidden />
        </section>
    );
}
