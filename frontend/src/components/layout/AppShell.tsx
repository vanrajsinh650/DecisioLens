"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import TopBar from "@/components/layout/TopBar";

interface AppShellProps {
    children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
    const pathname = usePathname();
    const isLanding = pathname === "/";

    return (
        <div className="dl-shell text-t1">
            <TopBar />
            <main
                className="dl-content"
                style={{
                    maxWidth: isLanding ? "none" : "1200px",
                    width: "100%",
                    marginLeft: "auto",
                    marginRight: "auto",
                    paddingLeft: isLanding ? 0 : "clamp(16px, 4vw, 32px)",
                    paddingRight: isLanding ? 0 : "clamp(16px, 4vw, 32px)",
                    paddingTop: isLanding ? 0 : "48px",
                    paddingBottom: isLanding ? 0 : "48px",
                }}
            >
                {children}
            </main>
        </div>
    );
}
