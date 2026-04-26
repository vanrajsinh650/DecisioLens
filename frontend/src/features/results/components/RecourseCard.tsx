import { RecourseItem } from "@/types/audit";

interface RecourseCardProps {
    recourse: RecourseItem[];
    originalDecision: "ACCEPT" | "REJECT";
}

export default function RecourseCard({ recourse, originalDecision }: RecourseCardProps) {
    if (originalDecision === "ACCEPT") {
        return (
            <div className="dl-reveal dl-card">
                <p
                    className="font-body uppercase"
                    style={{
                        fontSize: "var(--fs-label)",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        color: "var(--t1)",
                        marginBottom: "12px",
                    }}
                >
                    HOW TO IMPROVE YOUR RESULT
                </p>
                <p
                    className="font-body"
                    style={{ fontSize: "var(--fs-body)", color: "var(--t3)" }}
                >
                    The decision was in your favour. No action needed.
                </p>
            </div>
        );
    }

    if (!recourse || recourse.length === 0) {
        return null;
    }

    return (
        <div className="dl-reveal dl-card">
            {/* Header */}
            <div style={{ marginBottom: "20px" }}>
                <p
                    className="font-body uppercase"
                    style={{
                        fontSize: "var(--fs-label)",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        color: "var(--t1)",
                    }}
                >
                    HOW TO IMPROVE YOUR CHANCES
                </p>
                <p
                    className="font-body"
                    style={{ marginTop: "4px", fontSize: "var(--fs-body)", color: "var(--t2)" }}
                >
                    Here are specific steps that could change this result or help you make a stronger case.
                </p>
            </div>

            {/* Recourse list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {recourse.map((item, i) => (
                    <div
                        key={i}
                        style={{
                            background: "var(--s2)",
                            border: "1px solid var(--rim)",
                            borderLeft: "3px solid var(--aurora-teal)",
                            borderRadius: "6px",
                            padding: "14px 16px",
                        }}
                    >
                        {/* Step number + action */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <span
                                className="font-mono"
                                style={{
                                    fontSize: "var(--fs-micro)",
                                    fontWeight: 700,
                                    color: "var(--aurora-teal)",
                                    background: "hsl(172, 60%, 15%)",
                                    border: "1px solid hsl(172, 60%, 24%)",
                                    borderRadius: "4px",
                                    padding: "2px 8px",
                                    flexShrink: 0,
                                    letterSpacing: "0.05em",
                                    marginTop: "1px",
                                }}
                            >
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <p
                                className="font-body"
                                style={{
                                    fontSize: "var(--fs-body)",
                                    color: "var(--t1)",
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                }}
                            >
                                {item.action}
                            </p>
                        </div>

                        {/* Impact */}
                        <p
                            className="font-mono"
                            style={{
                                marginTop: "8px",
                                marginLeft: "42px",
                                fontSize: "var(--fs-micro)",
                                color: "var(--t3)",
                                letterSpacing: "0.02em",
                            }}
                        >
                            {item.impact}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
