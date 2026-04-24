"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export default function TopBar() {
    const pathname = usePathname();

    return (
        <header
            data-no-print
            className="sticky top-0 z-40"
            style={{
                height: "56px",
                background: "var(--s0)",
                borderBottom: "1px solid var(--rim)",
            }}
        >
            <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-baseline gap-2">
                        <span
                            className="font-body text-[1rem] font-semibold"
                            style={{ color: "var(--t1)" }}
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
                                    className={`rounded-inset px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-150 ${
                                        isActive
                                            ? "bg-s2 text-t1"
                                            : "text-t2 hover:bg-s1 hover:text-t1"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <span
                        className="font-mono text-t3"
                        style={{ fontSize: "var(--fs-micro)" }}
                    >
                        v1.0 · Hiring
                    </span>
                </div>
            </div>
        </header>
    );
}
