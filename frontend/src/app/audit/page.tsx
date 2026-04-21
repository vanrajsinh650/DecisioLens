import { Suspense } from "react";

import AuditPageClient from "@/features/audit/AuditPageClient";

export default function AuditPage() {
    return (
        <Suspense fallback={<div className="text-sm text-ink-200">Loading audit workspace...</div>}>
            <AuditPageClient />
        </Suspense>
    );
}
