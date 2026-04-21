"use client";

import { useCallback, useEffect, useState } from "react";

import { getThemePreference, setThemePreference } from "@/lib/storage";
import { ThemePreference } from "@/types/audit";

export function useTheme() {
    const [theme, setTheme] = useState<ThemePreference>("dark");

    useEffect(() => {
        const saved = getThemePreference();
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
    }, []);

    const toggle = useCallback(() => {
        setTheme((current) => {
            const next: ThemePreference = current === "dark" ? "light" : "dark";
            setThemePreference(next);
            document.documentElement.setAttribute("data-theme", next);
            return next;
        });
    }, []);

    return { theme, toggle };
}
