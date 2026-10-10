import { clearSession, getSession, SESSION_EXPIRED_EVENT } from "./authSession";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

export class ApiError extends Error {
    constructor(message: string, public readonly status: number) {
        super(message);
        this.name = "ApiError";
    }
}

type ApiRequestOptions = RequestInit & { authenticated?: boolean };

function getErrorMessage(body: unknown, fallback: string): string {
    if (typeof body === "string" && body.trim()) return body;
    if (body && typeof body === "object") {
        const data = body as Record<string, unknown>;
        for (const key of ["message", "detail", "title"]) {
            if (typeof data[key] === "string" && data[key]) return data[key];
        }
    }
    return fallback;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { authenticated = true, headers: requestHeaders, ...requestOptions } = options;
    const headers = new Headers(requestHeaders);
    headers.set("Accept", "application/json");

    if (requestOptions.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (authenticated) {
        const session = getSession();
        if (session) headers.set("Authorization", `Bearer ${session.token}`);
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
        ...requestOptions,
        headers,
    });

    const responseText = response.status === 204 ? "" : await response.text();
    let responseBody: unknown = undefined;
    if (responseText) {
        try {
            responseBody = JSON.parse(responseText) as unknown;
        } catch {
            responseBody = responseText;
        }
    }

    if (!response.ok) {
        if (authenticated && response.status === 401) {
            clearSession();
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        throw new ApiError(
            getErrorMessage(responseBody, `A solicitação falhou (${response.status}).`),
            response.status,
        );
    }

    return responseBody as T;
}
