"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export default function TopBar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            data-no-print
            className={`dl-topbar sticky top-0 z-40${scrolled ? " dl-topbar-scrolled" : ""}`}
            style={{ height: "64px" }}
        >
            <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: "clamp(20px, 5vw, 48px)",
                paddingRight: "clamp(20px, 5vw, 48px)",
            }}>
                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                    <span
                        aria-hidden="true"
                        className="dl-pulse-dot"
                        style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: "var(--aurora-amber)",
                            boxShadow: "0 0 10px var(--aurora-amber)",
                        }}
                    />
                    <span
                        className="font-display"
                        style={{
                            color: "var(--t1)",
                            fontSize: "1.3rem",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {APP_NAME}
                    </span>
                </Link>

                {/* Desktop nav — centered pill group */}
                <nav className="dl-nav-desktop" aria-label="Primary">
                    <div className="topbar-nav-group">
                        {NAV_LINKS.map((link) => {
                            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="topbar-nav-link font-mono"
                                    data-active={isActive ? "true" : undefined}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Right side: CTA */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Link href="/audit" className="topbar-cta-btn dl-nav-desktop">
                        <span className="topbar-cta-shine" />
                        Test a Decision →
                    </Link>

                    {/* Mobile hamburger */}
                    <button
                        type="button"
                        className="dl-hamburger"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        <span style={{
                            display: "block", width: "20px", height: "2px",
                            background: "var(--t1)", borderRadius: "1px",
                            transition: "all 0.25s ease",
                            transform: mobileOpen ? "rotate(45deg) translateY(6px)" : "none",
                        }} />
                        <span style={{
                            display: "block", width: "20px", height: "2px",
                            background: "var(--t1)", borderRadius: "1px",
                            transition: "all 0.25s ease",
                            opacity: mobileOpen ? 0 : 1,
                            transform: mobileOpen ? "scaleX(0)" : "none",
                        }} />
                        <span style={{
                            display: "block", width: "20px", height: "2px",
                            background: "var(--t1)", borderRadius: "1px",
                            transition: "all 0.25s ease",
                            transform: mobileOpen ? "rotate(-45deg) translateY(-6px)" : "none",
                        }} />
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <>
                    <div
                        onClick={() => setMobileOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.5)",
                            backdropFilter: "blur(4px)",
                            zIndex: 45,
                        }}
                    />
                    <nav className="dl-mobile-nav" aria-label="Mobile navigation" style={{ zIndex: 50 }}>
                        {NAV_LINKS.map((link) => {
                            const isActive =
                                link.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="font-mono uppercase"
                                    style={{
                                        display: "block",
                                        padding: "15px 24px",
                                        fontSize: "0.8rem",
                                        letterSpacing: "0.1em",
                                        color: isActive ? "var(--aurora-amber)" : "var(--t2)",
                                        background: isActive ? "rgba(245,124,0,0.06)" : "transparent",
                                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        <div style={{ padding: "16px 24px" }}>
                            <Link
                                href="/audit"
                                onClick={() => setMobileOpen(false)}
                                className="topbar-cta-btn"
                                style={{ display: "block", textAlign: "center" }}
                            >
                                Test a Decision →
                            </Link>
                        </div>
                    </nav>
                </>
            )}
        </header>
    );
}
