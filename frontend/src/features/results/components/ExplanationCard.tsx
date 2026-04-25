interface ExplanationCardProps {
    explanation: string;
}

export default function ExplanationCard({ explanation }: ExplanationCardProps) {
    // Parse structure from explanation text
    const sentences = explanation.split(/(?<=[.?!])\s+/).filter(s => s.length > 5);

    const summary = sentences.slice(0, 2).join(" ");
    const drivers = sentences.slice(2, 5).map(s => s.trim());
    const recommendation = sentences.slice(5).slice(0, 2).join(" ");

    const driverColors = [
        "var(--aurora-crimson)",
        "var(--aurora-violet)",
        "var(--aurora-teal)",
    ];

    return (
        <div
            className="dl-reveal"
            style={{
                borderLeft: "3px solid var(--aurora-violet)",
                paddingLeft: "24px",
            }}
        >
            {/* Overline */}
            <p
                className="font-body uppercase"
                style={{
                    fontSize: "var(--fs-label)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--t1)",
                    marginBottom: "24px",
                }}
            >
                WHAT THIS MEANS FOR YOU
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Summary */}
                <div>
                    <p
                        className="font-body uppercase"
                        style={{
                            fontSize: "var(--fs-label)",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            color: "var(--t2)",
                        }}
                    >
                        SUMMARY
                    </p>
                    <p
                        className="font-body"
                        style={{
                            marginTop: "8px",
                            fontSize: "var(--fs-body)",
                            lineHeight: 1.8,
                            color: "var(--t2)",
                        }}
                    >
                        {summary || "No summary available."}
                    </p>
                </div>

                {/* Key Drivers */}
                <div>
                    <p
                        className="font-body uppercase"
                        style={{
                            fontSize: "var(--fs-label)",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            color: "var(--t2)",
                        }}
                    >
                        MAIN REASONS
                    </p>
                    <ul style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", listStyle: "none", padding: 0, margin: 0 }}>
                        {drivers.length > 0 ? (
                            drivers.map((driver, idx) => (
                                <li
                                    key={idx}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "12px",
                                    }}
                                >
                                    <span
                                        aria-hidden
                                        style={{
                                            marginTop: "8px",
                                            flexShrink: 0,
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            background: driverColors[idx % driverColors.length],
                                        }}
                                    />
                                    <span
                                        className="font-body"
                                        style={{
                                            fontSize: "var(--fs-body)",
                                            lineHeight: 1.8,
                                            color: "var(--t1)",
                                        }}
                                    >
                                        {driver}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li
                                className="font-body"
                                style={{ fontSize: "var(--fs-body)", color: "var(--t2)" }}
                            >
                                No specific drivers isolated.
                            </li>
                        )}
                    </ul>
                </div>

                {/* Recommendation */}
                <div>
                    <p
                        className="font-body"
                        style={{
                            fontSize: "var(--fs-h2)",
                            fontWeight: 600,
                            color: "var(--t1)",
                        }}
                    >
                        Recommendation
                    </p>
                    <p
                        className="font-body"
                        style={{
                            marginTop: "8px",
                            fontSize: "var(--fs-body)",
                            lineHeight: 1.8,
                            color: "var(--t1)",
                        }}
                    >
                        {recommendation || "Review manual guidelines."}
                    </p>
                </div>
            </div>
        </div>
    );
}
