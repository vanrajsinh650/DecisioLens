import { HumanReview } from "@/types/audit";

interface HumanReviewCardProps {
    humanReview: HumanReview;
}

const CONFIG = {
    REQUIRED: {
        label: "🚨 A Human Should Check This",
        color: "var(--aurora-crimson)",
        surface: "var(--aurora-crimson-surface)",
        border: "hsl(350, 68%, 24%)",
        icon: "⚠",
    },
    RECOMMENDED: {
        label: "A real person should look at this",
        color: "var(--aurora-amber)",
        surface: "var(--aurora-amber-surface)",
        border: "hsl(35, 70%, 24%)",
        icon: "◆",
    },
    NOT_REQUIRED: {
        label: "✅ No Human Review Needed",
        color: "var(--aurora-green)",
        surface: "var(--aurora-green-surface)",
        border: "hsl(145, 65%, 24%)",
        icon: "✓",
    },
} as const;

export default function HumanReviewCard({ humanReview }: HumanReviewCardProps) {
    const level = humanReview.level in CONFIG ? humanReview.level : "NOT_REQUIRED";
    const cfg = CONFIG[level as keyof typeof CONFIG];

    return (
        <div
            className="dl-reveal"
            style={{
                background: cfg.surface,
                border: `1px solid ${cfg.border}`,
                borderLeft: `4px solid ${cfg.color}`,
                borderRadius: "8px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
            }}
        >
            {/* Icon */}
            <span
                className="font-mono"
                style={{
                    fontSize: "1.25rem",
                    color: cfg.color,
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: "2px",
                }}
            >
                {cfg.icon}
            </span>

            <div style={{ flex: 1 }}>
                {/* Label */}
                <p
                    className="font-body uppercase"
                    style={{
                        fontSize: "var(--fs-label)",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: cfg.color,
                        marginBottom: "8px",
                    }}
                >
                    {cfg.label}
                </p>

                {/* Reason */}
                <p
                    className="font-body"
                    style={{
                        fontSize: "var(--fs-body)",
                        color: "var(--t2)",
                        lineHeight: 1.6,
                    }}
                >
                    {humanReview.reason}
                </p>
            </div>
        </div>
    );
}
