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
                    WHAT AFFECTED THE SCORE?
                </p>
                <p className="font-body" style={{ marginTop: "4px", fontSize: "0.875rem", color: "var(--t2)" }}>
                    The impact of individual variables on the final AI decision score.
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                {impacts.map((item, i) => {
                    const barWidth = Math.min((Math.abs(item.delta) / maxDelta) * 100, 100);
                    const isPositive = item.direction === "positive";
                    const pct = (item.delta * 100).toFixed(1);
                    const sign = isPositive ? "+" : "";

                    return (
                        <div
                            key={i}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "140px 1fr 60px 50px",
                                alignItems: "center",
                                gap: "16px",
                                padding: "8px 12px",
                                background: item.decision_changed ? "var(--aurora-amber-surface)" : "transparent",
                                border: item.decision_changed ? "1px solid hsl(38, 82%, 24%)" : "1px solid transparent",
                                borderRadius: "4px",
                            }}
                        >
                            {/* Label */}
                            <span
                                className="font-mono"
                                style={{
                                    fontSize: "var(--fs-mono)",
                                    color: "var(--t1)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {item.variable}
                            </span>

                            {/* Bar Track */}
                            <div
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
                                        background: isPositive ? "var(--aurora-green)" : "var(--aurora-crimson)",
                                        borderRadius: "3px",
                                        transition: "width 0.5s ease",
                                    }}
                                />
                            </div>

                            {/* Value */}
                            <span
                                className="font-mono"
                                style={{
                                    fontSize: "var(--fs-mono)",
                                    fontWeight: 600,
                                    color: isPositive ? "var(--aurora-green)" : "var(--aurora-crimson)",
                                    textAlign: "right",
                                }}
                            >
                                {sign}{pct}%
                            </span>

                            {/* Flip indicator */}
                            <div style={{ textAlign: "right" }}>
                                {item.decision_changed && (
                                    <span
                                        className="font-mono"
                                        title="This change flipped the decision"
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
                                        FLIP
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
