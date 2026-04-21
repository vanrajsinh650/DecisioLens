interface SubmitAuditButtonProps {
    isLoading: boolean;
    isDisabled?: boolean;
    onSubmit: () => void;
}

export default function SubmitAuditButton({ isLoading, isDisabled = false, onSubmit }: SubmitAuditButtonProps) {
    const disabled = isLoading || isDisabled;

    return (
        <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-4 py-2 text-sm font-semibold text-signal-info transition hover:bg-signal-infoSoft/90 disabled:cursor-wait disabled:opacity-70"
        >
            {isLoading ? "Running audit..." : "Run Audit"}
        </button>
    );
}
