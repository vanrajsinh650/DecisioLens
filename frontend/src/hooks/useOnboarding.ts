"use client";

import { useCallback, useEffect, useState } from "react";

import { isOnboardingCompleted, setOnboardingCompleted } from "@/lib/storage";

export function useOnboarding() {
    const [showWalkthrough, setShowWalkthrough] = useState(false);

    useEffect(() => {
        const syncState = () => {
            setShowWalkthrough(!isOnboardingCompleted());
        };

        syncState();
        window.addEventListener("decisiolens:onboarding-change", syncState);

        return () => {
            window.removeEventListener("decisiolens:onboarding-change", syncState);
        };
    }, []);

    const completeOnboarding = useCallback(() => {
        setOnboardingCompleted(true);
        setShowWalkthrough(false);
    }, []);

    const resetOnboarding = useCallback(() => {
        setOnboardingCompleted(false);
        setShowWalkthrough(true);
    }, []);

    return { showWalkthrough, completeOnboarding, resetOnboarding };
}
