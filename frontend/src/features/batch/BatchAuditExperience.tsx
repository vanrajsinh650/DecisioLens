"use client";

import { ChangeEvent, useMemo, useState } from "react";

import SectionHeader from "@/components/layout/SectionHeader";
import Badge from "@/components/shared/Badge";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { runAudit } from "@/lib/api";
import { downloadCSV, parseCSV, recordsToCSV } from "@/lib/csv";
import { DOMAIN_OPTIONS } from "@/lib/constants";
import { getDomainConfig } from "@/lib/domains/registry";
import { AuditRequest, AuditResponse, DomainType, TrustVerdict } from "@/types/audit";

interface BatchResultRow {
    index: number;
    input: Record<string, string>;
    verdict: TrustVerdict;
    risk_level: string;
    decision: string;
    bias_detected: boolean;
    risk_score: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function deriveTrustVerdict(response: AuditResponse): TrustVerdict {
    const riskScore = response.insights.risk_score;
    if (riskScore >= 70) return "HIGH_RISK";
    if (riskScore >= 35) return "UNSTABLE";
    return "STABLE";
}

function toNumberMaybe(value: string): number | string {
    const trimmed = value.trim();
    if (trimmed.length === 0) return "";
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : value;
}

function buildTemplate(domain: DomainType): string {
    const config = getDomainConfig(domain);
    const headers = config.fields.map((field) => field.key);
    const exampleValues = headers.map((header) => String(config.defaultProfile[header] ?? ""));
    return `${headers.join(",")}\n${exampleValues.join(",")}`;
}

export default function BatchAuditExperience() {
    const [domain, setDomain] = useState<DomainType>("hiring");
    const [rows, setRows] = useState<Record<string, string>[]>([]);
    const [results, setResults] = useState<BatchResultRow[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState({ processed: 0, total: 0 });

    const previewRows = rows.slice(0, 5);

    const runBatch = async () => {
        if (rows.length === 0) {
            setError("Upload a CSV with at least one profile row.");
            return;
        }

        setIsRunning(true);
        setError(null);
        setResults([]);
        setProgress({ processed: 0, total: rows.length });

        const nextResults: BatchResultRow[] = [];

        try {
            for (let index = 0; index < rows.length; index += 1) {
                const row = rows[index];
                const payload: AuditRequest = {
                    domain,
                    threshold: getDomainConfig(domain).defaultThreshold,
                    profile: Object.fromEntries(
                        Object.entries(row).map(([key, value]) => [key, toNumberMaybe(value)]),
                    ),
                };

                const response = await runAudit(payload);
                nextResults.push({
                    index: index + 1,
                    input: row,
                    verdict: deriveTrustVerdict(response),
                    risk_level: response.insights.risk_level ?? "Unknown",
                    decision: response.original.decision,
                    bias_detected: response.insights.bias_detected,
                    risk_score: response.insights.risk_score,
                });

                setResults([...nextResults]);
                setProgress({ processed: index + 1, total: rows.length });

                await sleep(300);
            }
        } catch (batchError) {
            setError(batchError instanceof Error ? batchError.message : "Batch audit failed.");
        } finally {
            setIsRunning(false);
        }
    };

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const raw = typeof reader.result === "string" ? reader.result : "";
            const parsed = parseCSV(raw);
            setRows(parsed);
            setResults([]);
            setProgress({ processed: 0, total: parsed.length });
            setError(null);
        };
        reader.onerror = () => {
            setError("Could not read CSV file.");
        };
        reader.readAsText(file);
    };

    const exportRows = useMemo(() => {
        return results.map((result) => ({
            row: result.index,
            ...result.input,
            trust_verdict: result.verdict,
            risk_level: result.risk_level,
            risk_score: Math.round(result.risk_score),
            decision: result.decision,
            bias_detected: result.bias_detected ? "yes" : "no",
        }));
    }, [results]);

    const downloadTemplate = () => {
        downloadCSV(`decisiolens-${domain}-template.csv`, buildTemplate(domain));
    };

    const downloadResults = () => {
        if (exportRows.length === 0) return;
        downloadCSV(`decisiolens-${domain}-batch-results.csv`, recordsToCSV(exportRows));
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                eyebrow="Batch Audit"
                title="Run trust checks from CSV"
                description="Upload many profiles, process sequential audits, and export trust outcomes."
                actions={
                    <button
                        type="button"
                        onClick={downloadTemplate}
                        className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100"
                    >
                        Download CSV Template
                    </button>
                }
            />

            <div className="grid gap-3 rounded-2xl border border-ink-600/70 bg-ink-800/70 p-4 sm:grid-cols-[220px_1fr] sm:items-end">
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-200">
                    Domain
                    <select
                        value={domain}
                        onChange={(event) => setDomain(event.target.value as DomainType)}
                        className="rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm normal-case text-ink-50"
                    >
                        {DOMAIN_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-200">
                    Upload CSV
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={onFileChange}
                        className="rounded-lg border border-ink-600 bg-ink-700/60 px-3 py-2 text-sm normal-case text-ink-50"
                    />
                </label>
            </div>

            {error ? <ErrorState title="Batch processing error" message={error} /> : null}

            {isRunning ? (
                <LoadingState
                    label="Running batch audit..."
                    description={`Processed ${progress.processed} of ${progress.total} profiles.`}
                />
            ) : null}

            <div className="rounded-2xl border border-ink-600/70 bg-ink-800/70 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm text-ink-100">Progress</p>
                    <p className="text-xs text-ink-200">{progress.processed}/{progress.total}</p>
                </div>
                <progress max={Math.max(progress.total, 1)} value={progress.processed} className="h-2 w-full" />
            </div>

            {previewRows.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-ink-600/70">
                    <table className="min-w-full divide-y divide-ink-600/70 text-sm">
                        <thead className="bg-ink-700/60 text-left text-xs uppercase tracking-wide text-ink-200">
                            <tr>
                                {Object.keys(previewRows[0]).map((header) => (
                                    <th key={header} className="px-3 py-2">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-700/70 bg-ink-900/35">
                            {previewRows.map((row, index) => (
                                <tr key={`preview-${index}`}>
                                    {Object.entries(row).map(([key, value]) => (
                                        <td key={`${index}-${key}`} className="px-3 py-2 text-ink-100">{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState title="No CSV preview" description="Upload a CSV file to preview first rows." />
            )}

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        void runBatch();
                    }}
                    disabled={isRunning || rows.length === 0}
                    className="rounded-lg border border-signal-info/45 bg-signal-infoSoft/35 px-3 py-2 text-xs font-semibold text-signal-info disabled:opacity-60"
                >
                    Run Batch Audit
                </button>

                <button
                    type="button"
                    onClick={downloadResults}
                    disabled={exportRows.length === 0}
                    className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100 disabled:opacity-60"
                >
                    Download Results as CSV
                </button>
            </div>

            {results.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-ink-600/70">
                    <table className="min-w-full divide-y divide-ink-600/70 text-sm">
                        <thead className="bg-ink-700/60 text-left text-xs uppercase tracking-wide text-ink-200">
                            <tr>
                                <th className="px-3 py-2">Row</th>
                                <th className="px-3 py-2">Trust Verdict</th>
                                <th className="px-3 py-2">Risk</th>
                                <th className="px-3 py-2">Decision</th>
                                <th className="px-3 py-2">Bias Detected</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-700/70 bg-ink-900/35">
                            {results.map((result) => (
                                <tr key={`result-${result.index}`}>
                                    <td className="px-3 py-2 text-ink-100">{result.index}</td>
                                    <td className="px-3 py-2">
                                        <Badge
                                            label={result.verdict}
                                            tone={result.verdict === "HIGH_RISK" ? "risk" : result.verdict === "UNSTABLE" ? "caution" : "stable"}
                                            dot
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-ink-100">{result.risk_level} ({Math.round(result.risk_score)})</td>
                                    <td className="px-3 py-2 text-ink-100">{result.decision}</td>
                                    <td className="px-3 py-2 text-ink-100">{result.bias_detected ? "Yes" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}
