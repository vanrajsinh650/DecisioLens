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
        <details
            style={{
                background: "var(--s1)",
                border: "1px solid var(--rim)",
                borderRadius: "10px",
                overflow: "hidden",
            }}
        >
            <summary
                className="font-mono uppercase"
                style={{
                    display: "flex",
                    cursor: "pointer",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    fontSize: "var(--fs-micro)",
                    letterSpacing: "0.08em",
                    color: "var(--t3)",
                    transition: "color 0.15s ease",
                }}
            >
                <span>[ RAW PAYLOAD CLICK TO EXPAND ]</span>
                <CopyButton value={responseJson} label="Copy JSON →" copiedLabel="✓ Copied" />
            </summary>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "16px",
                    borderTop: "1px solid var(--rim)",
                    padding: "24px",
                }}
                className="xl:[grid-template-columns:1fr_1fr]"
            >
                <div
                    style={{
                        background: "var(--s2)",
                        border: "1px solid var(--rim)",
                        borderRadius: "6px",
                        padding: "16px",
                    }}
                >
                    <p
                        className="font-mono uppercase"
                        style={{
                            marginBottom: "8px",
                            fontSize: "var(--fs-micro)",
                            letterSpacing: "0.08em",
                            color: "var(--t3)",
                        }}
                    >
                        Request
                    </p>
                    <pre
                        className="font-mono"
                        style={{
                            maxHeight: "256px",
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                            fontSize: "0.75rem",
                            color: "var(--t2)",
                        }}
                    >
                        {requestJson}
                    </pre>
                </div>
                <div
                    style={{
                        background: "var(--s2)",
                        border: "1px solid var(--rim)",
                        borderRadius: "6px",
                        padding: "16px",
                    }}
                >
                    <p
                        className="font-mono uppercase"
                        style={{
                            marginBottom: "8px",
                            fontSize: "var(--fs-micro)",
                            letterSpacing: "0.08em",
                            color: "var(--t3)",
                        }}
                    >
                        Response
                    </p>
                    <pre
                        className="font-mono"
                        style={{
                            maxHeight: "256px",
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                            fontSize: "0.75rem",
                            color: "var(--t2)",
                        }}
                    >
                        {responseJson}
                    </pre>
                </div>
            </div>
        </details>
    );
}
