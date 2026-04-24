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
        <div className="space-y-8">
            <SectionHeader
                overline="BATCH AUDIT"
                title="Batch Processing"
                subtitle="Upload profiles via CSV, run sequential trust checks, and export outcomes."
                actions={
                    <button
                        type="button"
                        onClick={downloadTemplate}
                        className="rounded-panel border border-rim bg-depth-3/60 px-3 py-2 font-mono text-micro uppercase tracking-wider text-txt-secondary transition hover:border-probe/30 hover:text-txt-primary"
                    >
                        Download Template
                    </button>
                }
            />

            <div className="grid gap-4 rounded-panel border border-rim bg-depth-2/60 p-6 sm:grid-cols-[220px_1fr] sm:items-end">
                <label className="flex flex-col gap-2 font-mono text-micro uppercase tracking-wider text-txt-ghost">
                    Domain
                    <select
                        value={domain}
                        onChange={(event) => setDomain(event.target.value as DomainType)}
                        className="rounded-none border border-rim bg-depth-2 px-3 py-2 font-mono text-mono-base normal-case text-txt-primary outline-none focus:border-probe"
                    >
                        {DOMAIN_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-2 font-mono text-micro uppercase tracking-wider text-txt-ghost">
                    Upload CSV
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={onFileChange}
                        className="rounded-none border border-rim bg-depth-2 px-3 py-2 font-mono text-mono-base normal-case text-txt-primary file:mr-3 file:rounded-panel file:border file:border-probe/30 file:bg-probe/8 file:px-3 file:py-1 file:font-mono file:text-micro file:text-probe"
                    />
                </label>
            </div>

            {error ? <ErrorState title="Batch processing error" message={error} /> : null}

            {isRunning ? (
                <LoadingState
                    compact
                    label="Running batch audit"
                    description={`Processed ${progress.processed} of ${progress.total} profiles.`}
                />
            ) : null}

            <div className="rounded-panel border border-rim bg-depth-2/60 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-mono text-micro uppercase tracking-wider text-txt-ghost">Progress</p>
                    <p className="font-mono text-micro text-txt-secondary">{progress.processed}/{progress.total}</p>
                </div>
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-depth-3">
                    <div
                        className="h-full rounded-full bg-probe transition-all duration-300"
                        style={{ width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%` }}
                    />
                </div>
            </div>

            {previewRows.length > 0 ? (
                <div className="overflow-x-auto rounded-panel border border-rim">
                    <table className="min-w-full divide-y divide-rim text-sm">
                        <thead className="bg-depth-3/60">
                            <tr>
                                {Object.keys(previewRows[0]).map((header) => (
                                    <th key={header} className="px-4 py-3 text-left font-mono text-micro uppercase tracking-wider text-txt-ghost">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rim/50">
                            {previewRows.map((row, index) => (
                                <tr key={`preview-${index}`}>
                                    {Object.entries(row).map(([key, value]) => (
                                        <td key={`${index}-${key}`} className="px-4 py-3 font-mono text-mono-base text-txt-secondary">{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState title="No CSV preview" description="Upload a CSV file to preview first rows." />
            )}

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={() => {
                        void runBatch();
                    }}
                    disabled={isRunning || rows.length === 0}
                    className="rounded-panel border border-probe/40 bg-probe px-4 py-2.5 font-mono text-micro uppercase tracking-widest text-depth-1 transition-all hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Run Batch Audit
                </button>

                <button
                    type="button"
                    onClick={downloadResults}
                    disabled={exportRows.length === 0}
                    className="rounded-panel border border-rim bg-depth-3/60 px-4 py-2.5 font-mono text-micro uppercase tracking-wider text-txt-secondary transition hover:border-probe/30 hover:text-txt-primary disabled:opacity-40"
                >
                    Export Results CSV
                </button>
            </div>

            {results.length > 0 ? (
                <div className="overflow-x-auto rounded-panel border border-rim">
                    <table className="min-w-full divide-y divide-rim text-sm">
                        <thead className="bg-depth-3/60">
                            <tr>
                                <th className="px-4 py-3 text-left font-mono text-micro uppercase tracking-wider text-txt-ghost">Row</th>
                                <th className="px-4 py-3 text-left font-mono text-micro uppercase tracking-wider text-txt-ghost">Trust Verdict</th>
                                <th className="px-4 py-3 text-left font-mono text-micro uppercase tracking-wider text-txt-ghost">Risk</th>
                                <th className="px-4 py-3 text-left font-mono text-micro uppercase tracking-wider text-txt-ghost">Decision</th>
                                <th className="px-4 py-3 text-left font-mono text-micro uppercase tracking-wider text-txt-ghost">Bias</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rim/50">
                            {results.map((result) => (
                                <tr key={`result-${result.index}`}>
                                    <td className="px-4 py-3 font-mono text-mono-base text-txt-secondary">{result.index}</td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            label={result.verdict}
                                            tone={result.verdict === "HIGH_RISK" ? "risk" : result.verdict === "UNSTABLE" ? "caution" : "stable"}
                                            dot
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-mono text-mono-base text-txt-secondary">{result.risk_level} ({Math.round(result.risk_score)})</td>
                                    <td className="px-4 py-3 font-mono text-mono-base text-txt-secondary">{result.decision}</td>
                                    <td className="px-4 py-3 font-mono text-mono-base text-txt-secondary">{result.bias_detected ? "Yes" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}
