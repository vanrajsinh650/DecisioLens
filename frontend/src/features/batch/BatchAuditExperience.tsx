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
import { formatNumber } from "@/lib/format";
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

    const progressPercent = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <SectionHeader
                overline="BATCH ANALYSIS"
                title="Batch Processing"
                subtitle="Upload profiles via CSV, run sequential checks, and export outcomes."
                actions={
                    <button
                        type="button"
                        onClick={downloadTemplate}
                        className="dl-btn-ghost"
                    >
                        Download Template
                    </button>
                }
            />

            <div
                className="dl-card"
                style={{
                    display: "grid",
                    gap: "16px",
                    gridTemplateColumns: "1fr",
                    padding: "24px",
                }}
            >
                <div className="sm:[grid-template-columns:220px_1fr]" style={{ display: "grid", gap: "16px", alignItems: "end" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span
                            className="font-mono uppercase"
                            style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}
                        >
                            Decision Type
                        </span>
                        <select
                            value={domain}
                            onChange={(event) => setDomain(event.target.value as DomainType)}
                            className="dl-select"
                        >
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
                            Upload CSV
                        </span>
                        <input
                            type="file"
                            accept=".csv,text/csv,.txt,.pdf,.doc,.docx"
                            onChange={onFileChange}
                            className="dl-input"
                            style={{ padding: "8px" }}
                        />
                    </label>
                </div>
            </div>

            {error ? <ErrorState title="Batch processing error" message={error} /> : null}

            {isRunning ? (
                <LoadingState
                    compact
                    label="Running batch audit"
                    description={`Processed ${progress.processed} of ${progress.total} profiles.`}
                />
            ) : null}

            <div className="dl-card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
                    <p
                        className="font-mono uppercase"
                        style={{ margin: 0, fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}
                    >
                        Progress
                    </p>
                    <p
                        className="font-mono"
                        style={{ margin: 0, fontSize: "var(--fs-micro)", color: "var(--t2)" }}
                    >
                        {progress.processed}/{progress.total}
                    </p>
                </div>
                <div style={{ height: "3px", width: "100%", overflow: "hidden", borderRadius: "2px", background: "var(--s3)" }}>
                    <div
                        style={{
                            height: "100%",
                            borderRadius: "2px",
                            background: "var(--aurora-violet)",
                            transition: "width 0.3s ease",
                            width: `${progressPercent}%`,
                        }}
                    />
                </div>
            </div>

            {previewRows.length > 0 ? (
                <div style={{ overflowX: "auto", border: "1px solid var(--rim)", borderRadius: "10px" }}>
                    <table style={{ minWidth: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                        <thead style={{ background: "var(--s2)" }}>
                            <tr>
                                {Object.keys(previewRows[0]).map((header) => (
                                    <th
                                        key={header}
                                        className="font-mono uppercase"
                                        style={{ padding: "12px 16px", textAlign: "left", fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {previewRows.map((row, index) => (
                                <tr key={`preview-${index}`} style={{ borderTop: "1px solid var(--rim)" }}>
                                    {Object.entries(row).map(([key, value]) => (
                                        <td key={`${index}-${key}`} className="font-mono" style={{ padding: "12px 16px", fontSize: "var(--fs-mono)", color: "var(--t2)" }}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState title="No CSV preview" description="Upload a CSV file to preview first rows." />
            )}

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                <button
                    type="button"
                    onClick={() => {
                        void runBatch();
                    }}
                    disabled={isRunning || rows.length === 0}
                    className="dl-btn-primary"
                >
                    Analyze All Profiles
                </button>

                <button
                    type="button"
                    onClick={downloadResults}
                    disabled={exportRows.length === 0}
                    className="dl-btn-ghost"
                    style={{ opacity: exportRows.length === 0 ? 0.4 : 1 }}
                >
                    Export Results CSV
                </button>
            </div>

            {results.length > 0 ? (
                <div style={{ overflowX: "auto", border: "1px solid var(--rim)", borderRadius: "10px" }}>
                    <table style={{ minWidth: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                        <thead style={{ background: "var(--s2)" }}>
                            <tr>
                                <th className="font-mono uppercase" style={{ padding: "12px 16px", textAlign: "left", fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}>Row</th>
                                <th className="font-mono uppercase" style={{ padding: "12px 16px", textAlign: "left", fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}>Trust Verdict</th>
                                <th className="font-mono uppercase" style={{ padding: "12px 16px", textAlign: "left", fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}>Risk</th>
                                <th className="font-mono uppercase" style={{ padding: "12px 16px", textAlign: "left", fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}>Decision</th>
                                <th className="font-mono uppercase" style={{ padding: "12px 16px", textAlign: "left", fontSize: "var(--fs-micro)", letterSpacing: "0.08em", color: "var(--t3)" }}>Bias</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result) => (
                                <tr key={`result-${result.index}`} style={{ borderTop: "1px solid var(--rim)" }}>
                                    <td className="font-mono" style={{ padding: "12px 16px", fontSize: "var(--fs-mono)", color: "var(--t2)" }}>{result.index}</td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <Badge
                                            label={result.verdict}
                                            tone={result.verdict === "HIGH_RISK" ? "risk" : result.verdict === "UNSTABLE" ? "caution" : "stable"}
                                            dot
                                        />
                                    </td>
                                    <td className="font-mono" style={{ padding: "12px 16px", fontSize: "var(--fs-mono)", color: "var(--t2)" }}>{result.risk_level} ({formatNumber(result.risk_score, 0)})</td>
                                    <td className="font-mono" style={{ padding: "12px 16px", fontSize: "var(--fs-mono)", color: "var(--t2)" }}>{result.decision}</td>
                                    <td className="font-mono" style={{ padding: "12px 16px", fontSize: "var(--fs-mono)", color: "var(--t2)" }}>{result.bias_detected ? "Yes" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}
