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
const CHART_HEIGHT = 220;
const MARGIN = { top: 20, right: 20, bottom: 48, left: 48 };

const verdictColor: Record<TrustVerdict, string> = {
    STABLE: "#22c55e",
    UNSTABLE: "#f59e0b",
    HIGH_RISK: "#ef4444",
};

function clampRisk(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.min(100, value));
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
                label: new Date(item.point.date).toLocaleDateString(),
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
        <div className="rounded-2xl border border-ink-600/70 bg-ink-800/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h3 className="font-display text-lg font-semibold text-ink-50">Trust Score Timeline</h3>
                    <p className="text-sm text-ink-200">Risk score trend over time, color-coded by trust verdict.</p>
                </div>
            </div>

            {points.length === 0 ? (
                <p className="text-sm text-ink-200">No history points to plot yet.</p>
            ) : (
                <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} width="100%" role="img" aria-label="Trust score timeline">
                    {chart.ticksY.map((tick) => (
                        <g key={tick.value}>
                            <line
                                x1={MARGIN.left}
                                y1={tick.y}
                                x2={CHART_WIDTH - MARGIN.right}
                                y2={tick.y}
                                stroke="rgba(138,146,168,0.2)"
                                strokeWidth="1"
                            />
                            <text x={MARGIN.left - 10} y={tick.y + 4} textAnchor="end" fontSize="11" fill="#8a92a8">
                                {tick.value}
                            </text>
                        </g>
                    ))}

                    {chart.ticksX.map((tick, index) => (
                        <g key={`${tick.label}-${index}`}>
                            <line
                                x1={tick.x}
                                y1={CHART_HEIGHT - MARGIN.bottom}
                                x2={tick.x}
                                y2={CHART_HEIGHT - MARGIN.bottom + 6}
                                stroke="rgba(138,146,168,0.45)"
                                strokeWidth="1"
                            />
                            <text
                                x={tick.x}
                                y={CHART_HEIGHT - MARGIN.bottom + 18}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#8a92a8"
                            >
                                {tick.label}
                            </text>
                        </g>
                    ))}

                    <polyline
                        points={chart.polyline}
                        fill="none"
                        stroke="#7c9cff"
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
                            stroke="#0b0e14"
                            strokeWidth="1.5"
                        >
                            <title>
                                {new Date(item.point.date).toLocaleString()} · Risk {Math.round(clampRisk(item.point.risk_score))}/100 · {item.point.verdict}
                            </title>
                        </circle>
                    ))}
                </svg>
            )}
        </div>
    );
}
