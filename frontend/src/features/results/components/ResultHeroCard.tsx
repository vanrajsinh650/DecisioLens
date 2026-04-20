import SectionHeader from "@/components/layout/SectionHeader";

interface ResultHeroCardProps {
    onRerun: () => void;
    onClear: () => void;
}

export default function ResultHeroCard({ onRerun, onClear }: ResultHeroCardProps) {
    return (
        <SectionHeader
            eyebrow="Structured Evidence Review"
            title="Audit results: instability, bias, and action"
            description="Clear labels, measurable signals, and appeal-ready outputs designed for confident demo walkthroughs."
            actions={
                <>
                    <button
                        type="button"
                        onClick={onRerun}
                        className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/25"
                    >
                        Re-run at +0.02 threshold
                    </button>
                    <button
                        type="button"
                        onClick={onClear}
                        className="rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-2 text-xs font-semibold text-ink-100 transition hover:border-ink-300"
                    >
                        Clear Result
                    </button>
                </>
            }
        />
    );
}
