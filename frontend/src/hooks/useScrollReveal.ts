"use client";

import { useEffect, useRef } from "react";

/**
 * Custom hook for IntersectionObserver-based scroll reveal.
 * Adds "revealed" class when element enters viewport at threshold 0.15.
 * Supports staggered delays via data-stagger-delay attribute.
 */
export function useScrollReveal() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            // Reveal everything immediately
            const elements = container.querySelectorAll(".dl-reveal, .dl-reveal-card, .dl-gauge");
            elements.forEach((el) => el.classList.add("revealed"));
            return;
        }

        const staggerTimers: number[] = [];

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target as HTMLElement;
                        const delay = el.dataset.staggerDelay;
                        if (delay) {
                            const timer = window.setTimeout(() => {
                                if (el.isConnected) {
                                    el.classList.add("revealed");
                                }
                            }, parseFloat(delay) * 1000);
                            staggerTimers.push(timer);
                        } else {
                            el.classList.add("revealed");
                        }
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.15 }
        );

        const elements = container.querySelectorAll(".dl-reveal, .dl-reveal-card, .dl-gauge");
        elements.forEach((el) => observer.observe(el));

        return () => {
            staggerTimers.forEach((timer) => window.clearTimeout(timer));
            observer.disconnect();
        };
    }, []);

    return containerRef;
}
