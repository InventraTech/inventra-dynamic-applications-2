import type {
    AIChatResponse,
    AIConversationHistoryResponse,
    AIConversationMessagesResponse,
    AIEndChatResponse,
    AIMessageView,
    AIStreamEvent,
} from "../../types/ai";
import { getSession } from "../authSession";
import { ApiError } from "../../utils/apiError";
import { requestAI, requestAIRaw, responseAIError } from "./client";

export interface AIChatRequest {
    sessionId: string;
    question: string;
    userId: string;
    requestId: string;
}

export type AIStreamListener = (event: AIStreamEvent) => void;

function normalizeResponse(value: AIChatResponse): AIChatResponse {
    return {
        resposta: value.resposta ?? "",
        artifacts: Array.isArray(value.artifacts) ? value.artifacts : [],
        pending_actions: Array.isArray(value.pending_actions) ? value.pending_actions : [],
        transcricao: value.transcricao,
    };
}

async function sendSynchronousMessage(request: AIChatRequest, signal?: AbortSignal): Promise<AIChatResponse> {
    return normalizeResponse(await requestAI<AIChatResponse>("chat", {
        method: "POST",
        signal,
        body: JSON.stringify({
            session_id: request.sessionId,
            pergunta: request.question,
            user_id: request.userId,
            request_id: request.requestId,
        }),
    }));
}

function parseStreamEvent(line: string): AIStreamEvent | null {
    if (!line.trim()) return null;
    let parsed: unknown;
    try { parsed = JSON.parse(line) as unknown; }
    catch { throw new ApiError("O assistente enviou um evento de conversa inválido.", 0); }
    if (!parsed || typeof parsed !== "object" || typeof (parsed as Record<string, unknown>).type !== "string") return null;
    return parsed as AIStreamEvent;
}

function collectEvent(
    event: AIStreamEvent,
    listener: AIStreamListener,
    response: AIChatResponse,
    state: { completed: boolean },
): void {
    if (event.type === "pensamento") return;
    if (event.type === "etapa") {
        listener({ type: "etapa", id: event.id, status: event.status, texto: event.texto });
    } else {
        listener(event);
    }
    switch (event.type) {
        case "texto": response.resposta += event.delta; break;
        case "artefato": response.artifacts.push(event.artifact); break;
        case "cartao":
            response.pending_actions.push({ ...event.pending_action, id: event.approval_id });
            break;
        case "erro": throw new ApiError(event.mensagem || "Não foi possível concluir a resposta.", 0);
        case "fim": state.completed = true; break;
        default: break;
    }
}

async function fallbackBeforeStream(request: AIChatRequest, signal?: AbortSignal): Promise<AIChatResponse> {
    return sendSynchronousMessage(request, signal);
}

export async function sendAIMessage(
    request: AIChatRequest,
    listener: AIStreamListener,
    signal?: AbortSignal,
): Promise<AIChatResponse> {
    let streamOpened = false;
    try {
        const response = await requestAIRaw("chat/stream", {
            method: "POST",
            signal,
            headers: { Accept: "application/x-ndjson, application/json" },
            body: JSON.stringify({
                session_id: request.sessionId,
                pergunta: request.question,
                user_id: request.userId,
                request_id: request.requestId,
            }),
        });
        streamOpened = true;

        if (!response.ok) {
            if ([404, 405, 501].includes(response.status)) return fallbackBeforeStream(request, signal);
            throw await responseAIError(response);
        }

        const contentType = response.headers.get("content-type")?.toLocaleLowerCase("en-US") ?? "";
        if (contentType.includes("application/json")) {
            const synchronousResponse = await response.json() as AIChatResponse;
            return normalizeResponse(synchronousResponse);
        }
        if (!response.body) return fallbackBeforeStream(request, signal);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let remaining = "";
        const accumulated: AIChatResponse = { resposta: "", artifacts: [], pending_actions: [] };
        const streamState = { completed: false };
        let receivedBytes = false;
        let receivedEvent = false;

        const processLine = (line: string) => {
            const event = parseStreamEvent(line);
            if (!event) return;
            receivedEvent = true;
            collectEvent(event, listener, accumulated, streamState);
        };

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value.byteLength > 0) receivedBytes = true;
                remaining += decoder.decode(value, { stream: true });
                const lines = remaining.split("\n");
                remaining = lines.pop() ?? "";
                lines.forEach(processLine);
            }
            remaining += decoder.decode();
            if (remaining.trim()) processLine(remaining);
        } catch (error) {
            if (!receivedBytes && !(error instanceof DOMException && error.name === "AbortError")) {
                return fallbackBeforeStream(request, signal);
            }
            throw error;
        } finally {
            reader.releaseLock();
        }

        if (!receivedEvent && !receivedBytes) return fallbackBeforeStream(request, signal);
        if (!receivedEvent) throw new ApiError("O assistente encerrou a resposta antes de enviar conteúdo.", 0);
        if (!streamState.completed) throw new ApiError("A resposta do assistente foi interrompida antes de terminar.", 0);
        return accumulated;
    } catch (error) {
        if (!streamOpened && error instanceof ApiError && error.status === 0 && !(signal?.aborted)) {
            return fallbackBeforeStream(request, signal);
        }
        if (error instanceof ApiError || (error instanceof DOMException && error.name === "AbortError")) throw error;
        throw new ApiError("Não foi possível concluir a conversa com a IA.", 0);
    }
}

export async function sendAIAudio(
    audio: Blob,
    fileName: string,
    sessionId: string,
    userId: string,
    requestId: string,
    signal?: AbortSignal,
): Promise<AIChatResponse> {
    const form = new FormData();
    form.append("audio", audio, fileName);
    form.append("session_id", sessionId);
    form.append("user_id", userId);
    form.append("request_id", requestId);
    return normalizeResponse(await requestAI<AIChatResponse>("chat/audio", { method: "POST", body: form, signal }));
}

export async function getAIConversationHistory(
    search = "",
    signal?: AbortSignal,
): Promise<AIConversationHistoryResponse> {
    const userId = getSession()?.user.id;
    if (!userId) throw new ApiError("Sua sessão expirou. Entre novamente para continuar.", 401);
    const query = new URLSearchParams({ limite: "100" });
    if (search.trim()) query.set("busca", search.trim().slice(0, 200));
    return requestAI<AIConversationHistoryResponse>(`chat/historico/${encodeURIComponent(userId)}?${query.toString()}`, { signal });
}

export async function getAIConversationMessages(docId: string, signal?: AbortSignal): Promise<AIConversationMessagesResponse> {
    return requestAI<AIConversationMessagesResponse>(`chat/mensagens/${encodeURIComponent(docId)}`, { signal });
}

export async function endAIConversation(sessionId: string): Promise<AIEndChatResponse | null> {
    try {
        return await requestAI<AIEndChatResponse>("chat/encerrar", { method: "POST", body: JSON.stringify({ session_id: sessionId }) });
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export function normalizeStoredMessages(messages: AIConversationMessagesResponse["messages"]): AIMessageView[] {
    const occurrences = new Map<string, number>();
    return messages.map((message) => {
        const role = message.role === "human" ? "human" : "assistant";
        let hash = 2166136261;
        for (let index = 0; index < message.content.length; index += 1) {
            hash ^= message.content.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        const fingerprint = `${role}-${(hash >>> 0).toString(36)}`;
        const occurrence = occurrences.get(fingerprint) ?? 0;
        occurrences.set(fingerprint, occurrence + 1);
        return {
            id: `historico-${fingerprint}-${occurrence}`,
            role,
            content: message.content,
            steps: message.passos?.map((step) => ({ id: step.id, status: step.status, texto: step.texto })),
            artifacts: message.artifacts,
        };
    });
}
