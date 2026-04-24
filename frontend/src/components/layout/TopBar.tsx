"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export default function TopBar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header
            data-no-print
            className="dl-topbar sticky top-0 z-40"
            style={{ height: "56px" }}
        >
            <div style={{
                maxWidth: "1200px",
                width: "100%",
                height: "100%",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: "clamp(16px, 4vw, 32px)",
                paddingRight: "clamp(16px, 4vw, 32px)",
            }}>
                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span
                        aria-hidden="true"
                        className="dl-pulse-dot"
                        style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "var(--aurora-violet)",
                        }}
                    />
                    <span
                        className="font-display"
                        style={{
                            color: "var(--t1)",
                            fontSize: "1rem",
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                        }}
                    >
                        {APP_NAME}
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav
                    className="dl-nav-desktop"
                    aria-label="Primary"
                >
                    {NAV_LINKS.map((link) => {
                        const isActive =
                            link.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="font-mono uppercase dl-nav-link"
                                data-active={isActive ? "true" : undefined}
                                style={{
                                    fontSize: "var(--fs-micro)",
                                    letterSpacing: "0.08em",
                                    borderRadius: "4px",
                                    padding: "7px 10px",
                                    color: isActive ? "var(--t1)" : "var(--t2)",
                                    background: isActive ? "var(--s2)" : "transparent",
                                    border: isActive ? "1px solid var(--rim)" : "1px solid transparent",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile hamburger */}
                <button
                    type="button"
                    className="dl-hamburger"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileOpen}
                >
                    <span
                        style={{
                            display: "block",
                            width: "20px",
                            height: "2px",
                            background: "var(--t1)",
                            borderRadius: "1px",
                            transition: "all 0.2s ease",
                            transform: mobileOpen ? "rotate(45deg) translateY(4px)" : "none",
                        }}
                    />
                    <span
                        style={{
                            display: "block",
                            width: mobileOpen ? "0px" : "20px",
                            height: "2px",
                            background: "var(--t1)",
                            borderRadius: "1px",
                            transition: "all 0.2s ease",
                            opacity: mobileOpen ? 0 : 1,
                        }}
                    />
                    <span
                        style={{
                            display: "block",
                            width: "20px",
                            height: "2px",
                            background: "var(--t1)",
                            borderRadius: "1px",
                            transition: "all 0.2s ease",
                            transform: mobileOpen ? "rotate(-45deg) translateY(-4px)" : "none",
                        }}
                    />
                </button>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <nav
                    className="dl-mobile-nav"
                    aria-label="Mobile navigation"
                >
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
                                    padding: "14px 24px",
                                    fontSize: "var(--fs-mono)",
                                    letterSpacing: "0.1em",
                                    color: isActive ? "var(--t1)" : "var(--t2)",
                                    background: isActive ? "var(--s2)" : "transparent",
                                    borderBottom: "1px solid var(--rim)",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            )}
        </header>
    );
}
