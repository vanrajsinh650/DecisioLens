const PROOF = [
    {
        label: "public benefits",
        title: "Flagged a location-sensitive denial before review.",
        metric: "18 variants",
    },
    {
        label: "hiring workflow",
        title: "Explained why a borderline candidate kept flipping outcomes.",
        metric: "2 min audit",
    },
    {
        label: "lending check",
        title: "Turned a black-box score into a traceable appeal packet.",
        metric: "1 profile",
    },
];

export default function ProofSection() {
    return (
        <section className="landing-section landing-section-muted">
            <div className="landing-container">
                <div className="landing-section-split">
                    <div>
                        <p className="landing-eyebrow">proof of use</p>
                        <h2 className="landing-heading">Enough substance to feel like a real product.</h2>
                    </div>
                    <p className="landing-section-copy">
                        These mock cases show how a single profile can uncover unstable thresholds, proxy signals, and decisions that deserve a second look.
                    </p>
                </div>

                <div className="landing-proof-grid">
                    {PROOF.map((item) => (
                        <article key={item.label} className="panel landing-proof-card">
                            <p className="font-mono">{item.label}</p>
                            <h3 className="font-display">{item.title}</h3>
                            <span className="font-mono">{item.metric}</span>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}