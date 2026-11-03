import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { useAuth } from "../context/auth";
import type {
    AIApproval,
    AIApprovalListResponse,
    AIChatResponse,
    AIConversationSummary,
    AIDocument,
    AIHealth,
    AIMessageView,
    AIPendingAction,
    AIStage,
    AIUploadResult,
} from "../types/ai";
import { ApiError } from "../utils/apiError";
import { getAIApproval, getAIApprovalInbox, getAIApprovals, decideAIApproval, executeAIApproval } from "../services/ai/approvals";
import { getAIHealth } from "../services/ai/health";
import {
    endAIConversation,
    getAIConversationHistory,
    getAIConversationMessages,
    normalizeStoredMessages,
    sendAIAudio,
    sendAIMessage,
    type AIChatRequest,
    type AIStreamListener,
} from "../services/ai/chat";
import { getAIDocuments, removeAIDocument, uploadAIDocuments } from "../services/ai/documents";
import { getAIAudioFileName, validateAIApprovalReason, validateAIDocumentSelection, validateAIQuestion } from "../utils/aiValidation";

type LoadState = "idle" | "loading" | "ready" | "error";
type AssistantTab = "conversation" | "documents" | "actions";

interface AssistantState {
    tab: AssistantTab;
    health: AIHealth | null;
    healthState: LoadState;
    messages: AIMessageView[];
    sessionId: string;
    activeHistory: AIConversationSummary | null;
    history: AIConversationSummary[];
    historyState: LoadState;
    historyError: string | null;
    documents: AIDocument[];
    documentsState: LoadState;
    documentsError: string | null;
    uploadResults: AIUploadResult[];
    inbox: AIApproval[];
    inboxTotal: number;
    approvals: AIApproval[];
    approvalsTotal: number;
    approvalsState: LoadState;
    approvalsError: string | null;
    approvalsPage: number;
    approvalsStatus: string;
    selectedApproval: AIApproval | null;
    selectedApprovalState: LoadState;
    selectedApprovalError: string | null;
    uncertainApprovalIds: string[];
    chatError: string | null;
    isSending: boolean;
    isRecording: boolean;
}

type AssistantAction =
    | { type: "tab/set"; tab: AssistantTab }
    | { type: "health/loading" }
    | { type: "health/loaded"; health: AIHealth }
    | { type: "health/error" }
    | { type: "history/loading" }
    | { type: "history/loaded"; history: AIConversationSummary[] }
    | { type: "history/error"; message: string }
    | { type: "history/open"; summary: AIConversationSummary; messages: AIMessageView[] }
    | { type: "conversation/new"; sessionId: string }
    | { type: "documents/loading" }
    | { type: "documents/loaded"; documents: AIDocument[] }
    | { type: "documents/error"; message: string }
    | { type: "documents/uploaded"; results: AIUploadResult[] }
    | { type: "documents/removed"; fileId: string }
    | { type: "approvals/loading" }
    | { type: "approvals/loaded"; inbox: AIApproval[]; inboxTotal: number; list: AIApprovalListResponse; page: number; status: string }
    | { type: "approvals/error"; message: string }
    | { type: "approval/select-loading" }
    | { type: "approval/selected"; approval: AIApproval }
    | { type: "approval/error"; message: string }
    | { type: "approval/uncertain"; id: string }
    | { type: "approval/clear" }
    | { type: "chat/human"; message: AIMessageView }
    | { type: "chat/assistant-start"; message: AIMessageView }
    | { type: "chat/stream-event"; id: string; event: Parameters<AIStreamListener>[0] }
    | { type: "chat/complete"; id: string; response: AIChatResponse; transcript?: string }
    | { type: "chat/transcript"; id: string; transcript: string }
    | { type: "chat/error"; id: string; message: string }
    | { type: "chat/error-clear" }
    | { type: "chat/sending"; value: boolean }
    | { type: "chat/recording"; value: boolean };

function createSessionId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
        const random = Math.floor(Math.random() * 16);
        return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
    });
}

function initialAssistantState(): AssistantState {
    return {
        tab: "conversation",
        health: null,
        healthState: "idle",
        messages: [],
        sessionId: createSessionId(),
        activeHistory: null,
        history: [],
        historyState: "idle",
        historyError: null,
        documents: [],
        documentsState: "idle",
        documentsError: null,
        uploadResults: [],
        inbox: [],
        inboxTotal: 0,
        approvals: [],
        approvalsTotal: 0,
        approvalsState: "idle",
        approvalsError: null,
        approvalsPage: 0,
        approvalsStatus: "",
        selectedApproval: null,
        selectedApprovalState: "idle",
        selectedApprovalError: null,
        uncertainApprovalIds: [],
        chatError: null,
        isSending: false,
        isRecording: false,
    };
}

function assistantReducer(state: AssistantState, action: AssistantAction): AssistantState {
    switch (action.type) {
        case "tab/set": return { ...state, tab: action.tab };
        case "health/loading": return { ...state, healthState: "loading" };
        case "health/loaded": return { ...state, health: action.health, healthState: "ready" };
        case "health/error": return { ...state, healthState: "error" };
        case "history/loading": return { ...state, historyState: "loading", historyError: null };
        case "history/loaded": return { ...state, history: action.history.filter((item) => item.session_id !== state.sessionId && item.doc_id !== state.activeHistory?.doc_id), historyState: "ready", historyError: null };
        case "history/error": return { ...state, historyState: "error", historyError: action.message };
        case "history/open": return { ...state, messages: action.messages, activeHistory: action.summary, tab: "conversation", chatError: null };
        case "conversation/new": return { ...state, sessionId: action.sessionId, messages: [], activeHistory: null, chatError: null, uploadResults: [], tab: "conversation" };
        case "documents/loading": return { ...state, documentsState: "loading", documentsError: null };
        case "documents/loaded": return { ...state, documents: action.documents, documentsState: "ready", documentsError: null };
        case "documents/error": return { ...state, documentsState: "error", documentsError: action.message };
        case "documents/uploaded": return { ...state, uploadResults: action.results };
        case "documents/removed": return { ...state, documents: state.documents.filter((document) => document.arquivo_id !== action.fileId) };
        case "approvals/loading": return { ...state, approvalsState: "loading", approvalsError: null };
        case "approvals/loaded": return { ...state, inbox: action.inbox, inboxTotal: action.inboxTotal, approvals: action.list.items, approvalsTotal: action.list.total, approvalsState: "ready", approvalsPage: action.page, approvalsStatus: action.status, approvalsError: null };
        case "approvals/error": return { ...state, approvalsState: "error", approvalsError: action.message };
        case "approval/select-loading": return { ...state, selectedApproval: null, selectedApprovalState: "loading", selectedApprovalError: null };
        case "approval/selected": return {
            ...state,
            messages: state.messages.map((message) => ({
                ...message,
                pendingActions: message.pendingActions?.map((pendingAction) => pendingAction.id === action.approval.id
                    ? { ...pendingAction, status: action.approval.status, justification: action.approval.justification, operation: action.approval.action.operation, parameters: action.approval.action.parameters, before: action.approval.before, result: action.approval.result, execution_error: action.approval.execution_error, uncertain: false }
                    : pendingAction),
            })),
            selectedApproval: action.approval,
            selectedApprovalState: "ready",
            selectedApprovalError: null,
            uncertainApprovalIds: ["AGUARDANDO_APROVACAO", "APROVADA_PENDENTE_INTEGRACAO"].includes(action.approval.status.toLocaleUpperCase("pt-BR"))
                ? state.uncertainApprovalIds
                : state.uncertainApprovalIds.filter((id) => id !== action.approval.id),
        };
        case "approval/error": return { ...state, selectedApprovalState: "error", selectedApprovalError: action.message };
        case "approval/uncertain": return {
            ...state,
            messages: state.messages.map((message) => ({
                ...message,
                pendingActions: message.pendingActions?.map((pendingAction) => pendingAction.id === action.id ? { ...pendingAction, uncertain: true } : pendingAction),
            })),
            uncertainApprovalIds: state.uncertainApprovalIds.includes(action.id) ? state.uncertainApprovalIds : [...state.uncertainApprovalIds, action.id],
        };
        case "approval/clear": return { ...state, selectedApproval: null, selectedApprovalState: "idle", selectedApprovalError: null };
        case "chat/human": return { ...state, messages: [...state.messages, action.message], chatError: null };
        case "chat/assistant-start": return { ...state, messages: [...state.messages, action.message] };
        case "chat/stream-event": {
            const messages = state.messages.map((message) => {
                if (message.id !== action.id) return message;
                switch (action.event.type) {
                    case "texto": return { ...message, content: message.content + action.event.delta };
                    case "pensamento": return message;
                    case "artefato": return { ...message, artifacts: [...(message.artifacts ?? []), action.event.artifact] };
                    case "cartao": {
                        const pendingAction: AIPendingAction = { ...action.event.pending_action, id: action.event.approval_id };
                        return { ...message, pendingActions: [...(message.pendingActions ?? []), pendingAction] };
                    }
                    case "etapa": {
                        const nextStep: AIStage = { id: action.event.id, status: action.event.status, texto: action.event.texto ?? "Etapa do assistente" };
                        const steps = message.steps ?? [];
                        const existingIndex = steps.findIndex((step) => step.id === nextStep.id);
                        return { ...message, steps: existingIndex < 0 ? [...steps, nextStep] : steps.map((step, index) => index === existingIndex ? { ...step, ...nextStep } : step) };
                    }
                    case "fim": return { ...message, outcome: action.event.status };
                    default: return message;
                }
            });
            return { ...state, messages };
        }
        case "chat/complete": return {
            ...state,
            messages: state.messages.map((message) => message.id === action.id
                ? { ...message, content: action.response.resposta || message.content, artifacts: action.response.artifacts, pendingActions: action.response.pending_actions, outcome: message.outcome ?? "concluida" }
                : message),
            chatError: null,
            isSending: false,
        };
        case "chat/transcript": return { ...state, messages: state.messages.map((message) => message.id === action.id ? { ...message, content: `Transcrição: ${action.transcript}` } : message) };
        case "chat/error": return {
            ...state,
            messages: state.messages.filter((message) => message.id !== action.id || Boolean(message.content)),
            chatError: action.message,
            isSending: false,
        };
        case "chat/error-clear": return { ...state, chatError: null };
        case "chat/sending": return { ...state, isSending: action.value };
        case "chat/recording": return { ...state, isRecording: action.value };
        default: {
            const exhaustiveAction: never = action;
            return exhaustiveAction;
        }
    }
}

function getMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

function getErrorResultMessage(error: unknown): string {
    return getMessage(error, "Não foi possível conectar ao assistente.");
}

function isUncertainMutation(error: unknown): boolean {
    return error instanceof ApiError && (error.status === 0 || error.status === 503);
}

function isMockMode(health: AIHealth | null): boolean {
    if (!health) return false;
    const modes = Object.values(health.modes ?? {}).map((mode) => mode?.toLocaleLowerCase("pt-BR") ?? "");
    return modes.some((mode) => mode.includes("mock") || mode.includes("demo"));
}

export interface UseAIAssistantResult {
    state: AssistantState;
    kitchenName: string;
    userId: string;
    accessType: string;
    canUseAssistant: boolean;
    mockMode: boolean;
    setTab: (tab: AssistantTab) => void;
    searchHistory: (query: string) => void;
    refreshHistory: (query?: string) => Promise<void>;
    openHistory: (summary: AIConversationSummary) => Promise<void>;
    newConversation: () => Promise<void>;
    sendMessage: (question: string, files?: File[]) => Promise<void>;
    sendAudio: (audio: Blob, fileName: string) => Promise<void>;
    stopGeneration: () => void;
    refreshDocuments: () => Promise<void>;
    uploadDocuments: (files: File[], shareWithKitchen: boolean) => Promise<boolean>;
    deleteDocument: (fileId: string) => Promise<boolean>;
    refreshApprovals: (page?: number, status?: string) => Promise<void>;
    selectApproval: (id: string) => Promise<AIApproval | null>;
    markApprovalUncertain: (id: string) => void;
    clearSelectedApproval: () => void;
    decideApproval: (approval: AIApproval, decision: "approve" | "reject", reason?: string) => Promise<AIApproval>;
    executeApproval: (approval: AIApproval) => Promise<AIApproval>;
    setRecording: (recording: boolean) => void;
    refreshAll: () => Promise<void>;
}

export function useAIAssistant(): UseAIAssistantResult {
    const { session } = useAuth();
    const [state, dispatch] = useReducer(assistantReducer, undefined, initialAssistantState);
    const stateRef = useRef(state);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeChatControllerRef = useRef<AbortController | null>(null);
    const requestControllersRef = useRef({
        history: null as AbortController | null,
        historyMessages: null as AbortController | null,
        documents: null as AbortController | null,
        documentMutation: null as AbortController | null,
        approvals: null as AbortController | null,
        approval: null as AbortController | null,
        health: null as AbortController | null,
    });
    const userId = session?.user.id ?? "";
    const kitchenName = session?.user.kitchen?.name ?? "Nenhuma cozinha vinculada";
    const profile = session?.user.profile;
    const accessType = (typeof profile === "string" ? profile : profile?.accessType ?? "").toLocaleUpperCase("pt-BR");
    const canUseAssistant = Boolean(userId && session?.user.kitchen?.id && ["SUPERVISOR", "ESTOQUISTA", "COMPRADOR"].includes(accessType));

    useEffect(() => { stateRef.current = state; }, [state]);

    // Stable callbacks keep the route effect and panel handlers from restarting requests on each render.
    const refreshHistory = useCallback(async (query = "") => {
        if (!canUseAssistant) return;
        requestControllersRef.current.history?.abort();
        const controller = new AbortController();
        requestControllersRef.current.history = controller;
        dispatch({ type: "history/loading" });
        try {
            const response = await getAIConversationHistory(query, controller.signal);
            dispatch({ type: "history/loaded", history: response.sessoes });
        } catch (error) {
            if (controller.signal.aborted) return;
            dispatch({ type: "history/error", message: getMessage(error, "Não foi possível carregar o histórico.") });
        } finally {
            if (requestControllersRef.current.history === controller) requestControllersRef.current.history = null;
        }
    }, [canUseAssistant]);

    const refreshDocuments = useCallback(async () => {
        if (!canUseAssistant) return;
        requestControllersRef.current.documents?.abort();
        const controller = new AbortController();
        requestControllersRef.current.documents = controller;
        dispatch({ type: "documents/loading" });
        try {
            const response = await getAIDocuments(controller.signal);
            dispatch({ type: "documents/loaded", documents: response.documentos });
        } catch (error) {
            if (controller.signal.aborted) return;
            dispatch({ type: "documents/error", message: getMessage(error, "Não foi possível carregar os documentos.") });
        } finally {
            if (requestControllersRef.current.documents === controller) requestControllersRef.current.documents = null;
        }
    }, [canUseAssistant]);

    const refreshApprovals = useCallback(async (page = 0, status = "") => {
        if (!canUseAssistant) return;
        requestControllersRef.current.approvals?.abort();
        const controller = new AbortController();
        requestControllersRef.current.approvals = controller;
        dispatch({ type: "approvals/loading" });
        try {
            const offset = page * 20;
            const [inbox, list] = await Promise.all([
                getAIApprovalInbox(controller.signal),
                getAIApprovals({ status: status || undefined, offset, limit: 20 }, controller.signal),
            ]);
            dispatch({ type: "approvals/loaded", inbox: inbox.items, inboxTotal: inbox.total, list, page, status });
        } catch (error) {
            if (controller.signal.aborted) return;
            dispatch({ type: "approvals/error", message: getMessage(error, "Não foi possível carregar as ações.") });
        } finally {
            if (requestControllersRef.current.approvals === controller) requestControllersRef.current.approvals = null;
        }
    }, [canUseAssistant]);

    const refreshAll = useCallback(async () => {
        if (!userId) return;
        requestControllersRef.current.health?.abort();
        const healthController = new AbortController();
        requestControllersRef.current.health = healthController;
        dispatch({ type: "health/loading" });
        void getAIHealth(healthController.signal).then((health) => dispatch({ type: "health/loaded", health })).catch(() => {
            if (!healthController.signal.aborted) dispatch({ type: "health/error" });
        }).finally(() => {
            if (requestControllersRef.current.health === healthController) requestControllersRef.current.health = null;
        });
        if (canUseAssistant) await Promise.all([refreshHistory(), refreshDocuments(), refreshApprovals()]);
    }, [canUseAssistant, refreshApprovals, refreshDocuments, refreshHistory, userId]);

    useEffect(() => {
        if (!userId) return;
        void refreshAll();
    }, [refreshAll, userId]);

    const endCurrentSession = useCallback(async () => {
        const latest = stateRef.current;
        if (latest.activeHistory || !latest.messages.length || latest.messages.every((message) => message.role !== "human")) return;
        try { await endAIConversation(latest.sessionId); }
        catch { /* Ending a conversation is best-effort while navigating away. */ }
    }, []);

    useEffect(() => () => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        activeChatControllerRef.current?.abort();
        Object.values(requestControllersRef.current).forEach((controller) => controller?.abort());
        const latest = stateRef.current;
        if (!userId || latest.activeHistory || !latest.messages.some((message) => message.role === "human")) return;
        void endAIConversation(latest.sessionId).catch(() => undefined);
    }, [userId]);

    const setTab = useCallback((tab: AssistantTab) => dispatch({ type: "tab/set", tab }), []);

    const searchHistory = useCallback((query: string) => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => { void refreshHistory(query); }, 250);
    }, [refreshHistory]);

    const openHistory = useCallback(async (summary: AIConversationSummary) => {
        if (!canUseAssistant) return;
        activeChatControllerRef.current?.abort();
        requestControllersRef.current.historyMessages?.abort();
        const controller = new AbortController();
        requestControllersRef.current.historyMessages = controller;
        void endCurrentSession();
        try {
            const response = await getAIConversationMessages(summary.doc_id, controller.signal);
            dispatch({ type: "history/open", summary, messages: normalizeStoredMessages(response.messages) });
        } catch (error) {
            if (controller.signal.aborted) return;
            dispatch({ type: "history/error", message: getMessage(error, "Não foi possível abrir esta conversa.") });
        } finally {
            if (requestControllersRef.current.historyMessages === controller) requestControllersRef.current.historyMessages = null;
        }
    }, [canUseAssistant, endCurrentSession]);

    const newConversation = useCallback(async () => {
        if (!canUseAssistant) return;
        activeChatControllerRef.current?.abort();
        const endingSession = endCurrentSession();
        dispatch({ type: "conversation/new", sessionId: createSessionId() });
        void endingSession.then(() => refreshHistory());
    }, [canUseAssistant, endCurrentSession, refreshHistory]);

    const runChat = useCallback(async (humanText: string, request: AIChatRequest, files: File[] = [], audio?: { blob: Blob; fileName: string }) => {
        const humanId = `human-${request.requestId}`;
        const assistantId = `assistant-${request.requestId}`;
        dispatch({ type: "chat/error-clear" });
        dispatch({ type: "chat/human", message: { id: humanId, role: "human", content: humanText, createdAt: new Date().toISOString() } });
        dispatch({ type: "chat/assistant-start", message: { id: assistantId, role: "assistant", content: "", steps: [], artifacts: [], pendingActions: [] } });
        dispatch({ type: "chat/sending", value: true });
        const controller = new AbortController();
        activeChatControllerRef.current = controller;
        try {
            if (files.length) {
                const uploaded = await uploadAIDocuments(files, false, controller.signal);
                dispatch({ type: "documents/uploaded", results: uploaded.resultados });
                const indexed = uploaded.resultados.filter((result) => result.status === "indexado").length;
                if (!indexed) throw new ApiError("Nenhum arquivo foi indexado. Confira os resultados do envio antes de perguntar sobre eles.", 0);
                void refreshDocuments();
            }
            const listener: AIStreamListener = (event) => dispatch({ type: "chat/stream-event", id: assistantId, event });
            const response = audio
                ? await sendAIAudio(audio.blob, audio.fileName, request.sessionId, request.userId, request.requestId, controller.signal)
                : await sendAIMessage(request, listener, controller.signal);
            dispatch({ type: "chat/complete", id: assistantId, response, transcript: response.transcricao });
            if (response.transcricao) dispatch({ type: "chat/transcript", id: humanId, transcript: response.transcricao });
            if (response.pending_actions.length) void refreshApprovals();
            void refreshHistory();
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                dispatch({ type: "chat/error", id: assistantId, message: "Resposta interrompida. Você pode enviar outra mensagem." });
            } else {
                dispatch({ type: "chat/error", id: assistantId, message: getErrorResultMessage(error) });
            }
        } finally {
            if (activeChatControllerRef.current === controller) activeChatControllerRef.current = null;
            dispatch({ type: "chat/sending", value: false });
        }
    }, [refreshApprovals, refreshDocuments, refreshHistory]);

    const sendMessage = useCallback(async (question: string, files: File[] = []) => {
        if (!canUseAssistant || stateRef.current.isSending || stateRef.current.activeHistory) return;
        const validation = validateAIQuestion(question);
        if (validation.error) {
            dispatch({ type: "chat/error", id: "validation", message: validation.error });
            return;
        }
        const trimmedQuestion = validation.value;
        if (!trimmedQuestion && files.length === 0) return;
        if (files.length) {
            const uploadError = validateAIDocumentSelection(files, stateRef.current.documents.filter((document) => document.dono).length);
            if (uploadError) {
                dispatch({ type: "chat/error", id: "validation", message: uploadError });
                return;
            }
        }
        const requestId = createSessionId();
        const request: AIChatRequest = {
            sessionId: stateRef.current.sessionId,
            question: trimmedQuestion || "Analise os documentos que acabei de enviar.",
            userId,
            requestId,
        };
        await runChat(trimmedQuestion || `Enviei ${files.length} documento(s) para consulta.`, request, files);
    }, [canUseAssistant, runChat, userId]);

    const sendAudio = useCallback(async (audio: Blob, fileName: string) => {
        if (!canUseAssistant || stateRef.current.isSending || stateRef.current.activeHistory) return;
        if (audio.size > 10 * 1024 * 1024) {
            dispatch({ type: "chat/error-clear" });
            dispatch({ type: "chat/error", id: "audio-invalid", message: "O áudio excede o limite de 10 MB." });
            return;
        }
        if (!getAIAudioFileName(audio.type) || getAIAudioFileName(audio.type) !== fileName) {
            dispatch({ type: "chat/error", id: "audio-invalid", message: "O formato de áudio não é aceito pelo serviço." });
            return;
        }
        const requestId = createSessionId();
        const request: AIChatRequest = { sessionId: stateRef.current.sessionId, question: "", userId, requestId };
        await runChat("Áudio enviado para transcrição…", request, [], { blob: audio, fileName });
    }, [canUseAssistant, runChat, userId]);

    const uploadDocuments = useCallback(async (files: File[], shareWithKitchen: boolean) => {
        if (!canUseAssistant || requestControllersRef.current.documentMutation) return false;
        const validationError = validateAIDocumentSelection(files, stateRef.current.documents.filter((document) => document.dono).length);
        if (validationError) {
            dispatch({ type: "documents/error", message: validationError });
            return false;
        }
        const controller = new AbortController();
        requestControllersRef.current.documentMutation = controller;
        dispatch({ type: "documents/loading" });
        try {
            const response = await uploadAIDocuments(files, shareWithKitchen && accessType === "SUPERVISOR", controller.signal);
            dispatch({ type: "documents/uploaded", results: response.resultados });
            try {
                const documents = await getAIDocuments(controller.signal);
                dispatch({ type: "documents/loaded", documents: documents.documentos });
            } catch (error) {
                if (!controller.signal.aborted) {
                    dispatch({ type: "documents/error", message: `Os arquivos foram enviados, mas não foi possível atualizar a lista: ${getMessage(error, "tente atualizar novamente.")}` });
                }
            }
            return true;
        } catch (error) {
            if (controller.signal.aborted) return false;
            dispatch({ type: "documents/error", message: getMessage(error, "Não foi possível enviar os documentos.") });
            return false;
        } finally {
            if (requestControllersRef.current.documentMutation === controller) requestControllersRef.current.documentMutation = null;
        }
    }, [accessType, canUseAssistant]);

    const deleteDocument = useCallback(async (fileId: string) => {
        if (!canUseAssistant || requestControllersRef.current.documentMutation) return false;
        const controller = new AbortController();
        requestControllersRef.current.documentMutation = controller;
        try {
            await removeAIDocument(fileId, controller.signal);
            dispatch({ type: "documents/removed", fileId });
            return true;
        } catch (error) {
            if (controller.signal.aborted) return false;
            dispatch({ type: "documents/error", message: getMessage(error, "Não foi possível remover o documento.") });
            return false;
        } finally {
            if (requestControllersRef.current.documentMutation === controller) requestControllersRef.current.documentMutation = null;
        }
    }, [canUseAssistant]);

    const selectApproval = useCallback(async (id: string) => {
        if (!canUseAssistant) return null;
        requestControllersRef.current.approval?.abort();
        const controller = new AbortController();
        requestControllersRef.current.approval = controller;
        dispatch({ type: "approval/select-loading" });
        try {
            const approval = await getAIApproval(id, controller.signal);
            if (approval.status.toLocaleUpperCase("pt-BR") === "RESULTADO_INCERTO") dispatch({ type: "approval/uncertain", id });
            dispatch({ type: "approval/selected", approval });
            return approval;
        }
        catch (error) {
            if (!controller.signal.aborted) dispatch({ type: "approval/error", message: getMessage(error, "Não foi possível carregar os detalhes da ação.") });
            return null;
        } finally {
            if (requestControllersRef.current.approval === controller) requestControllersRef.current.approval = null;
        }
    }, [canUseAssistant]);

    const clearSelectedApproval = useCallback(() => dispatch({ type: "approval/clear" }), []);
    const markApprovalUncertain = useCallback((id: string) => dispatch({ type: "approval/uncertain", id }), []);

    const decideApproval = useCallback(async (approval: AIApproval, decision: "approve" | "reject", reason?: string) => {
        if (!canUseAssistant || approval.requester_id !== userId || approval.status.toLocaleUpperCase("pt-BR") !== "AGUARDANDO_APROVACAO") throw new ApiError("Esta ação não pode ser decidida por esta conta ou já não está aguardando decisão.", 403);
        if (stateRef.current.uncertainApprovalIds.includes(approval.id)) throw new ApiError("O resultado da tentativa anterior ainda é incerto. Consulte a situação antes de agir.", 409);
        const reasonValidation = validateAIApprovalReason(reason ?? "");
        if (reasonValidation.error) throw new ApiError(reasonValidation.error, 400);
        let result: AIApproval;
        try {
            result = await decideAIApproval(approval.id, { decision, proposal_hash: approval.proposal_hash, ...(reasonValidation.value ? { reason: reasonValidation.value } : {}) });
        } catch (error) {
            if (isUncertainMutation(error)) dispatch({ type: "approval/uncertain", id: approval.id });
            throw error;
        }
        dispatch({ type: "approval/selected", approval: result });
        await refreshApprovals(stateRef.current.approvalsPage, stateRef.current.approvalsStatus);
        return result;
    }, [canUseAssistant, refreshApprovals, userId]);

    const executeApproval = useCallback(async (approval: AIApproval) => {
        if (!canUseAssistant || approval.requester_id !== userId || approval.status.toLocaleUpperCase("pt-BR") !== "APROVADA_PENDENTE_INTEGRACAO") throw new ApiError("Esta operação não pode ser executada por esta conta ou ainda não está pendente de integração.", 403);
        if (stateRef.current.uncertainApprovalIds.includes(approval.id)) throw new ApiError("O resultado da tentativa anterior ainda é incerto. Consulte a situação antes de agir.", 409);
        let result: AIApproval;
        try { result = await executeAIApproval(approval.id); }
        catch (error) {
            if (isUncertainMutation(error)) dispatch({ type: "approval/uncertain", id: approval.id });
            throw error;
        }
        dispatch({ type: "approval/selected", approval: result });
        await refreshApprovals(stateRef.current.approvalsPage, stateRef.current.approvalsStatus);
        return result;
    }, [canUseAssistant, refreshApprovals, userId]);

    const setRecording = useCallback((recording: boolean) => dispatch({ type: "chat/recording", value: recording }), []);
    const stopGeneration = useCallback(() => activeChatControllerRef.current?.abort(), []);
    const mockMode = useMemo(() => isMockMode(state.health), [state.health]);

    return {
        state,
        kitchenName,
        userId,
        accessType,
        canUseAssistant,
        mockMode,
        setTab,
        searchHistory,
        refreshHistory,
        openHistory,
        newConversation,
        sendMessage,
        sendAudio,
        stopGeneration,
        refreshDocuments,
        uploadDocuments,
        deleteDocument,
        refreshApprovals,
        selectApproval,
        markApprovalUncertain,
        clearSelectedApproval,
        decideApproval,
        executeApproval,
        setRecording,
        refreshAll,
    };
}
