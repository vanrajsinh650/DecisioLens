import { ReactNode } from "react";

interface SectionHeaderProps {
    overline?: string;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    // Legacy prop aliases
    eyebrow?: string;
    description?: string;
}

export default function SectionHeader({
    overline,
    title,
    subtitle,
    actions,
    eyebrow,
    description,
}: SectionHeaderProps) {
    const displayOverline = overline ?? eyebrow;
    const displaySubtitle = subtitle ?? description;

    return (
        <div
            style={{
                marginBottom: "32px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "24px",
            }}
        >
            <div style={{ maxWidth: "720px" }}>
                {displayOverline ? (
                    <p
                        className="font-mono uppercase"
                        style={{
                            marginBottom: "8px",
                            fontSize: "var(--fs-label)",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            color: "var(--aurora-violet)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span
                            aria-hidden="true"
                            className="dl-pulse-dot"
                            style={{
                                display: "inline-block",
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "var(--aurora-violet)",
                            }}
                        />
                        {displayOverline}
                    </p>
                ) : null}
                <h2
                    className="font-display"
                    style={{
                        fontSize: "var(--fs-h1)",
                        fontWeight: 800,
                        lineHeight: 1.2,
                        color: "var(--t1)",
                    }}
                >
                    {title}
                </h2>
                {displaySubtitle ? (
                    <p
                        className="font-body"
                        style={{
                            marginTop: "8px",
                            fontSize: "var(--fs-body)",
                            lineHeight: 1.75,
                            color: "var(--t2)",
                        }}
                    >
                        {displaySubtitle}
                    </p>
                ) : null}
            </div>
            {actions ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {actions}
                </div>
            ) : null}
        </div>
    );
}
