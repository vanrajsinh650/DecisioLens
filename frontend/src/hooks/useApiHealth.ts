"use client";

import { useEffect, useState } from "react";

export type ApiHealthStatus = "checking" | "online" | "unavailable";

export function useApiHealth(): ApiHealthStatus {
    const [status, setStatus] = useState<ApiHealthStatus>("checking");

    useEffect(() => {
        let active = true;

        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 5_000);

        fetch("/api/health", {
            cache: "no-store",
            signal: controller.signal,
        })
            .then((response) => {
                if (active) setStatus(response.ok ? "online" : "unavailable");
            })
            .catch(() => {
                if (active) setStatus("unavailable");
            })
            .finally(() => window.clearTimeout(timer));

        return () => {
            active = false;
            window.clearTimeout(timer);
            controller.abort();
        };
    }, []);

    return status;
}