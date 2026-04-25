export default function AuditPresetCard() {
    return (
        <div className="dl-card" style={{ padding: "20px" }}>
            <p
                className="font-mono uppercase"
                style={{
                    fontSize: "var(--fs-label)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--t2)",
                    marginBottom: "16px",
                }}
            >
                HOW WE ANALYZE THIS
            </p>
            <ol style={{ display: "flex", flexDirection: "column", gap: "16px", listStyle: "none", padding: 0, margin: 0 }}>
                {[
                    { step: "01", label: "Score the candidate against your threshold", color: "var(--aurora-green)" },
                    { step: "02", label: "Test sensitivity across 7+ threshold variations", color: "var(--aurora-violet)" },
                    { step: "03", label: "Run parallel scenarios to detect demographic bias", color: "var(--aurora-crimson)" },
                    { step: "04", label: "Generate structured reasoning and appeal letter", color: "var(--aurora-teal)" },
                ].map((item) => (
                    <li key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <span
                            className="font-mono"
                            style={{
                                fontSize: "var(--fs-mono)",
                                color: item.color,
                                fontWeight: 600,
                                flexShrink: 0,
                            }}
                        >
                            {item.step}
                        </span>
                        <span
                            className="font-body"
                            style={{ fontSize: "0.875rem", color: "var(--t1)" }}
                        >
                            {item.label}
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
