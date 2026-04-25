import { AIJuryView } from "@/types/audit";

interface JuryPanelProps {
    jury: AIJuryView;
}

const JURY_ROLES = [
    {
        key: "auditor" as const,
        role: "Bias Check",
        accentColor: "var(--aurora-violet)",
    },
    {
        key: "challenger" as const,
        role: "Stability Check",
        accentColor: "var(--aurora-teal)",
    },
    {
        key: "judge" as const,
        role: "Final Assessment",
        accentColor: "var(--aurora-amber)",
    },
];

export default function JuryPanel({ jury }: JuryPanelProps) {
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
                WHAT OUR SYSTEM SAYS
            </p>

            {/* Three cards side by side */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "16px",
                }}
            >
                {JURY_ROLES.map(({ key, role, accentColor }) => (
                    <div
                        key={key}
                        className="dl-card dl-scenario-card"
                        style={{ padding: "20px" }}
                    >
                        {/* Role badge */}
                        <span
                            className="font-mono uppercase"
                            style={{
                                fontSize: "var(--fs-micro)",
                                letterSpacing: "0.08em",
                                color: accentColor,
                                padding: "4px 12px",
                                borderRadius: "100px",
                                border: "1px solid var(--rim)",
                                background: "var(--s2)",
                            }}
                        >
                            {role}
                        </span>

                        {/* Thin divider under badge */}
                        <div
                            style={{
                                marginTop: "12px",
                                marginBottom: "12px",
                                height: "1px",
                                background: "var(--rim)",
                            }}
                        />

                        {/* Perspective text structured, NOT dialogue */}
                        <p
                            className="font-body"
                            style={{
                                fontSize: "var(--fs-body)",
                                lineHeight: 1.8,
                                color: "var(--t2)",
                            }}
                        >
                            {jury[key]}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
