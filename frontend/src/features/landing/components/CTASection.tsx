import Link from "next/link";

import Card from "@/components/shared/Card";

export default function CTASection() {
    return (
        <Card
            title="Test if an AI decision is fair and stable before trusting it."
            subtitle="Enter a candidate profile, set a threshold, and get a full trust report in seconds."
        >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                <Link
                    href="/audit"
                    className="dl-btn-primary"
                    style={{ textDecoration: "none" }}
                >
                    Analyze a Decision →
                </Link>
            </div>
        </Card>
    );
}