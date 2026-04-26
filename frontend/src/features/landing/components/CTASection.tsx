import Link from "next/link";

export default function CTASection() {
    return (
        <section
            style={{
                borderTop: "1px solid var(--rim)",
                paddingTop: "64px",
                paddingBottom: "64px",
                textAlign: "center",
            }}
        >
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
                    fontSize: "var(--fs-h1)",
                    fontWeight: 800,
                    color: "var(--t1)",
                    marginBottom: "12px",
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
                Enter a simple profile, pick a category (hiring, lending, insurance, education, or welfare), and we show you if the result would change if any small detail was different.
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
        </section>
    );
}