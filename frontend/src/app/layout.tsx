import type { Metadata } from "next";
import { ReactNode } from "react";

import AppShell from "@/components/layout/AppShell";
import { APP_NAME } from "@/lib/constants";

import "./globals.css";

export const metadata: Metadata = {
    title: `${APP_NAME} · AI Decision Stability + Bias Auditor`,
    description:
        "Audit AI decisions, reveal threshold sensitivity and bias patterns, and generate structured action + appeal outputs.",
};

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" className="dark">
            <body className="antialiased">
                <AppShell>{children}</AppShell>
            </body>
        </html>
    );
}
