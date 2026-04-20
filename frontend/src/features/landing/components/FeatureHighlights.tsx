import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";

const DIFFERENTIATORS = [
    {
        title: "Threshold sensitivity",
        description:
            "Shows exactly where ACCEPT flips to REJECT across multiple thresholds so the decision boundary is visible.",
    },
    {
        title: "Scenario variation testing",
        description:
            "Runs controlled changes like gender, location, and college to reveal fragile or suspicious behavior.",
    },
];

const CREDIBILITY_SIGNALS = [
    "Decision snapshot cards with labeled metrics",
    "Reason tags for fast evidence review",
    "AI jury split into Auditor / Challenger / Judge",
    "Structured explanation and appeal blocks instead of random AI text",
];

export default function FeatureHighlights() {
    return (
        <section className="grid gap-4 lg:grid-cols-2">
            <Card title="What makes DecisioLens unique" subtitle="The two features judges remember">
                <div className="space-y-3">
                    {DIFFERENTIATORS.map((item) => (
                        <div key={item.title} className="rounded-xl border border-ink-600/70 bg-ink-700/40 p-4">
                            <Badge label="Feature Spotlight" tone="info" />
                            <h3 className="mt-3 font-display text-lg font-semibold text-ink-50">{item.title}</h3>
                            <p className="mt-2 text-sm text-ink-200">{item.description}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Why the result feels credible" subtitle="Structured output beats vague AI narration">
                <ul className="grid gap-3 sm:grid-cols-2">
                    {CREDIBILITY_SIGNALS.map((signal) => (
                        <li
                            key={signal}
                            className="rounded-xl border border-ink-600/70 bg-ink-700/40 px-3 py-3 text-sm text-ink-100"
                        >
                            {signal}
                        </li>
                    ))}
                </ul>
            </Card>
        </section>
    );
}