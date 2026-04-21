import Card from "@/components/shared/Card";
import CopyButton from "@/components/shared/CopyButton";
import Badge from "@/components/shared/Badge";
import { normalizeRiskTone } from "@/lib/format";

interface ExplanationCardProps {
    explanation: string;
}

interface ExplanationSections {
    summary: string;
    reasons: string[];
    recommendation: string;
    risk: string;
}

const normalizeLine = (line: string): string => line.trim();

function parseExplanationSections(rawExplanation: string): ExplanationSections {
    const lines = rawExplanation.split("\n").map(normalizeLine).filter(Boolean);

    const findIndex = (prefixes: string[]) =>
        lines.findIndex((line) => prefixes.some((prefix) => line.toLowerCase().startsWith(prefix.toLowerCase())));

    const summaryIndex = findIndex(["summary:"]);
    const reasonsIndex = findIndex(["key reason:", "key reasons:", "reasons:"]);
    const riskIndex = findIndex(["risk:"]);
    const recommendationIndex = findIndex(["recommendation:"]);

    const summary =
        summaryIndex >= 0
            ? lines[summaryIndex].replace(/^summary:\s*/i, "")
            : lines[0] ?? "No summary available.";

    const sectionBoundaries = [riskIndex, recommendationIndex]
        .filter((index): index is number => index >= 0)
        .sort((left, right) => left - right);
    const reasonsEndIndex = sectionBoundaries[0] ?? lines.length;

    const reasonCandidates = lines
        .slice(
            reasonsIndex >= 0 ? reasonsIndex + 1 : summaryIndex >= 0 ? summaryIndex + 1 : 1,
            reasonsEndIndex,
        )
        .map((line) => line.replace(/^[-•]\s*/, ""))
        .filter(Boolean);

    const inlineReason =
        reasonsIndex >= 0
            ? lines[reasonsIndex]
                .replace(/^key reasons?:\s*/i, "")
                .replace(/^reasons:\s*/i, "")
                .trim()
            : "";

    const reasons = reasonCandidates.length > 0
        ? reasonCandidates
        : inlineReason
            ? [inlineReason]
            : ["No key reasons provided."];

    const risk =
        riskIndex >= 0
            ? lines[riskIndex].replace(/^risk:\s*/i, "") || "Not specified."
            : "Not specified.";

    const recommendation =
        recommendationIndex >= 0
            ? [
                lines[recommendationIndex].replace(/^recommendation:\s*/i, "").trim(),
                lines.slice(recommendationIndex + 1).join(" "),
            ].filter(Boolean).join(" ") || "No recommendation provided."
            : "No recommendation provided.";

    return {
        summary,
        reasons,
        recommendation,
        risk,
    };
}

function resolveRiskTone(riskText: string): "stable" | "caution" | "risk" {
    const normalized = riskText.toLowerCase();
    if (normalized.includes("low")) return "stable";
    if (normalized.includes("high")) return "risk";
    return normalizeRiskTone(riskText);
}

export default function ExplanationCard({ explanation }: ExplanationCardProps) {
    const parsed = parseExplanationSections(explanation);
    const riskTone = resolveRiskTone(parsed.risk);

    return (
        <Card
            title="Pass 2 — Explanation"
            subtitle="Structured explanation with summary, reasons, and recommendation"
            rightSlot={<CopyButton value={explanation} label="Copy Explanation" copiedLabel="Explanation Copied" />}
        >
            <div className="space-y-4">
                <div className="rounded-xl border border-ink-600/70 bg-ink-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Summary</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-100">{parsed.summary}</p>

                    <div className="mt-3">
                        <Badge label={`Risk: ${parsed.risk}`} tone={riskTone} dot />
                    </div>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Reasons</p>
                    <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink-100">
                        {parsed.reasons.map((reason, index) => (
                            <li key={`${reason}-${index}`} className="flex gap-2">
                                <span className="text-signal-info">•</span>
                                <span>{reason}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Recommendation</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-100">{parsed.recommendation}</p>
                </div>
            </div>
        </Card>
    );
}
