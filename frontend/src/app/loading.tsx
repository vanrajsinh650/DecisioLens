export default function Loading() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            gap: "16px"
        }}>
            <div className="dl-pulse-dot" style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "var(--aurora-amber)",
                boxShadow: "0 0 16px var(--aurora-amber)",
            }} />
            <p className="font-mono uppercase" style={{
                fontSize: "var(--fs-micro)",
                letterSpacing: "0.15em",
                color: "var(--t3)"
            }}>
                Loading Engine...
            </p>
        </div>
    );
}
