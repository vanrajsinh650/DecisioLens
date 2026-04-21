import Card from "@/components/shared/Card";
import CopyButton from "@/components/shared/CopyButton";

interface AppealCardProps {
    appeal: string;
}

interface AppealSections {
    subject: string;
    greeting: string;
    body: string[];
    request: string;
    closing: string[];
}

const cleanLine = (line: string): string => line.trim();

function parseAppealSections(rawAppeal: string): AppealSections {
    const lines = rawAppeal.split("\n").map(cleanLine).filter(Boolean);

    const subjectIndex = lines.findIndex((line) => /^subject:/i.test(line));
    const greetingIndex = lines.findIndex((line) => /^dear\b/i.test(line));
    const closingIndex = lines.findIndex((line) => /^(thank you|sincerely|regards|best regards)/i.test(line));

    const subject =
        subjectIndex >= 0
            ? lines[subjectIndex].replace(/^subject:\s*/i, "")
            : "Request for manual review";

    const greeting =
        greetingIndex >= 0
            ? lines[greetingIndex]
            : "Dear Review Committee,";

    const bodyStart = greetingIndex >= 0 ? greetingIndex + 1 : 0;
    const bodyEnd = closingIndex >= 0 ? closingIndex : lines.length;
    const body = lines.slice(bodyStart, bodyEnd).filter((line) => !/^subject:/i.test(line));

    const request =
        body.find((line) => /(request|reassess|review)/i.test(line))
        ?? "I request a fair manual reassessment of this decision.";

    const closing = closingIndex >= 0 ? lines.slice(closingIndex) : ["Thank you for your time and consideration."];

    return {
        subject,
        greeting,
        body: body.length > 0 ? body : ["No appeal details provided."],
        request,
        closing,
    };
}

export default function AppealCard({ appeal }: AppealCardProps) {
    const parsed = parseAppealSections(appeal);

    return (
        <Card
            title="Pass 2 — Appeal"
            subtitle="Action layer with ready-to-copy review request text"
            rightSlot={<CopyButton value={appeal} label="Copy Appeal" copiedLabel="Appeal Copied" />}
        >
            <div className="space-y-4">
                <div className="rounded-xl border border-ink-600/70 bg-ink-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Subject</p>
                    <p className="mt-2 text-sm font-semibold text-ink-50">{parsed.subject}</p>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Opening</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-100">{parsed.greeting}</p>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Body</p>
                    <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-100">
                        {parsed.body.map((paragraph, index) => (
                            <p key={`${paragraph}-${index}`}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-signal-info/30 bg-signal-infoSoft/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-signal-info">Core Request</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-50">{parsed.request}</p>
                </div>

                <div className="rounded-xl border border-ink-600/70 bg-ink-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-200">Closing</p>
                    <div className="mt-2 space-y-1 text-sm leading-relaxed text-ink-100">
                        {parsed.closing.map((line, index) => (
                            <p key={`${line}-${index}`}>{line}</p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    className="rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-3 py-2 text-xs font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
                >
                    Use in Review Request
                </button>
            </div>
        </Card>
    );
}
