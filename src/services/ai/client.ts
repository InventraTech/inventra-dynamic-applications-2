import { clearSession, getSession, SESSION_EXPIRED_EVENT } from "../authSession";
import { ApiError } from "../../utils/apiError";

const AI_PROXY_BASE = "/ia";

interface AIRequestOptions extends RequestInit {
    authenticated?: boolean;
}

function normalizePath(path: string): string {
    return `${AI_PROXY_BASE}/${path.replace(/^\/+/, "")}`;
}

function getErrorMessage(body: unknown, fallback: string): string {
    if (typeof body === "string" && body.trim()) return body;
    if (!body || typeof body !== "object") return fallback;

    const record = body as Record<string, unknown>;
    const detail = record.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail)) {
        const messages = detail.flatMap((item: unknown) => {
            if (!item || typeof item !== "object") return [];
            const message = (item as Record<string, unknown>).msg;
            return typeof message === "string" && message.trim() ? [message] : [];
        });
        if (messages.length) return messages.join(" ");
    }
    for (const key of ["message", "title"]) {
        const message = record[key];
        if (typeof message === "string" && message.trim()) return message;
    }
    return fallback;
}

export async function requestAIRaw(path: string, options: AIRequestOptions = {}): Promise<Response> {
    const { authenticated = true, headers: requestHeaders, ...requestOptions } = options;
    const headers = new Headers(requestHeaders);
    headers.set("Accept", headers.get("Accept") ?? "application/json");

    if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (authenticated) {
        const session = getSession();
        if (!session?.token) throw new ApiError("Sua sessão expirou. Entre novamente para continuar.", 401);
        headers.set("Authorization", `Bearer ${session.token}`);
    }

    try {
        const response = await fetch(normalizePath(path), { ...requestOptions, headers });
        if (authenticated && response.status === 401) {
            clearSession();
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        return response;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        throw new ApiError("Não foi possível conectar ao assistente. Verifique a conexão e tente novamente.", 0);
    }
}

export async function responseAIError(response: Response): Promise<ApiError> {
    const responseText = await response.text().catch(() => "");
    let body: unknown = responseText;
    if (responseText) {
        try { body = JSON.parse(responseText) as unknown; }
        catch { body = responseText; }
    }
    return new ApiError(getErrorMessage(body, `A solicitação ao assistente falhou (${response.status}).`), response.status);
}

export async function requestAI<T>(path: string, options: AIRequestOptions = {}): Promise<T> {
    try {
        const response = await requestAIRaw(path, options);
        if (!response.ok) throw await responseAIError(response);
        if (response.status === 204) return undefined as T;

        const responseText = await response.text();
        if (!responseText) return undefined as T;
        try { return JSON.parse(responseText) as T; }
        catch { throw new ApiError("O assistente retornou uma resposta em formato inesperado.", response.status); }
    } catch (error) {
        if (error instanceof ApiError || (error instanceof DOMException && error.name === "AbortError")) throw error;
        throw new ApiError("Não foi possível processar a resposta do assistente. Tente novamente.", 0);
    }
}
