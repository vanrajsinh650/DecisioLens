import { Suspense } from "react";

import ResultsPageClient from "@/features/results/ResultsPageClient";

export function generateMetadata() {
    return {
        title: "DecisioLens AI Trust Report",
        description: "View an AI decision audit report saved in this browser by DecisioLens.",
        openGraph: {
            title: "DecisioLens Trust Report",
            description: "Local AI decision audit report",
        },
    };
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="font-body text-sm" style={{ color: "var(--t2)" }}>Loading report...</div>}>
            <ResultsPageClient />
        </Suspense>
    );
}
