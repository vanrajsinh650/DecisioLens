"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export default function TopBar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-40 border-b border-ink-700/80 bg-ink-900/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-signal-info/90">
                        AI Decision Auditing Platform
                    </p>
                    <div className="flex items-center gap-2">
                        <Link href="/" className="font-display text-xl font-semibold text-ink-50">
                            {APP_NAME}
                        </Link>
                        <span className="rounded-full border border-signal-info/40 bg-signal-infoSoft/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-signal-info">
                            Dashboard
                        </span>
                    </div>
                </div>

                <nav
                    className="flex items-center gap-2 rounded-xl border border-ink-600/70 bg-ink-800/70 p-1"
                    aria-label="Primary"
                >
                    {NAV_LINKS.map((link) => {
                        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${isActive
                                    ? "border-signal-info/45 bg-signal-infoSoft/80 text-signal-info"
                                    : "border-ink-600/70 bg-ink-800/70 text-ink-100 hover:border-ink-300 hover:text-ink-50"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
