import type { Metadata } from "next";
import { ReactNode } from "react";

import NextTopLoader from "nextjs-toploader";
import AppShell from "@/components/layout/AppShell";
import { APP_NAME } from "@/lib/constants";

import "./globals.css";

export const metadata: Metadata = {
    title: `${APP_NAME} · Decision Integrity Scanner`,
    description:
        "DecisioLens stress-tests algorithmic decisions, revealing threshold fragility, scenario bias, and confidence gaps before they become consequences.",
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
    openGraph: {
        title: `${APP_NAME} · Decision Integrity Scanner`,
        description:
            "Test whether an AI decision was fair, without needing access to the AI.",
        images: [{ url: "/logo.png", width: 512, height: 512, alt: "DecisioLens Logo" }],
    },
};

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className="antialiased">
                <NextTopLoader
                    color="var(--aurora-amber)"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    crawl={true}
                    showSpinner={false}
                    easing="ease"
                    speed={200}
                    shadow="0 0 10px var(--aurora-amber),0 0 5px var(--aurora-amber)"
                />
                <AppShell>{children}</AppShell>
            </body>
        </html>
    );
}
