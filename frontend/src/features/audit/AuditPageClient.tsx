"use client";

import { useSearchParams } from "next/navigation";

import AuditWorkspace from "@/features/audit/AuditWorkspace";
import ComparisonExperience from "@/features/comparison/ComparisonExperience";

export default function AuditPageClient() {
    const searchParams = useSearchParams();
    const isCompareMode = searchParams.get("mode") === "compare";

    if (isCompareMode) {
        return <ComparisonExperience />;
    }

    return <AuditWorkspace />;
}
