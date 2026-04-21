import Card from "@/components/shared/Card";
import CopyButton from "@/components/shared/CopyButton";

interface ExplanationCardProps {
    explanation: string;
}

interface ExplanationSections {
    summary: string;
    keyDrivers: string[];
    recommendation: string;
}

const normalizeLine = (line: string): string => line.trim();

function parseExplanationSections(rawExplanation: string): ExplanationSections {
    const lines = rawExplanation.split("\n").map(normalizeLine).filter(Boolean);

    const findIndex = (prefix: string) =>
        lines.findIndex((line) => line.toLowerCase().startsWith(prefix.toLowerCase()));

    const summaryIndex = findIndex("summary:");
    const keyReasonIndex = findIndex("key reason:");
    const recommendationIndex = findIndex("recommendation:");

    const summary =
        summaryIndex >= 0
            ? lines[summaryIndex].replace(/^summary:\s*/i, "")
            : lines[0] ?? "No summary available.";

    const keyDriverCandidates = lines
        .slice(keyReasonIndex >= 0 ? keyReasonIndex + 1 : 1, recommendationIndex >= 0 ? recommendationIndex : lines.length)
        .filter((line) => line.startsWith("-") || line.startsWith("•"))
        .map((line) => line.replace(/^[-•]\s*/, ""));

    const keyDrivers = keyDriverCandidates.length > 0 ? keyDriverCandidates : ["No key drivers provided."];

    const recommendation =
        recommendationIndex >= 0
            ? lines.slice(recommendationIndex + 1).join(" ") || "No recommendation provided."
            : "No recommendation provided.";

    return {
        summary,
        keyDrivers,
        recommendation,
    };
}

export default function ExplanationCard({ explanation }: ExplanationCardProps) {
    const parsed = parseExplanationSections(explanation);

    return (
        <Card
            title="Section 6 — Explanation Card"
            subtitle="Human-readable blocks for summary, key drivers, and recommendation"
            rightSlot={<CopyButton value={explanation} label="Copy Explanation" />}
        >
            <div className="space-y-4">
                <div className="rounded-xl border border-ink-600/70 bg-ink-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Summary</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-100">{parsed.summary}</p>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Key Drivers</p>
                    <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink-100">
                        {parsed.keyDrivers.map((driver) => (
                            <li key={driver} className="flex gap-2">
                                <span className="text-signal-info">•</span>
                                <span>{driver}</span>
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
