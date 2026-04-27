import StatPill from "@/components/shared/StatPill";
import { formatRiskScore, normalizeRiskTone, formatReasonTag } from "@/lib/format";
import { Insights } from "@/types/audit";

interface RiskInsightCardProps {
    insights: Insights;
    reasonTags: string[];
}

function getTagAccentColor(tag: string): string {
    if (tag.includes("bias")) return "var(--aurora-crimson)";
    if (tag.includes("instability") || tag.includes("threshold")) return "var(--aurora-teal)";
    if (tag.includes("sensitive")) return "var(--aurora-amber)";
    return "var(--aurora-violet)";
}

export default function RiskInsightCard({ insights, reasonTags }: RiskInsightCardProps) {
    const riskTone = normalizeRiskTone(insights.risk_score);
    const instabilityDetected = insights.instability || reasonTags.includes("profile_instability");
    const biasDetected = insights.bias_detected || reasonTags.includes("bias_detected");

    const tags = reasonTags.length > 0 ? reasonTags : ["none"];

    return (
        <div className="dl-reveal">
            {/* Overline */}
            <p
                className="font-body uppercase"
                style={{
                    fontSize: "var(--fs-label)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--t1)",
                    marginBottom: "24px",
                }}
            >
                HOW RISKY IS THIS?
            </p>

            {/* Four StatPill blocks in a row with fuel gauge bars */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "16px",
                }}
            >
                <StatPill
                    label="OVERALL RISK"
                    value={formatRiskScore(insights.risk_score)}
                    tone={riskTone}
                    emphasize
                    gaugeValue={insights.risk_score}
                />
                <StatPill
                    label="DOES IT STAY THE SAME?"
                    value={instabilityDetected ? "CHANGES EASILY" : "STAYS THE SAME"}
                    tone={instabilityDetected ? "warn" : "safe"}
                    gaugeValue={instabilityDetected ? 75 : 15}
                />
                <StatPill
                    label="IS IT FAIR?"
                    value={biasDetected ? "UNFAIRNESS FOUND" : "LOOKS FAIR"}
                    tone={biasDetected ? "risk" : "safe"}
                    gaugeValue={biasDetected ? 85 : 10}
                />
                <StatPill
                    label="RISK LEVEL"
                    value={insights.risk_level ?? "MODERATE"}
                    tone="neutral"
                    gaugeValue={50}
                />
            </div>

            {/* Risk reason tag cloud */}
            <div
                style={{
                    marginTop: "24px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                }}
            >
                {tags.map((tag) => {
                    const accentColor = getTagAccentColor(tag);
                    return (
                        <span
                            key={tag}
                            className="font-mono"
                            style={{
                                fontSize: "var(--fs-micro)",
                                color: accentColor,
                                background: "var(--s2)",
                                border: "1px solid var(--rim)",
                                borderRadius: "100px",
                                padding: "5px 14px",
                                letterSpacing: "0.03em",
                            }}
                        >
                            {formatReasonTag(tag)}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
