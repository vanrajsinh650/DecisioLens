"use client";

import CopyButton from "@/components/shared/CopyButton";
import { useState } from "react";

interface AppealCardProps {
    appeal: string;
    explanationRequest?: string;
}

type Tab = "appeal" | "explanation";
type Language = "en" | "regional" | "both";

export default function AppealCard({ 
    appeal, 
    explanationRequest 
}: AppealCardProps) {
    const [activeTab, setActiveTab] = useState<Tab>(appeal ? "appeal" : "explanation");
    const [displayLanguage, setDisplayLanguage] = useState<Language>("both");

    if (!appeal && !explanationRequest) return null;

    const activeText = activeTab === "appeal" && appeal ? appeal : explanationRequest ?? appeal;
    const parts = activeText.split("--- REGIONAL LANGUAGE TRANSLATION ---");
    let englishText = parts[0]?.trim() || "";
    let regionalText = parts[1]?.trim();

    // Clean up Gemini meta-notes from existing history
    englishText = englishText.replace(/\(Note:.*?\)/gi, "").trim();
    if (regionalText) {
        regionalText = regionalText.replace(/\(Note:.*?\)/gi, "").trim();
    }

    const hasRegional = !!regionalText;

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

                {/* Tab switcher only show if both exist */}
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
                            Appeal Letter
                        </button>
                        <button
                            type="button"
                            className="font-mono uppercase"
                            style={tabStyle("explanation")}
                            onClick={() => setActiveTab("explanation")}
                        >
                            Right to Explanation
                        </button>
                    </div>
                )}
            </div>

            {/* Letter body container */}
            <div
                style={{
                    background: "var(--s2)",
                    border: "1px solid var(--rim)",
                    borderRadius: "6px",
                    overflow: "hidden",
                }}
            >
                {/* Language Selector Sub-Header */}
                <div 
                    style={{ 
                        background: "var(--s1)", 
                        borderBottom: "1px solid var(--rim)", 
                        padding: "12px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        flexWrap: "wrap"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="font-mono uppercase" style={{ fontSize: "10px", color: "var(--t3)", letterSpacing: "0.1em" }}>
                            Display Language:
                        </span>
                        <select
                            value={displayLanguage}
                            onChange={(e) => setDisplayLanguage(e.target.value as Language)}
                            style={{ 
                                background: "#111", 
                                color: "#fff", 
                                border: "1px solid var(--rim)", 
                                borderRadius: "4px",
                                fontSize: "12px",
                                padding: "4px 10px",
                                outline: "none",
                                cursor: "pointer"
                            }}
                        >
                            <option value="both" style={{ background: "#222", color: "#fff" }}>English + Regional</option>
                            <option value="en" style={{ background: "#222", color: "#fff" }}>English Only</option>
                            <option value="regional" style={{ background: "#222", color: "#fff" }}>Regional Only</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                         <span style={{ fontSize: "10px", color: "var(--t3)" }} className="font-mono uppercase">Copy Draft</span>
                         <CopyButton value={displayLanguage === "en" ? englishText : displayLanguage === "regional" ? (regionalText || englishText) : activeText} />
                    </div>
                </div>

                {/* Letter Content Area */}
                <div
                    style={{
                        padding: "24px 20px",
                        position: "relative",
                    }}
                >
                    {/* Letter text */}
                    <div
                        style={{
                            whiteSpace: "pre-wrap",
                            color: "var(--t2)",
                            lineHeight: 1.9,
                        }}
                    >
                        {(displayLanguage === "en" || displayLanguage === "both") && (
                            <div className="font-mono" style={{ fontSize: "var(--fs-mono)" }}>
                                {englishText}
                            </div>
                        )}
                        
                        {hasRegional && (displayLanguage === "regional" || displayLanguage === "both") && (
                            <div style={{ 
                                marginTop: displayLanguage === "both" ? "32px" : "0", 
                                paddingTop: displayLanguage === "both" ? "32px" : "0", 
                                borderTop: displayLanguage === "both" ? "1px dashed var(--s3)" : "none" 
                            }}>
                                <p className="font-body" style={{ color: "var(--aurora-teal)", fontSize: "0.7rem", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                    REGIONAL LANGUAGE VERSION
                                </p>
                                <div className="font-body" style={{ fontSize: "0.95rem", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
                                    {regionalText}
                                </div>
                            </div>
                        )}

                        {!hasRegional && displayLanguage === "regional" && (
                            <div style={{ color: "var(--t3)", fontStyle: "italic", fontSize: "0.9rem" }}>
                                Regional translation not available for this location. Showing English version.
                                <div style={{ marginTop: "16px", color: "var(--t2)", fontStyle: "normal" }}>{englishText}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
