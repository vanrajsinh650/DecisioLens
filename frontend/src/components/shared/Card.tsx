import { ReactNode } from "react";

interface CardProps {
    title?: string;
    subtitle?: string;
    rightSlot?: ReactNode;
    className?: string;
    children: ReactNode;
}

export default function Card({ title, subtitle, rightSlot, className = "", children }: CardProps) {
    return (
        <section className={`dl-card ${className}`}>
            {(title || subtitle || rightSlot) && (
                <header
                    style={{
                        marginBottom: "24px",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "16px",
                    }}
                >
                    <div>
                        {title && (
                            <h3
                                className="font-body uppercase"
                                style={{
                                    fontSize: "var(--fs-label)",
                                    fontWeight: 600,
                                    letterSpacing: "0.12em",
                                    color: "var(--t1)",
                                }}
                            >
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p
                                className="font-body"
                                style={{
                                    marginTop: "4px",
                                    fontSize: "0.875rem",
                                    color: "var(--t2)",
                                }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {rightSlot ? <div>{rightSlot}</div> : null}
                </header>
            )}
            {children}
        </section>
    );
}
