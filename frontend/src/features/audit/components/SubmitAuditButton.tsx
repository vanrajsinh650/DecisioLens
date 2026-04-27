interface SubmitAuditButtonProps {
    isLoading: boolean;
    disabled: boolean;
}

export default function SubmitAuditButton({ isLoading, disabled }: SubmitAuditButtonProps) {
    const inactive = isLoading || disabled;

    return (
        <button
            id="btn-submit-audit"
            type="submit"
            disabled={inactive}
            className="dl-btn-primary"
            style={{
                marginTop: "24px",
                width: "100%",
                background: inactive ? "var(--s3)" : "var(--aurora-violet)",
                color: inactive ? "var(--t2)" : "#fff",
                opacity: inactive ? 0.5 : 1,
            }}
        >
            {isLoading ? "Testing..." : "Test This Decision →"}
        </button>
    );
}
