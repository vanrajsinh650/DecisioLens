import CopyButton from "@/components/shared/CopyButton";

interface AppealCardProps {
    appeal: string;
}

export default function AppealCard({ appeal }: AppealCardProps) {
    if (!appeal) {
        return null;
    }

    return (
        <div
            className="dl-reveal"
            style={{ position: "relative" }}
        >
            {/* Overline */}
            <p
                className="font-body uppercase"
                style={{
                    fontSize: "var(--fs-label)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--t1)",
                    marginBottom: "16px",
                }}
            >
                RESPONSE PROTOCOL
            </p>

            <div
                style={{
                    background: "var(--s2)",
                    borderRadius: "6px",
                    padding: "20px",
                    position: "relative",
                }}
            >
                {/* Copy button — top-right */}
                <div
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                    }}
                >
                    <CopyButton value={appeal} />
                </div>

                {/* Appeal text — monospace block */}
                <div
                    className="font-mono"
                    style={{
                        whiteSpace: "pre-wrap",
                        fontSize: "var(--fs-mono)",
                        color: "var(--t2)",
                        lineHeight: 1.9,
                        paddingRight: "80px",
                    }}
                >
                    {appeal}
                </div>
            </div>
        </div>
    );
}
