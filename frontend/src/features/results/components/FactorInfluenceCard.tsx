"use client";
import React from "react";
import type { FactorImportanceItem } from "@/types/audit";

interface FactorInfluenceCardProps {
    factors: FactorImportanceItem[];
}

export default function FactorInfluenceCard({ factors }: FactorInfluenceCardProps) {
    if (!factors || factors.length === 0) return null;

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
                    FACTOR INFLUENCE BREAKDOWN
                </p>
                <p className="font-body" style={{ marginTop: "4px", fontSize: "0.875rem", color: "var(--t2)" }}>
                    This shows how much weight the system gave to each part of your profile.
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
                {factors.map((item, i) => {
                    const weightPct = (item.weight * 100).toFixed(0);
                    // How much of this factor's potential was actually used (0–100% fill within the weight track)
                    const fillRatio = item.weight > 0 ? Math.min(item.contribution / item.weight, 1) : 0;
                    const contributionBarPct = (fillRatio * Number(weightPct)).toFixed(1);

                    return (
                        <div
                            key={i}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "160px 1fr 60px",
                                alignItems: "center",
                                gap: "20px",
                            }}
                        >
                            {/* Factor Label */}
                            <span
                                className="font-mono"
                                style={{
                                    fontSize: "var(--fs-mono)",
                                    color: "var(--t1)",
                                    fontWeight: 500,
                                }}
                            >
                                {item.factor}
                            </span>

                            {/* Track */}
                            <div
                                style={{
                                    height: "10px",
                                    background: "rgba(255, 255, 255, 0.03)",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    position: "relative",
                                    border: "1px solid rgba(255, 255, 255, 0.05)",
                                }}
                            >
                                {/* Weight Background (Max possible influence) */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        height: "100%",
                                        width: `${weightPct}%`,
                                        background: "var(--rim)",
                                        opacity: 0.2,
                                    }}
                                />
                                {/* Contribution Bar (Actual influence) */}
                                <div
                                    className="dl-gauge"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        height: "100%",
                                        width: `${contributionBarPct}%`,
                                        background: "linear-gradient(90deg, var(--aurora-blue) 0%, #38BDF8 100%)",
                                        borderRadius: "10px",
                                        transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                        boxShadow: "0 0 12px var(--aurora-blue-surface)",
                                    }}
                                />
                            </div>

                            {/* Weight Value */}
                            <span
                                className="font-mono"
                                style={{
                                    fontSize: "var(--fs-mono)",
                                    fontWeight: 700,
                                    color: "var(--aurora-blue)",
                                    textAlign: "right",
                                }}
                            >
                                {weightPct}%
                            </span>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--s2)" }}>
                <p className="font-mono" style={{ fontSize: "0.7rem", color: "var(--t3)", textTransform: "uppercase" }}>
                    Note: Weights are based on domain-specific forensic models.
                </p>
            </div>
        </div>
    );
}
