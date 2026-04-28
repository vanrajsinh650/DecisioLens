import { NextResponse } from "next/server";

// Extend Vercel serverless function timeout (default 10s → 60s)
// Required because AI audit calls typically take 15-30 seconds.
export const maxDuration = 60;

const REQUEST_TIMEOUT_MS = 8_000;   // Must be < Vercel's function limit
const MAX_PROXY_BODY_BYTES = 131_072;

function getBackendConfig(): { base: string; apiKey: string } {
    const base = process.env.BACKEND_API_BASE;
    const apiKey = process.env.AUDIT_API_KEY;

    if (!base) {
        throw new Error("BACKEND_API_BASE is required");
    }

    if (!apiKey) {
        throw new Error("AUDIT_API_KEY is required");
    }

    return { base: base.replace(/\/+$/, ""), apiKey };
}

function jsonError(status: number, detail: string) {
    return NextResponse.json(
        {
            error: status >= 500 ? "Proxy Error" : "Request Error",
            detail,
            status_code: status,
        },
        { status },
    );
}

export async function POST(request: Request) {
    const contentLength = request.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_PROXY_BODY_BYTES) {
        return jsonError(413, `Request body too large (max ${MAX_PROXY_BODY_BYTES} bytes)`);
    }

    let body: string;
    try {
        body = await request.text();
    } catch {
        return jsonError(400, "Could not read request body");
    }

    if (new TextEncoder().encode(body).length > MAX_PROXY_BODY_BYTES) {
        return jsonError(413, `Request body too large (max ${MAX_PROXY_BODY_BYTES} bytes)`);
    }

    let config: { base: string; apiKey: string };
    try {
        config = getBackendConfig();
    } catch (error) {
        return jsonError(500, error instanceof Error ? error.message : "Backend config missing");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const upstream = await fetch(`${config.base}/audit/run`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": config.apiKey,
            },
            body,
            cache: "no-store",
            signal: controller.signal,
        });

        const text = await upstream.text();
        const contentType = upstream.headers.get("content-type") ?? "application/json";

        return new NextResponse(text, {
            status: upstream.status,
            headers: {
                "Content-Type": contentType,
            },
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return jsonError(504, "Audit request timed out");
        }

        return jsonError(502, "Audit backend is unavailable");
    } finally {
        clearTimeout(timer);
    }
}