import { Suspense } from "react";

import AuditPageClient from "@/features/audit/AuditPageClient";

export default function AuditPage() {
    return (
        <Suspense fallback={<div className="font-body text-sm" style={{ color: "var(--t2)" }}>Loading audit workspace...</div>}>
            <AuditPageClient />
        </Suspense>
    );
}
