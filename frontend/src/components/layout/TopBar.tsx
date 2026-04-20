"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export default function TopBar() {
    const pathname = usePathname();

    return (
        <header className="relative border-b border-ink-700/80 bg-ink-900/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent/80">
                        AI Decision Review Console
                    </p>
                    <Link href="/" className="font-display text-xl font-semibold text-ink-50">
                        {APP_NAME}
                    </Link>
                </div>

                <nav className="flex items-center gap-2" aria-label="Primary">
                    {NAV_LINKS.map((link) => {
                        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${isActive
                                        ? "border-accent/40 bg-accent/20 text-accent"
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
