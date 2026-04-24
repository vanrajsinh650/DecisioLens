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
            {/* Pixel font overline */}
            <p
                className="font-pixel uppercase"
                style={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.12em",
                    color: "var(--aurora-green)",
                    marginBottom: "16px",
                }}
            >
                {">> SIMULATE NOW"}
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
                Simulate an AI decision. Find out if it was fair.
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
                Enter a realistic profile, pick a domain (hiring, lending, insurance, education, or welfare) and get a full counterfactual test report in seconds.
            </p>

            <Link
                href="/audit"
                className="dl-btn-primary dl-btn-hero"
                style={{ textDecoration: "none" }}
            >
                Simulate a Decision →
            </Link>

            {/* ASCII footer line */}
            <div
                className="font-data"
                style={{
                    marginTop: "32px",
                    fontSize: "1rem",
                    color: "var(--t3)",
                    opacity: 0.5,
                }}
            >
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            </div>
        </section>
    );
}