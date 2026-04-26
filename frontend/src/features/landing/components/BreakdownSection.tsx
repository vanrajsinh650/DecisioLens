const FACTORS = [
    { name: "Zip code", rate: "31%", tone: "risk", copy: "Moved one result into manual review." },
    { name: "Income", rate: "14%", tone: "watch", copy: "Sensitive near the passing threshold." },
    { name: "School", rate: "09%", tone: "watch", copy: "Low but visible effect in two variants." },
    { name: "Age", rate: "02%", tone: "stable", copy: "Stayed inside tolerance bands." },
    { name: "Gender", rate: "00%", tone: "stable", copy: "No output change detected." },
    { name: "Name", rate: "00%", tone: "stable", copy: "No output change detected." },
];

function toneColor(tone: string) {
    if (tone === "risk") return "var(--aurora-crimson)";
    if (tone === "watch") return "var(--aurora-amber)";
    return "var(--aurora-green)";
}

export default function BreakdownSection() {
    return (
        <section className="landing-section landing-section-muted">
            <div className="landing-container">
                <div className="landing-section-split">
                    <div>
                        <p className="landing-eyebrow">factor breakdown</p>
                        <h2 className="landing-heading">Make the invisible failure modes easy to scan.</h2>
                    </div>
                    <p className="landing-section-copy">
                        DecisioLens does more than say “fair” or “unfair.” It shows which detail caused instability, how often it flipped, and whether the change needs human review.
                    </p>
                </div>

                <div className="landing-breakdown-grid">
                    {FACTORS.map((factor) => (
                        <article key={factor.name} className="landing-factor-card">
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center" }}>
                                <span
                                    aria-hidden
                                    style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        background: toneColor(factor.tone),
                                        boxShadow: `0 0 18px ${toneColor(factor.tone)}`,
                                    }}
                                />
                                <span className="font-mono" style={{ color: toneColor(factor.tone), fontSize: "0.75rem" }}>
                                    {factor.rate}
                                </span>
                            </div>
                            <h3 className="font-display">{factor.name}</h3>
                            <p>{factor.copy}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}