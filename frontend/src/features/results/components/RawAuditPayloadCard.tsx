import Card from "@/components/shared/Card";
import CopyButton from "@/components/shared/CopyButton";
import { AuditSession } from "@/types/audit";

interface RawAuditPayloadCardProps {
    session: AuditSession;
}

const toPrettyJson = (payload: unknown): string => {
    return JSON.stringify(payload, null, 2);
};

export default function RawAuditPayloadCard({ session }: RawAuditPayloadCardProps) {
    const requestJson = toPrettyJson(session.request);
    const responseJson = toPrettyJson(session.response);

    return (
        <Card
            title="Pass 1 — Functional (Raw Output)"
            subtitle="This confirms form submit, API call, and response rendering work end-to-end."
            rightSlot={<CopyButton value={responseJson} label="Copy Raw JSON" copiedLabel="JSON Copied" />}
        >
            <div className="grid gap-3 xl:grid-cols-2">
                <div className="rounded-xl border border-ink-600/70 bg-ink-900/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Request Payload</p>
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-ink-100">{requestJson}</pre>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-900/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Response Payload</p>
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-ink-100">{responseJson}</pre>
                </div>
            </div>
        </Card>
    );
}
