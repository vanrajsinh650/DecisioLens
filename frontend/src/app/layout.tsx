import type { Metadata } from "next";
import { ReactNode } from "react";

import AppShell from "@/components/layout/AppShell";
import { APP_NAME } from "@/lib/constants";

import "./globals.css";

export const metadata: Metadata = {
    title: `${APP_NAME} · Decision Integrity Scanner`,
    description:
        "DecisioLens stress-tests algorithmic decisions revealing threshold fragility, scenario bias, and confidence gaps before they become consequences.",
};

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className="antialiased">
                <AppShell>{children}</AppShell>
            </body>
        </html>
    );
}
