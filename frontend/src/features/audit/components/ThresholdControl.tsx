import { formatNumber, formatThreshold } from "@/lib/format";

interface ThresholdControlProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

export default function ThresholdControl({
    value,
    onChange,
    disabled = false,
}: ThresholdControlProps) {
    const boundaryPoints = formatNumber(value * 100, 2);
    const normalizedThreshold = formatThreshold(value);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                background: "var(--s2)",
                border: "1px solid var(--rim)",
                borderRadius: "10px",
                padding: "24px",
            }}
        >
            <p
                className="font-mono uppercase"
                style={{
                    margin: 0,
                    fontSize: "var(--fs-micro)",
                    letterSpacing: "0.08em",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <span style={{ color: "var(--aurora-crimson)" }}>REJECT</span>
                <span style={{ color: "var(--t3)" }}>·</span>
                <span style={{ color: "var(--aurora-teal)" }}>BORDERLINE</span>
                <span style={{ color: "var(--t3)" }}>·</span>
                <span style={{ color: "var(--aurora-green)" }}>ACCEPT</span>
            </p>

            <div style={{ position: "relative", paddingInline: "4px" }}>
                <input
                    id="threshold-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    disabled={disabled}
                    title="Set Strictness Level"
                    aria-label="Set strictness level"
                    aria-valuemin={0}
                    aria-valuemax={1}
                    aria-valuenow={value}
                    aria-valuetext={`${normalizedThreshold} normalized threshold`}
                    style={{
                        width: "100%",
                        cursor: disabled ? "not-allowed" : "pointer",
                    }}
                />
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span
                    className="font-mono"
                    style={{
                        fontSize: "1.75rem",
                        fontWeight: 600,
                        color: "var(--t1)",
                    }}
                >
                    {boundaryPoints}
                </span>
                <span
                    className="font-mono"
                    style={{
                        fontSize: "var(--fs-micro)",
                        color: "var(--t3)",
                        letterSpacing: "0.04em",
                    }}
                >
                    Boundary score · {normalizedThreshold} normalized
                </span>
            </div>
        </div>
    );
}
