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
            <div className="absolute inset-0 bg-s0/90" />

            {rect ? (
                <div
                    className="pointer-events-none absolute rounded-inset border-2 border-a-violet shadow-[0_0_0_9999px_rgba(4,4,10,0.8)] transition-all duration-300"
                    style={{
                        top: rect.top - 8,
                        left: rect.left - 8,
                        width: rect.width + 16,
                        height: rect.height + 16,
                    }}
                />
            ) : null}

            <div
                className="absolute w-[320px] max-w-[calc(100vw-2rem)] rounded-card border border-rim bg-s2 p-6"
                style={tooltipStyle}
                role="dialog"
                aria-modal="true"
                aria-label={step.title}
            >
                <p className="font-mono text-label text-a-violet">
                    STEP {stepIndex + 1} OF {steps.length}
                </p>
                <h3 className="mt-3 font-display text-h2 text-t1">{step.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-t2">{step.body}</p>

                <div className="mt-6 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                        disabled={stepIndex === 0}
                        className="rounded-inset border border-rim bg-s3 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-t2 disabled:opacity-50 transition-fast hover:bg-s2 hover:text-t1"
                    >
                        Previous
                    </button>

                    {stepIndex < steps.length - 1 ? (
                        <button
                            type="button"
                            onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}
                            className="rounded-inset bg-a-violet px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-s0 transition-fast hover:bg-a-violet/90"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onComplete}
                            className="rounded-inset bg-a-green px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-s0 transition-fast hover:bg-a-green/90"
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
