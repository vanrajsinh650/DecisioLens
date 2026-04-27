"use client";
import React from "react";
import type { ImpactItem } from "@/types/audit";

interface ImpactAnalysisCardProps {
    impacts: ImpactItem[];
}

export default function ImpactAnalysisCard({ impacts }: ImpactAnalysisCardProps) {
    if (!impacts || impacts.length === 0) return null;

    // Anchor maxDelta at 0.15 so small 3% changes don't look massive
    const maxDelta = Math.max(...impacts.map((i) => Math.abs(i.delta)), 0.15);

    return (
        <div className="dl-reveal dl-card">
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <p
                    className="font-body uppercase"
                    style={{
                        fontSize: "var(--fs-label)",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        color: "var(--t1)",
                    }}
                >
                    WHAT MADE THE BIGGEST DIFFERENCE?
                </p>
                <p className="font-body" style={{ marginTop: "4px", fontSize: "0.875rem", color: "var(--t2)" }}>
                    These are the things that had the most influence on the final result.
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                {impacts.map((item, i) => {
                    const barWidth = Math.min((Math.abs(item.delta) / maxDelta) * 100, 100);
                    const isPositive = item.direction === "positive";
                    const color = item.direction === "none" ? "var(--t3)" : isPositive ? "var(--aurora-green)" : "var(--aurora-crimson)";
                    const pct = (item.delta * 100).toFixed(1);
                    const sign = isPositive ? "+" : "";

                    return (
                        <div
                            key={i}
                            className="impact-analysis-row"
                            style={{
                                padding: "8px 12px",
                                background: item.decision_changed ? "var(--aurora-amber-surface)" : "transparent",
                                border: item.decision_changed ? "1px solid hsl(38, 82%, 24%)" : "1px solid transparent",
                                borderRadius: "4px",
                            }}
                        >
                            {/* Label */}
                            <span
                                className="font-mono impact-label"
                                style={{
                                    fontSize: "var(--fs-mono)",
                                    color: "var(--t1)",
                                }}
                            >
                                {item.variable}
                            </span>

                            {/* Bar Track */}
                            <div
                                className="impact-bar"
                                style={{
                                    height: "6px",
                                    background: "var(--s2)",
                                    borderRadius: "3px",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${barWidth}%`,
                                        background: color,
                                        borderRadius: "3px",
                                        transition: "width 0.5s ease",
                                    }}
                                />
                            </div>

                            {/* Value */}
                            <span
                                className="font-mono impact-value"
                                style={{
                                    fontSize: "var(--fs-mono)",
                                    fontWeight: 600,
                                    color,
                                    textAlign: "right",
                                }}
                            >
                                {sign}{pct}%
                            </span>

                            {/* Flip indicator */}
                            <div className="impact-badge-wrap">
                                {item.decision_changed && (
                                    <span
                                        className="font-mono impact-flip-badge"
                                        title="This change flipped the result"
                                        style={{
                                            fontSize: "0.65rem",
                                            fontWeight: 600,
                                            padding: "2px 6px",
                                            background: "var(--aurora-amber)",
                                            color: "#000",
                                            borderRadius: "2px",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        RESULT FLIPPED
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
