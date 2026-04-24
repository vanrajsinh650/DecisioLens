"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";
import EmptyState from "@/components/shared/EmptyState";
import TrustTimeline from "@/features/history/components/TrustTimeline";
import { useAuditHistory } from "@/hooks/useAuditHistory";
import { DOMAIN_OPTIONS } from "@/lib/constants";
import { formatDateTime, formatNumber } from "@/lib/format";
import { setSelectedHistoryAuditId } from "@/lib/storage";
import { DomainType, StoredAuditSession } from "@/types/audit";

type TimeRangeFilter = "7d" | "30d" | "all";

const TIME_RANGE_OPTIONS: Array<{ value: TimeRangeFilter; label: string }> = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "all", label: "All Time" },
];

function verdictTone(verdict: StoredAuditSession["trustVerdict"]): "stable" | "caution" | "risk" {
    if (verdict === "HIGH_RISK") return "risk";
    if (verdict === "UNSTABLE") return "caution";
    return "stable";
}

function isWithinRange(entry: StoredAuditSession, range: TimeRangeFilter): boolean {
    if (range === "all") {
        return true;
    }

    const now = Date.now();
    const createdAt = new Date(entry.submittedAt).getTime();
    const rangeInMs = range === "7d" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    return now - createdAt <= rangeInMs;
}

export default function HistoryPage() {
    const router = useRouter();
    const { history, clear } = useAuditHistory();

    const [domainFilter, setDomainFilter] = useState<DomainType | "all">("all");
    const [timeRange, setTimeRange] = useState<TimeRangeFilter>("30d");

    const filteredHistory = useMemo(() => {
        return history
            .filter((entry) => (domainFilter === "all" ? true : entry.domain === domainFilter))
            .filter((entry) => isWithinRange(entry, timeRange));
    }, [domainFilter, history, timeRange]);

    const openHistoryResult = (entry: StoredAuditSession) => {
        setSelectedHistoryAuditId(entry.id);
        router.push(`/results?id=${encodeURIComponent(entry.id)}`);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <SectionHeader
                overline="AUDIT HISTORY"
                title="Past Trust Audits"
                subtitle="Review previous audits and monitor risk score trends over time."
                actions={
                    <button
                        type="button"
                        onClick={clear}
                        className="dl-btn-ghost"
                        style={{
                            color: "var(--aurora-crimson)",
                            borderColor: "hsl(350, 68%, 30%)",
                            background: "var(--aurora-crimson-surface)",
                        }}
                    >
                        Clear History
                    </button>
                }
            />

            <div
                className="dl-card"
                style={{ padding: "16px" }}
            >
                <div
                    style={{
                        display: "grid",
                        gap: "12px",
                        gridTemplateColumns: "1fr",
                    }}
                    className="sm:[grid-template-columns:1fr_1fr]"
                >
                    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span
                            className="font-mono uppercase"
                            style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}
                        >
                            Domain
                        </span>
                        <select
                            value={domainFilter}
                            onChange={(event) => setDomainFilter(event.target.value as DomainType | "all")}
                            className="dl-select"
                        >
                            <option value="all">All Domains</option>
                            {DOMAIN_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span
                            className="font-mono uppercase"
                            style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}
                        >
                            Time Range
                        </span>
                        <select
                            value={timeRange}
                            onChange={(event) => setTimeRange(event.target.value as TimeRangeFilter)}
                            className="dl-select"
                        >
                            {TIME_RANGE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            <TrustTimeline
                points={filteredHistory
                    .slice()
                    .reverse()
                    .map((session) => ({
                        date: session.submittedAt,
                        risk_score: session.response.insights.risk_score,
                        verdict: session.trustVerdict,
                    }))}
            />

            {filteredHistory.length === 0 ? (
                <EmptyState
                    title="No history yet"
                    description="Run audits to build a timeline of trust and risk trends."
                    ctaLabel="Run an Audit"
                    ctaHref="/audit"
                />
            ) : (
                <div style={{ overflowX: "auto", border: "1px solid var(--rim)", borderRadius: "10px" }}>
                    <table style={{ minWidth: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                        <thead style={{ background: "var(--s2)" }}>
                            <tr>
                                {["Profile", "Domain", "Trust Verdict", "Risk", "Date", "Action"].map((h) => (
                                    <th
                                        key={h}
                                        className="font-mono uppercase"
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontSize: "var(--fs-micro)",
                                            letterSpacing: "0.08em",
                                            color: "var(--t3)",
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map((entry) => (
                                <tr key={entry.id} style={{ borderTop: "1px solid var(--rim)" }}>
                                    <td className="font-mono" style={{ padding: "12px", color: "var(--t1)", fontSize: "var(--fs-mono)" }}>
                                        {String(entry.request.profile.name ?? "Unknown")}
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        <Badge label={entry.domain} tone="info" />
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        <Badge label={entry.trustVerdict} tone={verdictTone(entry.trustVerdict)} dot />
                                    </td>
                                    <td className="font-mono" style={{ padding: "12px", color: "var(--t1)", fontSize: "var(--fs-mono)" }}>
                                        {formatNumber(entry.response.insights.risk_score, 0)}/100
                                    </td>
                                    <td className="font-mono" style={{ padding: "12px", color: "var(--t2)", fontSize: "var(--fs-micro)" }}>
                                        {formatDateTime(entry.submittedAt)}
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        <button
                                            type="button"
                                            onClick={() => openHistoryResult(entry)}
                                            className="dl-btn-ghost"
                                            style={{ padding: "6px 12px" }}
                                        >
                                            Open Result
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
