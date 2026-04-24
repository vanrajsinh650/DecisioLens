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
        <div className="relative min-h-screen text-t1">
            <ParticleCanvas />
            <TopBar />
            <main className="relative z-10 mx-auto w-full max-w-[1200px] px-6 py-12 lg:px-8">
                {children}
            </main>
        </div>
    );
}
