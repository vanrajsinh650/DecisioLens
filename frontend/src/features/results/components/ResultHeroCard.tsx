import SectionHeader from "@/components/layout/SectionHeader";

interface ResultHeroCardProps {
    onRerun: () => void;
    onClear: () => void;
}

export default function ResultHeroCard({ onRerun, onClear }: ResultHeroCardProps) {
    return (
        <div className="rounded-2xl border border-ink-600/70 bg-ink-800/80 p-5 shadow-card backdrop-blur-sm">
            <SectionHeader
                eyebrow="Results Summary"
                title="This page shows where decisions flip"
                description="Review threshold sensitivity, scenario variations, and explanation-ready appeal output."
                actions={
                    <>
                        <button
                            type="button"
                            onClick={onRerun}
                            className="rounded-lg border border-signal-info/45 bg-signal-infoSoft/70 px-3 py-2 text-xs font-semibold text-signal-info transition hover:bg-signal-infoSoft/90"
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
        </div>
    );
}
