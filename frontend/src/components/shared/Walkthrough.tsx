"use client";

import { useEffect, useMemo, useState } from "react";

export interface WalkthroughStep {
    targetId: string;
    title: string;
    body: string;
    position: "top" | "bottom" | "left" | "right";
}

interface WalkthroughProps {
    steps: WalkthroughStep[];
    onComplete: () => void;
}

interface RectSnapshot {
    top: number;
    left: number;
    width: number;
    height: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function getStepRect(step: WalkthroughStep | undefined): RectSnapshot | null {
    if (!step || typeof window === "undefined") {
        return null;
    }

    const element = document.getElementById(step.targetId);
    if (!element) {
        return null;
    }

    const rect = element.getBoundingClientRect();
    return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    };
}

export function Walkthrough({ steps, onComplete }: WalkthroughProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [rect, setRect] = useState<RectSnapshot | null>(null);

    const step = steps[stepIndex];

    useEffect(() => {
        const update = () => {
            setRect(getStepRect(step));
        };

        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [step]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onComplete();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onComplete]);

    const tooltipStyle = useMemo(() => {
        if (!rect || !step || typeof window === "undefined") {
            return {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            };
        }

        const gap = 14;
        const tooltipWidth = 320;
        const tooltipHeight = 180;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (step.position === "top") {
            const top = clamp(rect.top - tooltipHeight - gap, 16, viewportHeight - tooltipHeight - 16);
            const left = clamp(rect.left + rect.width / 2 - tooltipWidth / 2, 16, viewportWidth - tooltipWidth - 16);
            return { top, left, transform: "none" };
        }

        if (step.position === "left") {
            const top = clamp(rect.top + rect.height / 2 - tooltipHeight / 2, 16, viewportHeight - tooltipHeight - 16);
            const left = clamp(rect.left - tooltipWidth - gap, 16, viewportWidth - tooltipWidth - 16);
            return { top, left, transform: "none" };
        }

        if (step.position === "right") {
            const top = clamp(rect.top + rect.height / 2 - tooltipHeight / 2, 16, viewportHeight - tooltipHeight - 16);
            const left = clamp(rect.left + rect.width + gap, 16, viewportWidth - tooltipWidth - 16);
            return { top, left, transform: "none" };
        }

        const top = clamp(rect.top + rect.height + gap, 16, viewportHeight - tooltipHeight - 16);
        const left = clamp(rect.left + rect.width / 2 - tooltipWidth / 2, 16, viewportWidth - tooltipWidth - 16);
        return { top, left, transform: "none" };
    }, [rect, step]);

    if (!step) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999]">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

            {rect ? (
                <div
                    className="pointer-events-none absolute rounded-xl border-2 border-signal-info shadow-[0_0_0_9999px_rgba(0,0,0,0.58)] transition-all duration-300"
                    style={{
                        top: rect.top - 8,
                        left: rect.left - 8,
                        width: rect.width + 16,
                        height: rect.height + 16,
                    }}
                />
            ) : null}

            <div
                className="absolute w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-ink-500/80 bg-ink-800/95 p-4 shadow-lift"
                style={tooltipStyle}
                role="dialog"
                aria-modal="true"
                aria-label={step.title}
            >
                <p className="text-xs font-semibold uppercase tracking-wide text-signal-info">
                    Step {stepIndex + 1} of {steps.length}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink-50">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-100">{step.body}</p>

                <div className="mt-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                        disabled={stepIndex === 0}
                        className="rounded-lg border border-ink-500 bg-ink-700/70 px-3 py-1.5 text-xs font-semibold text-ink-100 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    {stepIndex < steps.length - 1 ? (
                        <button
                            type="button"
                            onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}
                            className="rounded-lg border border-signal-info/40 bg-signal-infoSoft/60 px-3 py-1.5 text-xs font-semibold text-signal-info"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onComplete}
                            className="rounded-lg border border-signal-stable/40 bg-signal-stableSoft/50 px-3 py-1.5 text-xs font-semibold text-signal-stable"
                        >
                            Finish
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Walkthrough;
