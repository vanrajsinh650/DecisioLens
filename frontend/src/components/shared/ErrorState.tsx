interface ErrorStateProps {
    title: string;
    message: string;
    nextStep?: string;
    onRetry?: () => void;
}

export default function ErrorState({ title, message, nextStep, onRetry }: ErrorStateProps) {
    return (
        <div
            style={{
                background: "var(--aurora-crimson-surface)",
                borderLeft: "3px solid var(--aurora-crimson)",
                borderRadius: "10px",
                padding: "24px",
            }}
        >
            <p
                className="font-body uppercase"
                style={{
                    fontSize: "var(--fs-label)",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--aurora-crimson)",
                }}
            >
                ERROR
            </p>
            <h3
                className="font-body"
                style={{
                    marginTop: "8px",
                    fontSize: "var(--fs-h2)",
                    fontWeight: 600,
                    color: "var(--t1)",
                }}
            >
                {title}
            </h3>
            <p
                className="font-mono"
                style={{
                    marginTop: "8px",
                    fontSize: "var(--fs-mono)",
                    color: "var(--t2)",
                }}
            >
                {message}
            </p>
            {nextStep && (
                <p
                    className="font-body"
                    style={{
                        marginTop: "8px",
                        fontSize: "0.875rem",
                        color: "var(--t2)",
                    }}
                >
                    {nextStep}
                </p>
            )}
            {onRetry && (
                <button
                    type="button"
                    onClick={() => onRetry()}
                    style={{
                        marginTop: "24px",
                        background: "var(--aurora-violet)",
                        color: "#fff",
                        padding: "13px 30px",
                        borderRadius: "6px",
                        border: "none",
                        fontFamily: '"Inter", sans-serif',
                        fontSize: "var(--fs-body)",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                    }}
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
