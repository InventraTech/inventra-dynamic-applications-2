export type AIRecordValue = string | number | null;

export interface AIHealth {
    status: "ok" | "degraded" | string;
    storage: "ok" | "indisponível" | string;
    modes?: {
        auth?: string;
        business?: string;
        storage?: string;
        llm?: string;
    };
    warning?: string | null;
}

export interface AIEndChatResponse {
    resumo: string;
}

export interface AIQueryResponse {
    ok: boolean;
    code: string;
    message: string;
    data: unknown;
    source: string;
    mocked: boolean;
    request_id: string | null;
    incomplete: boolean;
}

export interface AIApprovalDecisionInput {
    decision: "approve" | "reject";
    proposal_hash: string;
    reason?: string;
}

export interface AIStage {
    id: string;
    status?: "inicio" | "fim";
    texto: string;
}

export interface AITableArtifact {
    type: "table";
    columns: Array<{ key: string; label: string }>;
    rows: Array<Record<string, AIRecordValue>>;
    source?: string;
    mocked?: boolean;
    note?: string;
}

export interface AIChartArtifact {
    type: "chart";
    chart_type: "bar" | "pie";
    labels: string[];
    datasets: Array<{ label: string; data: number[] }>;
    unit?: string;
    source?: string;
    mocked?: boolean;
    note?: string;
}

export type AIArtifact = AITableArtifact | AIChartArtifact;

export interface AIPendingAction {
    id: string;
    proposal_hash: string;
    operation: string;
    parameters: Record<string, unknown>;
    justification: string;
    status: string;
    expires_at?: string;
    before?: Array<Record<string, unknown>>;
    result?: AIApproval["result"];
    execution_error?: string | null;
    uncertain?: boolean;
}

export interface AIChatResponse {
    resposta: string;
    artifacts: AIArtifact[];
    pending_actions: AIPendingAction[];
    transcricao?: string;
}

export type AIStreamEvent =
    | { type: "etapa"; id: string; status: "inicio" | "fim"; texto?: string; pai?: string; detalhe?: string }
    | { type: "pensamento"; id: string; delta: string }
    | { type: "artefato"; artifact: AIArtifact }
    | { type: "cartao"; approval_id: string; pending_action: AIPendingAction }
    | { type: "texto"; delta: string }
    | { type: "fim"; status: "aprovado" | "segura" | string }
    | { type: "erro"; mensagem: string };

export interface AIConversationSummary {
    doc_id: string;
    started_at: string;
    summary: string;
    titulo: string | null;
    session_id: string | null;
    ativa: boolean;
}

export interface AIConversationHistoryResponse {
    sessoes: AIConversationSummary[];
}

export interface AIStoredMessage {
    role: string;
    content: string;
    passos?: AIStage[];
    artifacts?: AIArtifact[];
}

export interface AIConversationMessagesResponse {
    messages: AIStoredMessage[];
}

export interface AIUploadResult {
    nome: string;
    status: "indexado" | "recusado" | "erro" | string;
    arquivo_id: string;
    tipo: string;
    trechos: number;
    mensagem: string;
    codigo: string;
    aviso: string;
}

export interface AIUploadResponse {
    resultados: AIUploadResult[];
    indexados: number;
    recusados: number;
}

export interface AIDocument {
    arquivo_id: string;
    nome: string;
    tipo: string;
    pasta: string;
    trechos: number;
    compartilhado: boolean;
    enviado_em: string;
    dono: boolean;
}

export interface AIDocumentsResponse {
    documentos: AIDocument[];
}

export interface AIApprovalAction {
    operation: string;
    parameters: Record<string, unknown>;
}

export interface AIApproval {
    id: string;
    status: string;
    proposal_hash: string;
    action: AIApprovalAction;
    justification: string;
    created_at: string;
    expires_at?: string;
    before?: Array<Record<string, unknown>>;
    requester?: string | null;
    requester_id?: string | null;
    kitchen_id?: number | string | null;
    decision?: "approve" | "reject" | null;
    decided_by?: string | null;
    decided_at?: string | null;
    decision_reason?: string | null;
    result?: {
        ok?: boolean;
        code?: string;
        message?: string;
        data?: unknown;
        source?: string;
        mocked?: boolean;
    } | null;
    execution_error?: string | null;
    executed_at?: string | null;
    audit?: Array<{ event: string; at: string; actor: string }>;
}

export interface AIApprovalListResponse {
    items: AIApproval[];
    total: number;
}

export interface AIMessageView {
    id: string;
    role: "human" | "assistant";
    content: string;
    steps?: AIStage[];
    artifacts?: AIArtifact[];
    pendingActions?: AIPendingAction[];
    outcome?: "aprovado" | "segura" | string;
    createdAt?: string;
}
