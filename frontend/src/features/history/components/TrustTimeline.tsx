import { useMemo } from "react";

import { TrustVerdict } from "@/types/audit";

interface TrustTimelinePoint {
    date: string;
    risk_score: number;
    verdict: TrustVerdict;
}

interface TrustTimelineProps {
    points: TrustTimelinePoint[];
}

const CHART_WIDTH = 800;
const CHART_HEIGHT = 280;
const MARGIN = { top: 20, right: 28, bottom: 96, left: 64 };
const X_AXIS_Y = CHART_HEIGHT - MARGIN.bottom;
const X_TICK_LABEL_Y = X_AXIS_Y + 30;

const verdictColor: Record<TrustVerdict, string> = {
    STABLE: "hsl(145, 65%, 52%)",
    UNSTABLE: "hsl(38, 82%, 55%)",
    HIGH_RISK: "hsl(350, 68%, 52%)",
};

function clampRisk(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.min(100, value));
}

function formatAxisDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

export default function TrustTimeline({ points }: TrustTimelineProps) {
    const chart = useMemo(() => {
        const innerWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
        const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

        if (points.length === 0) {
            return {
                polyline: "",
                plotted: [] as Array<{ x: number; y: number; point: TrustTimelinePoint; index: number }>,
                ticksX: [] as Array<{ x: number; label: string }>,
                ticksY: [0, 25, 50, 75, 100].map((value) => ({
                    y: MARGIN.top + innerHeight - (value / 100) * innerHeight,
                    value,
                })),
                innerWidth,
                innerHeight,
            };
        }

        const plotted = points.map((point, index) => {
            const x = MARGIN.left + (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
            const y = MARGIN.top + innerHeight - (clampRisk(point.risk_score) / 100) * innerHeight;
            return { x, y, point, index };
        });

        const polyline = plotted.map((item) => `${item.x},${item.y}`).join(" ");

        const ticksX = plotted
            .filter((_, index) => {
                if (points.length <= 6) return true;
                const bucket = Math.ceil(points.length / 6);
                return index % bucket === 0 || index === points.length - 1;
            })
            .map((item) => ({
                x: item.x,
                label: formatAxisDate(item.point.date),
            }));

        const ticksY = [0, 25, 50, 75, 100].map((value) => ({
            y: MARGIN.top + innerHeight - (value / 100) * innerHeight,
            value,
        }));

        return {
            polyline,
            plotted,
            ticksX,
            ticksY,
            innerWidth,
            innerHeight,
        };
    }, [points]);

    return (
        <div
            className="dl-card"
            style={{ padding: "16px" }}
        >
            <div className="trust-timeline-header">
                <div>
                    <h3
                        className="font-display"
                        style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--t1)" }}
                    >
                        Risk Score Timeline
                    </h3>
                    <div className="trust-timeline-legend" style={{ marginTop: "8px" }}>
                        <div className="trust-timeline-legend-item">
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: verdictColor.STABLE }} />
                            <span className="font-mono trust-timeline-legend-label" style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--t2)", letterSpacing: "0.05em" }}>Looks Fair</span>
                        </div>
                        <div className="trust-timeline-legend-item">
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: verdictColor.UNSTABLE }} />
                            <span className="font-mono trust-timeline-legend-label" style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--t2)", letterSpacing: "0.05em" }}>Close Call</span>
                        </div>
                        <div className="trust-timeline-legend-item">
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: verdictColor.HIGH_RISK }} />
                            <span className="font-mono trust-timeline-legend-label" style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--t2)", letterSpacing: "0.05em" }}>Possible Unfairness</span>
                        </div>
                    </div>
                </div>
            </div>

            {points.length === 0 ? (
                <p className="font-body" style={{ fontSize: "0.875rem", color: "var(--t2)" }}>
                    No history points to plot yet.
                </p>
            ) : (
                <div style={{ width: "100%", overflowX: "auto", paddingBottom: "4px" }}>
                    <svg
                        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                        width="100%"
                        role="img"
                        aria-label="Risk score timeline"
                        style={{ display: "block", minWidth: "560px" }}
                    >
                        {chart.ticksY.map((tick) => (
                            <g key={tick.value}>
                                <line
                                    x1={MARGIN.left}
                                    y1={tick.y}
                                    x2={CHART_WIDTH - MARGIN.right}
                                    y2={tick.y}
                                    stroke="hsl(230, 10%, 22%)"
                                    strokeWidth="1"
                                />
                                <text x={MARGIN.left - 10} y={tick.y + 4} textAnchor="end" fontSize="11" fill="hsl(230, 10%, 48%)" fontFamily="var(--ff-mono)">
                                    {tick.value}
                                </text>
                            </g>
                        ))}

                        {chart.ticksX.map((tick, index) => (
                            <g key={`${tick.label}-${index}`}>
                                <line
                                    x1={tick.x}
                                    y1={X_AXIS_Y}
                                    x2={tick.x}
                                    y2={X_AXIS_Y + 6}
                                    stroke="hsl(230, 10%, 30%)"
                                    strokeWidth="1"
                                />
                                <text
                                    x={tick.x}
                                    y={X_TICK_LABEL_Y}
                                    textAnchor="end"
                                    fontSize="10"
                                    fill="hsl(230, 10%, 48%)"
                                    fontFamily="var(--ff-mono)"
                                    transform={`rotate(-45, ${tick.x}, ${X_TICK_LABEL_Y})`}
                                >
                                    {tick.label}
                                </text>
                            </g>
                        ))}

                        <polyline
                            points={chart.polyline}
                            fill="none"
                            stroke="hsl(265, 65%, 60%)"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />

                        {chart.plotted.map((item) => (
                            <circle
                                key={`${item.point.date}-${item.index}`}
                                cx={item.x}
                                cy={item.y}
                                r={4.5}
                                fill={verdictColor[item.point.verdict]}
                                stroke="#03030A"
                                strokeWidth="1.5"
                            >
                                <title>
                                    {new Date(item.point.date).toLocaleString()} · Risk {Math.round(clampRisk(item.point.risk_score))}/100 · {item.point.verdict}
                                </title>
                            </circle>
                        ))}
                    </svg>
                </div>
            )}
        </div>
    );
}
