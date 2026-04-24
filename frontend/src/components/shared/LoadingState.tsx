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
            <div className="dl-card" style={{ padding: "20px" }}>
                <div
                    style={{
                        border: "1px solid var(--rim)",
                        borderRadius: "6px",
                        background: "var(--s2)",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    <p
                        className="font-mono uppercase"
                        style={{
                            margin: 0,
                            fontSize: "var(--fs-micro)",
                            letterSpacing: "0.08em",
                            color: "var(--aurora-violet)",
                        }}
                    >
                        {label ?? "RUNNING ANALYSIS"}
                    </p>
                    {LOADING_MESSAGES.slice(0, currentIndex + 1).map((msg, i) => (
                        <p
                            key={i}
                            className={`font-mono loading-terminal-line ${i === currentIndex ? "terminal-active" : ""}`}
                            style={{
                                margin: 0,
                                fontSize: "var(--fs-mono)",
                                color: i === currentIndex ? "var(--aurora-violet)" : "var(--t2)",
                                animationDelay: `${i * 0.18}s`,
                            }}
                        >
                            {msg}
                            {i === currentIndex ? (
                                <span className="terminal-cursor" style={{ marginLeft: "4px", color: "var(--aurora-violet)" }}>
                                    _
                                </span>
                            ) : null}
                        </p>
                    ))}

                    {description ? (
                        <p className="font-body" style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "var(--t3)" }}>
                            {description}
                        </p>
                    ) : null}
                </div>
                <div
                    style={{
                        marginTop: "12px",
                        height: "2px",
                        background: "var(--rim)",
                        borderRadius: "1px",
                        overflow: "hidden",
                    }}
                >
                    <div className="loading-progress-bar" style={{ height: "100%", background: "var(--aurora-violet)", width: "0%" }} />
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(3, 3, 10, 0.95)",
            }}
        >
            <div style={{ width: "100%", maxWidth: "400px", paddingInline: "24px" }}>
                <div
                    style={{
                        border: "1px solid var(--rim)",
                        borderRadius: "10px",
                        background: "var(--s1)",
                        boxShadow: "var(--shadow-dark)",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "24px" }}>
                        <p
                            className="font-mono uppercase"
                            style={{
                                margin: 0,
                                fontSize: "var(--fs-micro)",
                                letterSpacing: "0.1em",
                                color: "var(--aurora-violet)",
                            }}
                        >
                            {label ?? "TERMINAL FEED"}
                        </p>

                        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: "130px" }}>
                            {LOADING_MESSAGES.slice(0, currentIndex + 1).map((msg, i) => (
                                <p
                                    key={i}
                                    className="font-mono loading-terminal-line"
                                    style={{
                                        margin: 0,
                                        fontSize: "var(--fs-mono)",
                                        color: i === currentIndex ? "var(--aurora-violet)" : "var(--t2)",
                                        animationDelay: `${i * 0.2}s`,
                                    }}
                                >
                                    {msg}
                                    {i === currentIndex ? (
                                        <span className="terminal-cursor" style={{ marginLeft: "4px", color: "var(--aurora-violet)" }}>
                                            _
                                        </span>
                                    ) : null}
                                </p>
                            ))}
                        </div>

                        {description ? (
                            <p className="font-body" style={{ margin: "8px 0 0", fontSize: "0.875rem", color: "var(--t2)" }}>
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div
                        style={{
                            height: "2px",
                            background: "var(--rim)",
                            borderRadius: "1px",
                            overflow: "hidden",
                        }}
                    >
                        <div className="loading-progress-bar" style={{ height: "100%", background: "var(--aurora-violet)", width: "0%" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
