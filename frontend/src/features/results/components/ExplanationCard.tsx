import Card from "@/components/shared/Card";
import CopyButton from "@/components/shared/CopyButton";

interface ExplanationCardProps {
    explanation: string;
}

export default function ExplanationCard({ explanation }: ExplanationCardProps) {
    return (
        <Card
            title="Structured Explanation"
            subtitle="Narrative output with copy shortcut"
            rightSlot={<CopyButton value={explanation} label="Copy Explanation" />}
        >
            <pre className="whitespace-pre-wrap rounded-xl border border-ink-600/70 bg-ink-900/60 p-4 text-sm leading-relaxed text-ink-100">
                {explanation}
            </pre>
        </Card>
    );
}
