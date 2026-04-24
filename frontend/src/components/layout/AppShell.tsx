"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";
import TopBar from "@/components/layout/TopBar";

const ParticleCanvas = dynamic(
    () => import("@/components/shared/ParticleCanvas"),
    { ssr: false }
);

interface AppShellProps {
    children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
    return (
        <div className="dl-shell text-t1">
            <ParticleCanvas />
            <div aria-hidden className="dl-orbit-ring dl-orbit-ring--inner" />
            <div aria-hidden className="dl-orbit-ring dl-orbit-ring--outer" />
            <div aria-hidden className="dl-scan-line" />
            <TopBar />
            <main className="dl-content mx-auto w-full max-w-[1200px] px-6 py-12 lg:px-8">
                {children}
            </main>
        </div>
    );
}
