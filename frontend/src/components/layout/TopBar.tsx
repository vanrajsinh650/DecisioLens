"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export default function TopBar() {
    const pathname = usePathname();

    return (
        <header
            data-no-print
            className="dl-topbar sticky top-0 z-40"
            style={{
                height: "56px",
            }}
        >
            <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-baseline gap-2">
                        <span
                            aria-hidden="true"
                            className="dl-pulse-dot inline-block rounded-full"
                            style={{
                                width: "6px",
                                height: "6px",
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
                </div>

                <div className="flex items-center gap-6">
                    <nav
                        className="hidden items-center gap-1 sm:flex"
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
                                    className="font-mono uppercase"
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
                                    onMouseEnter={(e) => {
                                        if (isActive) return;
                                        e.currentTarget.style.color = "var(--t1)";
                                        e.currentTarget.style.background = "var(--s1)";
                                        e.currentTarget.style.borderColor = "var(--rim)";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (isActive) return;
                                        e.currentTarget.style.color = "var(--t2)";
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.borderColor = "transparent";
                                    }}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <span
                        className="font-mono text-t3"
                        style={{
                            fontSize: "var(--fs-micro)",
                            letterSpacing: "0.06em",
                        }}
                    >
                        OBSERVATORY v1.0
                    </span>
                </div>
            </div>
        </header>
    );
}
