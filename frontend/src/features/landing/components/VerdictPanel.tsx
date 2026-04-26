const FLIP_BARS = [
    { label: "Name swap", value: "0 flips", width: "18%", color: "var(--aurora-green)" },
    { label: "Location shift", value: "3 flips", width: "64%", color: "var(--aurora-crimson)" },
    { label: "School tier", value: "1 flip", width: "38%", color: "var(--aurora-amber)" },
    { label: "Threshold ±5%", value: "2 flips", width: "52%", color: "var(--aurora-amber)" },
];

const TRACE_ROWS = [
    ["baseline", "approve", "0.78"],
    ["zip_variant", "review", "0.54"],
    ["school_variant", "approve", "0.71"],
];

export default function VerdictPanel() {
    return (
        <section className="landing-section landing-verdict-section">
            <div className="landing-container landing-verdict-grid">
                <div>
                    <p
                        className="font-mono"
                        style={{
                            marginBottom: "12px",
                            fontSize: "0.65rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--aurora-amber)",
                            fontWeight: 600,
                        }}
                    >
                        live report preview
                    </p>

                    <h2
                        className="font-display"
                        style={{
                            margin: 0,
                            fontSize: "clamp(1.6rem, 3.6vw, 2.7rem)",
                            lineHeight: 1.08,
                            letterSpacing: "-0.04em",
                            color: "var(--t1)",
                        }}
                    >
                        See the result the way an auditor would.
                    </h2>

                    <p
                        className="font-body"
                        style={{
                            marginTop: "18px",
                            maxWidth: "540px",
                            color: "var(--t2)",
                            lineHeight: 1.75,
                        }}
                    >
                        A DecisioLens report explains the score, the flip points, and the evidence trail — so a suspicious decision becomes something you can inspect, share, and challenge.
                    </p>

                    <div className="landing-mini-metrics">
                        <div>
                            <span className="font-display">82%</span>
                            <p className="font-mono">stability score</p>
                        </div>
                        <div>
                            <span className="font-display">04</span>
                            <p className="font-mono">variants tested</p>
                        </div>
                        <div>
                            <span className="font-display">01</span>
                            <p className="font-mono">high-risk factor</p>
                        </div>
                    </div>
                </div>

                <article className="panel landing-report-card">
                    <div className="landing-report-header">
                        <div>
                            <p className="font-mono">DECISION TRACE / HIRING-084</p>
                            <h3 className="font-display">Borderline but explainable</h3>
                        </div>
                        <span className="font-mono landing-verdict-pill">WATCH</span>
                    </div>

                    <div className="landing-score-row">
                        <div className="landing-score-ring">
                            <span className="font-display">82</span>
                            <small className="font-mono">/100</small>
                        </div>
                        <div>
                            <p className="font-mono" style={{ color: "var(--aurora-green)", margin: 0 }}>
                                mostly stable
                            </p>
                            <p style={{ color: "var(--t2)", margin: "8px 0 0", lineHeight: 1.65 }}>
                                One location variant moved the decision into manual review. Everything else stayed within tolerance.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: "14px", marginTop: "28px" }}>
                        {FLIP_BARS.map((bar) => (
                            <div key={bar.label}>
                                <div className="landing-bar-label">
                                    <span>{bar.label}</span>
                                    <span>{bar.value}</span>
                                </div>
                                <div className="landing-bar-track">
                                    <span style={{ width: bar.width, background: bar.color }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="landing-trace-table">
                        {TRACE_ROWS.map(([variant, result, confidence]) => (
                            <div key={variant}>
                                <span>{variant}</span>
                                <span>{result}</span>
                                <span>{confidence}</span>
                            </div>
                        ))}
                    </div>

                    <button type="button" className="dl-btn-ghost landing-copy-button">
                        Copy trace
                    </button>
                </article>
            </div>
        </section>
    );
}