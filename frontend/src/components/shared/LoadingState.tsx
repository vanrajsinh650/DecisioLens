"use client";

import { useEffect, useState } from "react";

interface LoadingStateProps {
    label?: string;
    description?: string;
    compact?: boolean;
}

const LOADING_MESSAGES = [
    "> Parsing candidate signal...",
    "> Mapping threshold boundary...",
    "> Running 14 scenario variants...",
    "> Detecting bias vectors...",
    "> Compiling verdict...",
];

export default function LoadingState({ label, description, compact = false }: LoadingStateProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => {
                if (prev >= LOADING_MESSAGES.length - 1) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 600);

        return () => clearInterval(interval);
    }, []);

    if (compact) {
        return (
            <div className="dl-card">
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {label && (
                        <p className="font-body uppercase"
                            style={{
                                fontSize: "var(--fs-label)",
                                fontWeight: 600,
                                letterSpacing: "0.12em",
                                color: "var(--t2)",
                            }}
                        >
                            {label}
                        </p>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {LOADING_MESSAGES.slice(0, currentIndex + 1).map((msg, i) => (
                            <p
                                key={i}
                                className="font-mono"
                                style={{
                                    fontSize: "var(--fs-mono)",
                                    color: i === currentIndex ? "var(--aurora-violet)" : "var(--t2)",
                                    transition: "opacity 0.15s ease",
                                }}
                            >
                                {msg}
                                {i === currentIndex && (
                                    <span className="terminal-cursor" style={{ marginLeft: "4px", color: "var(--aurora-violet)" }}>_</span>
                                )}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Full-viewport overlay loading state
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--s0)",
                opacity: 0.95,
            }}
        >
            <div style={{ width: "100%", maxWidth: "400px", padding: "0 24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {LOADING_MESSAGES.slice(0, currentIndex + 1).map((msg, i) => (
                        <p
                            key={i}
                            className="font-mono"
                            style={{
                                fontSize: "var(--fs-mono)",
                                fontWeight: 400,
                                color: i === currentIndex ? "var(--aurora-violet)" : "var(--t2)",
                                transition: "opacity 0.15s ease",
                            }}
                        >
                            {msg}
                            {i === currentIndex && (
                                <span className="terminal-cursor" style={{ marginLeft: "4px", color: "var(--aurora-violet)" }}>_</span>
                            )}
                        </p>
                    ))}
                </div>

                {description && (
                    <p className="font-body"
                        style={{
                            marginTop: "24px",
                            fontSize: "0.875rem",
                            color: "var(--t2)",
                        }}
                    >
                        {description}
                    </p>
                )}

                {/* 2px progress bar */}
                <div
                    style={{
                        marginTop: "32px",
                        height: "2px",
                        background: "var(--rim)",
                        borderRadius: "1px",
                        overflow: "hidden",
                    }}
                >
                    <div
                        className="loading-progress-bar"
                        style={{
                            height: "100%",
                            background: "var(--aurora-violet)",
                            width: "0%",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
