"use client";

import { useApiHealth } from "@/hooks/useApiHealth";

export default function Footer() {
    const healthStatus = useApiHealth();
    const statusLabel = healthStatus === "online"
        ? "System online"
        : healthStatus === "checking"
            ? "Checking system status"
            : "System unavailable";
    const statusColor = healthStatus === "online"
        ? "var(--aurora-green)"
        : healthStatus === "checking"
            ? "var(--aurora-amber)"
            : "var(--aurora-crimson)";

    return (
        <footer
            className="landing-footer"
            style={{
                borderTop: "1px solid var(--rim)",
            }}
        >
            <div
                className="landing-container"
                style={{
                    paddingTop: "32px",
                    paddingBottom: "32px",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                }}
            >
                <p
                    className="font-mono"
                    style={{
                        fontSize: "0.7rem",
                        letterSpacing: "0.08em",
                        color: "var(--t3)",
                        margin: 0,
                    }}
                >
                    DecisioLens · Decision Integrity Lab · 2026
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                        aria-hidden
                        className="dl-pulse-dot"
                        style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: statusColor,
                        }}
                    />
                    <span
                        className="font-mono"
                        style={{
                            fontSize: "0.65rem",
                            letterSpacing: "0.08em",
                            color: "var(--t3)",
                            textTransform: "uppercase",
                        }}
                    >
                        {statusLabel}
                    </span>
                </div>
            </div>
        </footer>
    );
}
