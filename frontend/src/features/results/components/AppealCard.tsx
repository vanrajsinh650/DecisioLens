"use client";

import CopyButton from "@/components/shared/CopyButton";
import { useState } from "react";

interface AppealCardProps {
    appeal: string;
    explanationRequest?: string;
}

type Tab = "appeal" | "explanation";

export default function AppealCard({ appeal, explanationRequest }: AppealCardProps) {
    const [activeTab, setActiveTab] = useState<Tab>("appeal");

    if (!appeal && !explanationRequest) return null;

    const activeText = activeTab === "appeal" ? appeal : (explanationRequest ?? "");

    const tabStyle = (tab: Tab) => ({
        padding: "8px 16px",
        fontSize: "var(--fs-label)",
        fontWeight: 600,
        letterSpacing: "0.08em",
        borderRadius: "4px",
        cursor: "pointer",
        border: "none",
        background: activeTab === tab ? "var(--s3)" : "transparent",
        color: activeTab === tab ? "var(--t1)" : "var(--t3)",
        transition: "all 0.15s ease",
    } as React.CSSProperties);

    return (
        <div className="dl-reveal" style={{ position: "relative" }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "16px",
                }}
            >
                <p
                    className="font-body uppercase"
                    style={{
                        fontSize: "var(--fs-label)",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        color: "var(--t1)",
                    }}
                >
                    WHAT YOU CAN DO NEXT
                </p>

                {/* Tab switcher — only show if both exist */}
                {appeal && explanationRequest && (
                    <div
                        style={{
                            display: "flex",
                            gap: "4px",
                            background: "var(--s1)",
                            border: "1px solid var(--rim)",
                            borderRadius: "6px",
                            padding: "3px",
                        }}
                    >
                        <button
                            type="button"
                            className="font-mono uppercase"
                            style={tabStyle("appeal")}
                            onClick={() => setActiveTab("appeal")}
                        >
                            Write An Appeal Letter
                        </button>
                        <button
                            type="button"
                            className="font-mono uppercase"
                            style={tabStyle("explanation")}
                            onClick={() => setActiveTab("explanation")}
                        >
                            Ask For An Explanation
                        </button>
                    </div>
                )}
            </div>

            {/* Letter body */}
            <div
                style={{
                    background: "var(--s2)",
                    border: "1px solid var(--rim)",
                    borderRadius: "6px",
                    padding: "20px",
                    position: "relative",
                }}
            >
                {/* Copy button */}
                <div style={{ position: "absolute", top: "16px", right: "16px" }}>
                    <CopyButton value={activeText} />
                </div>

                {/* Letter text */}
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
                    {activeText}
                </div>
            </div>
        </div>
    );
}
