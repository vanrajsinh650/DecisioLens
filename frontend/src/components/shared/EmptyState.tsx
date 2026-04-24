import Link from "next/link";

interface EmptyStateProps {
    title: string;
    description: string;
    ctaLabel?: string;
    ctaHref?: string;
}

export default function EmptyState({ title, description, ctaLabel, ctaHref }: EmptyStateProps) {
    return (
        <div
            style={{
                display: "flex",
                minHeight: "40vh",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
            }}
        >
            <h2
                className="font-body"
                style={{
                    fontSize: "var(--fs-h1)",
                    fontWeight: 600,
                    color: "var(--t1)",
                }}
            >
                {title}
            </h2>
            <p
                className="font-body"
                style={{
                    marginTop: "12px",
                    maxWidth: "480px",
                    fontSize: "var(--fs-body)",
                    lineHeight: 1.8,
                    color: "var(--t2)",
                }}
            >
                {description}
            </p>
            {ctaLabel && ctaHref && (
                <Link
                    href={ctaHref}
                    style={{
                        marginTop: "32px",
                        background: "var(--aurora-violet)",
                        color: "#fff",
                        padding: "13px 30px",
                        borderRadius: "6px",
                        border: "none",
                        fontFamily: '"Inter", sans-serif',
                        fontSize: "var(--fs-body)",
                        fontWeight: 600,
                        transition: "all 0.15s ease",
                    }}
                >
                    {ctaLabel}
                </Link>
            )}
        </div>
    );
}
