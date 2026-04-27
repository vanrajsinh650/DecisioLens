import { NextResponse } from "next/server";

const HEALTH_TIMEOUT_MS = 5_000;

function getBackendBase(): string {
    const base = process.env.BACKEND_API_BASE;
    if (!base) {
        throw new Error("BACKEND_API_BASE is required");
    }
    return base.replace(/\/+$/, "");
}

export async function GET() {
    let base: string;
    try {
        base = getBackendBase();
    } catch (error) {
        return NextResponse.json(
            {
                status: "unavailable",
                detail: error instanceof Error ? error.message : "Backend config missing",
            },
            { status: 503 },
        );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    try {
        const response = await fetch(`${base}/health`, {
            cache: "no-store",
            signal: controller.signal,
        });

        if (!response.ok) {
            return NextResponse.json({ status: "unavailable" }, { status: 503 });
        }

        return NextResponse.json({ status: "ok" });
    } catch {
        return NextResponse.json({ status: "unavailable" }, { status: 503 });
    } finally {
        clearTimeout(timer);
    }
}