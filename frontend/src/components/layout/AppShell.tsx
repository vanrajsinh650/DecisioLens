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
            <TopBar />
            <main className="dl-content" style={{
                maxWidth: "1200px",
                width: "100%",
                marginLeft: "auto",
                marginRight: "auto",
                paddingLeft: "clamp(16px, 4vw, 32px)",
                paddingRight: "clamp(16px, 4vw, 32px)",
                paddingTop: "48px",
                paddingBottom: "48px",
            }}>
                {children}
            </main>
        </div>
    );
}
