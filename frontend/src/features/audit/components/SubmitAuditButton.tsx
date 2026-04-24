interface SubmitAuditButtonProps {
    isLoading: boolean;
    disabled: boolean;
}

export default function SubmitAuditButton({ isLoading, disabled }: SubmitAuditButtonProps) {
    return (
        <button
            type="submit"
            disabled={isLoading || disabled}
            style={{
                marginTop: "24px",
                width: "100%",
                background: isLoading || disabled ? "var(--s3)" : "var(--aurora-violet)",
                color: isLoading || disabled ? "var(--t2)" : "#fff",
                padding: "13px 30px",
                borderRadius: "6px",
                border: "none",
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: "var(--fs-body)",
                fontWeight: 600,
                cursor: isLoading || disabled ? "not-allowed" : "pointer",
                opacity: isLoading || disabled ? 0.5 : 1,
                transition: "all 0.15s ease",
            }}
        >
            {isLoading ? "Running Scan..." : "Analyze a Decision →"}
        </button>
    );
}
