"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";
import EmptyState from "@/components/shared/EmptyState";
import TrustTimeline from "@/features/history/components/TrustTimeline";
import { useAuditHistory } from "@/hooks/useAuditHistory";
import { DOMAIN_OPTIONS } from "@/lib/constants";
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
        <div className="space-y-6">
            <SectionHeader
                eyebrow="Audit History"
                title="Past trust audits"
                description="Review previous audits and monitor risk score trends over time."
                actions={
                    <button
                        type="button"
                        onClick={clear}
                        className="rounded-lg border border-signal-risk/40 bg-signal-riskSoft/30 px-3 py-2 text-xs font-semibold text-signal-risk"
                    >
                        Clear History
                    </button>
                }
            />

            <div className="grid gap-3 rounded-2xl border border-ink-600/70 bg-ink-800/70 p-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-200">
                    Domain
                    <select
                        value={domainFilter}
                        onChange={(event) => setDomainFilter(event.target.value as DomainType | "all")}
                        className="rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm normal-case text-ink-50"
                    >
                        <option value="all">All Domains</option>
                        {DOMAIN_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-200">
                    Time Range
                    <select
                        value={timeRange}
                        onChange={(event) => setTimeRange(event.target.value as TimeRangeFilter)}
                        className="rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm normal-case text-ink-50"
                    >
                        {TIME_RANGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
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
                <div className="overflow-x-auto rounded-2xl border border-ink-600/70">
                    <table className="min-w-full divide-y divide-ink-600/70 text-sm">
                        <thead className="bg-ink-700/60 text-left text-xs uppercase tracking-wide text-ink-200">
                            <tr>
                                <th className="px-3 py-2">Profile</th>
                                <th className="px-3 py-2">Domain</th>
                                <th className="px-3 py-2">Trust Verdict</th>
                                <th className="px-3 py-2">Risk</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-700/70 bg-ink-900/35">
                            {filteredHistory.map((entry) => (
                                <tr key={entry.id}>
                                    <td className="px-3 py-2 text-ink-100">{String(entry.request.profile.name ?? "Unknown")}</td>
                                    <td className="px-3 py-2">
                                        <Badge label={entry.domain} tone="info" />
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge label={entry.trustVerdict} tone={verdictTone(entry.trustVerdict)} dot />
                                    </td>
                                    <td className="px-3 py-2 text-ink-100">
                                        {Math.round(entry.response.insights.risk_score)}/100
                                    </td>
                                    <td className="px-3 py-2 text-ink-200">
                                        {new Date(entry.submittedAt).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2">
                                        <button
                                            type="button"
                                            onClick={() => openHistoryResult(entry)}
                                            className="rounded-lg border border-signal-info/45 bg-signal-infoSoft/35 px-3 py-1.5 text-xs font-semibold text-signal-info"
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
