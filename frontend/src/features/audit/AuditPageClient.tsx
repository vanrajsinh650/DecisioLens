"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import AuditWorkspace from "@/features/audit/AuditWorkspace";

// Lazy-load ComparisonExperience - only fetched when ?mode=compare is active
const ComparisonExperience = dynamic(
    () => import("@/features/comparison/ComparisonExperience"),
    {
        ssr: false,
        loading: () => (
            <div
                className="font-mono"
                style={{
                    color: "var(--t3)",
                    padding: "48px 0",
                    textAlign: "center",
                    fontSize: "var(--fs-mono)",
                    letterSpacing: "0.06em",
                }}
            >
                Loading comparison workspace...
            </div>
        ),
    }
);

export default function AuditPageClient() {
    const searchParams = useSearchParams();
    const isCompareMode = searchParams.get("mode") === "compare";

    if (isCompareMode) {
        return <ComparisonExperience />;
    }

    return <AuditWorkspace />;
}
