import Link from "next/link";

export default function CTASection() {
    return (
        <section
            className="landing-cta-section"
        >
            <div className="landing-container landing-cta-panel">
                {/* Overline */}
                <p
                    className="font-mono uppercase"
                    style={{
                        fontSize: "0.7rem",
                        letterSpacing: "0.1em",
                        color: "var(--aurora-green)",
                        marginBottom: "16px",
                        fontWeight: 600,
                    }}
                >
                    {">> START TESTING"}
                </p>

                <h2
                    className="font-display"
                    style={{
                        fontSize: "clamp(1.8rem, 4vw, 3rem)",
                        fontWeight: 800,
                        color: "var(--t1)",
                        marginBottom: "12px",
                        letterSpacing: "-0.04em",
                        lineHeight: 1.08,
                    }}
                >
                    Find out if an AI decision was fair.
                </h2>

                <p
                    className="font-body"
                    style={{
                        fontSize: "var(--fs-body)",
                        color: "var(--t2)",
                        maxWidth: "520px",
                        margin: "0 auto 32px",
                        lineHeight: 1.75,
                    }}
                >
                    Enter a simple profile, pick a category (hiring, lending, insurance, education, or welfare), and we’ll show you whether the result would change if any small detail was different.
                </p>

                <Link
                    href="/audit"
                    className="dl-btn-primary dl-btn-hero"
                    style={{ textDecoration: "none" }}
                >
                    Test a Decision →
                </Link>

                {/* Footer line */}
                <div
                    className="font-mono"
                    style={{
                        marginTop: "32px",
                        fontSize: "0.75rem",
                        color: "var(--t3)",
                        opacity: 0.5,
                    }}
                >
                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                </div>
            </div>
        </section>
    );
}