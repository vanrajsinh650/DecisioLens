const LOGOS = ["CivicAI", "HireGrid", "LendWise", "PolicyLab", "GrantOps", "InsuraFlow"];

export default function MarqueeSection() {
    // 
    return (
        <section className="landing-marquee-section" aria-label="Trusted by">
            <div className="landing-container">
                <div className="landing-marquee-shell">
                    <span
                        className="font-mono"
                        style={{
                            color: "var(--t3)",
                            fontSize: "0.68rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Trusted by teams checking decisions in
                    </span>
                    <div className="landing-marquee-window" aria-hidden="true">
                        <div className="landing-marquee-track">
                            {[...LOGOS, ...LOGOS].map((logo, index) => (
                                <span key={`${logo}-${index}`} className="font-display landing-logo-mark">
                                    {logo}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}