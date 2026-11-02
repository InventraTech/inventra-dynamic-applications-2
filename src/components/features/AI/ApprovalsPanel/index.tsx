import { useRef, useState } from "react";

import type { AIApproval } from "../../../../types/ai";
import { ApiError } from "../../../../utils/apiError";
import Button from "../../../ui/Button";
import Feedback from "../../../ui/Feedback";
import Loading from "../../../ui/Loading";
import StatusBadge, { type StatusTone } from "../../../ui/StatusBadge";
import { maxAIApprovalReasonLength, validateAIApprovalReason } from "../../../../utils/aiValidation";

interface ApprovalsPanelProps {
    inbox: AIApproval[];
    approvals: AIApproval[];
    total: number;
    page: number;
    status: string;
    loading: boolean;
    error: string | null;
    selected: AIApproval | null;
    selectedLoading: boolean;
    selectedError: string | null;
    uncertainActionIds: string[];
    userId: string;
    onBack: () => void;
    onRefresh: (page?: number, status?: string) => Promise<void>;
    onOpen: (id: string) => Promise<AIApproval | null>;
    onMarkUncertain: (id: string) => void;
    onClearSelected: () => void;
    onDecision: (approval: AIApproval, decision: "approve" | "reject", reason?: string) => Promise<AIApproval>;
    onExecute: (approval: AIApproval) => Promise<AIApproval>;
}

type DecisionChoice = "approve" | "reject" | null;

interface DecisionFormState {
    choice: DecisionChoice;
    reason: string;
    isSubmitting: boolean;
    error: string | null;
    reasonError: string | null;
    resultMessage: string | null;
}

const statusLabels: Record<string, string> = {
    AGUARDANDO_APROVACAO: "Aguardando decisão",
    APROVADA_PENDENTE_INTEGRACAO: "Integração pendente",
    EM_EXECUCAO: "Em execução",
    CONCLUIDA: "Concluída",
    FALHOU: "Falhou",
    RESULTADO_INCERTO: "Resultado incerto",
    RECUSADA: "Recusada",
    EXPIRADA: "Expirada",
};

function normalizedStatus(status: string): string { return status.toLocaleUpperCase("pt-BR"); }
function statusLabel(status: string): string { const value = normalizedStatus(status); return statusLabels[value] ?? value.replaceAll("_", " "); }
function statusTone(status: string): StatusTone {
    const value = normalizedStatus(status);
    if (value === "CONCLUIDA") return "success";
    if (value === "FALHOU" || value === "RECUSADA") return "danger";
    if (value === "RESULTADO_INCERTO") return "warning";
    if (value === "AGUARDANDO_APROVACAO" || value === "APROVADA_PENDENTE_INTEGRACAO") return "warning";
    if (value === "EM_EXECUCAO") return "info";
    return "neutral";
}
function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Data indisponível" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}
function isPending(status: string): boolean {
    return normalizedStatus(status) === "AGUARDANDO_APROVACAO";
}

interface ApprovalRowProps {
    approval: AIApproval;
    onOpen: (id: string) => void;
}

function ApprovalRow({ approval, onOpen }: ApprovalRowProps) {
    return (
        <li className="flex min-w-0 flex-col gap-3 rounded-2xl border border-history-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-k2d font-bold capitalize text-ink">{approval.action.operation.replaceAll("_", " ")}</h3><StatusBadge tone={statusTone(approval.status)} label={statusLabel(approval.status)} /></div>
                <p className="mt-1 line-clamp-2 font-k2d text-sm text-history-muted">{approval.justification}</p>
                <p className="mt-2 font-k2d text-xs text-history-muted">Solicitada em {formatDate(approval.created_at)}{approval.requester ? ` · por ${approval.requester}` : ""}</p>
            </div>
            <Button variant="outline" type="button" onClick={() => onOpen(approval.id)} className="shrink-0">Revisar ação</Button>
        </li>
    );
}

export default function ApprovalsPanel({ inbox, approvals, total, page, status, loading, error, selected, selectedLoading, selectedError, uncertainActionIds, userId, onBack, onRefresh, onOpen, onMarkUncertain, onClearSelected, onDecision, onExecute }: ApprovalsPanelProps) {
    const [decisionForm, setDecisionForm] = useState<DecisionFormState>({ choice: null, reason: "", isSubmitting: false, error: null, reasonError: null, resultMessage: null });
    const { choice: decisionChoice, reason, isSubmitting, error: decisionError, resultMessage } = decisionForm;
    const selectedActionRef = useRef<HTMLElement>(null);
    const pageCount = Math.max(1, Math.ceil(total / 20));
    const isRequester = Boolean(userId && selected?.requester_id === userId);
    const isUncertain = Boolean(selected && uncertainActionIds.includes(selected.id));
    const canDecide = Boolean(selected && isRequester && isPending(selected.status) && !isUncertain);
    const canExecute = Boolean(selected && isRequester && normalizedStatus(selected.status) === "APROVADA_PENDENTE_INTEGRACAO" && !isUncertain);
    const resultUncertain = selected?.status === "RESULTADO_INCERTO" || isUncertain;

    function updateDecisionForm(patch: Partial<DecisionFormState>) {
        setDecisionForm((current) => ({ ...current, ...patch }));
    }

    function closeDetails() {
        if (isSubmitting) return;
        updateDecisionForm({ choice: null, reason: "", error: null, reasonError: null, resultMessage: null });
        onClearSelected();
    }

    async function confirmDecision() {
        if (!selected || !decisionChoice) return;
        const reasonValidation = validateAIApprovalReason(reason);
        if (reasonValidation.error) {
            updateDecisionForm({ reasonError: reasonValidation.error });
            return;
        }
        updateDecisionForm({ isSubmitting: true, error: null, reasonError: null });
        try {
            const result = await onDecision(selected, decisionChoice, reasonValidation.value);
            updateDecisionForm({ choice: null, resultMessage: result.status === "RESULTADO_INCERTO" ? "A API informou resultado incerto. Não repita nem tente executar esta ação novamente. Consulte a situação antes de qualquer nova tentativa." : result.status === "FALHOU" ? result.execution_error || "A operação falhou durante a execução. Consulte a situação antes de agir novamente." : result.status === "CONCLUIDA" ? "A aprovação foi registrada e a operação foi concluída." : result.status === "APROVADA_PENDENTE_INTEGRACAO" ? "A aprovação foi registrada e aguarda integração." : decisionChoice === "approve" ? "A decisão foi enviada. Confira o estado atualizado da operação." : "A recusa foi registrada." });
        } catch (actionError) {
            if (actionError instanceof ApiError && (actionError.status === 0 || actionError.status === 503)) {
                onMarkUncertain(selected.id);
                updateDecisionForm({ resultMessage: "A conexão caiu durante a decisão. O resultado pode ter sido aplicado; consulte a situação antes de qualquer nova tentativa." });
            } else updateDecisionForm({ error: actionError instanceof Error ? actionError.message : "Não foi possível registrar a decisão." });
        } finally { updateDecisionForm({ isSubmitting: false }); }
    }

    async function executeApproved() {
        if (!selected || !canExecute) return;
        updateDecisionForm({ isSubmitting: true, error: null });
        try {
            const result = await onExecute(selected);
            updateDecisionForm({ resultMessage: result.status === "RESULTADO_INCERTO" ? "A API informou resultado incerto. Não tente executar novamente." : result.status === "FALHOU" ? result.execution_error || "A execução falhou. Consulte os detalhes antes de qualquer nova ação." : "A execução foi concluída." });
        } catch (actionError) {
            if (actionError instanceof ApiError && (actionError.status === 0 || actionError.status === 503)) {
                onMarkUncertain(selected.id);
                updateDecisionForm({ resultMessage: "A conexão caiu durante a execução. O resultado pode ter sido aplicado; consulte a situação antes de qualquer nova tentativa." });
            } else updateDecisionForm({ error: actionError instanceof Error ? actionError.message : "Não foi possível concluir a execução." });
        } finally { updateDecisionForm({ isSubmitting: false }); }
    }

    async function checkSelectedStatus() {
        if (!selected) return;
        const refreshed = await onOpen(selected.id);
        if (!refreshed) return;
        if (uncertainActionIds.includes(refreshed.id) && ["AGUARDANDO_APROVACAO", "APROVADA_PENDENTE_INTEGRACAO"].includes(normalizedStatus(refreshed.status))) {
            updateDecisionForm({ resultMessage: `A API ainda informa “${statusLabel(refreshed.status)}”. A tentativa anterior continua bloqueada; não repita a operação.` });
            return;
        }
        updateDecisionForm({ resultMessage: `Situação atualizada pela API: ${statusLabel(refreshed.status)}.` });
    }

    return (
        <section aria-labelledby="ai-approvals-title" className="min-w-0 space-y-5">
            <div className="rounded-3xl bg-surface p-4 shadow-history-card sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 id="ai-approvals-title" className="font-k2d text-xl font-bold text-ink">Ações e aprovações</h2><p className="mt-1 max-w-3xl font-k2d text-sm leading-relaxed text-history-muted">Revise cada alteração proposta. A decisão é registrada pela API e pode atualizar o estoque ou outros dados.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" type="button" onClick={onBack}>Voltar à conversa</Button><Button variant="ghost" type="button" onClick={() => void onRefresh(page, status)} disabled={loading}>Atualizar</Button></div></div>
                {inbox.length ? <section className="mt-5"><div className="mb-3 flex flex-wrap items-center gap-2"><h3 className="font-k2d text-lg font-bold text-ink">Aguardando sua decisão</h3><StatusBadge tone="warning" label={`${inbox.length} pendente${inbox.length === 1 ? "" : "s"}`} /></div><ul className="space-y-3">{inbox.map((approval) => <ApprovalRow key={approval.id} approval={approval} onOpen={(id) => { void (async () => { const opened = await onOpen(id); if (opened) requestAnimationFrame(() => selectedActionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })); })(); }} />)}</ul></section> : null}
                <div className="mt-6 flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-k2d text-lg font-bold text-ink">Registro de ações</h3><p className="mt-1 font-k2d text-sm text-history-muted">Exibe suas ações e, para supervisores, as ações da cozinha.</p></div><label className="flex flex-col gap-1 font-k2d text-xs font-semibold text-history-muted">Situação<select value={status} onChange={(event) => void onRefresh(0, event.target.value)} className="min-h-10 rounded-xl border border-history-border bg-surface px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-focus"><option value="">Todas</option><option value="AGUARDANDO_APROVACAO">Aguardando decisão</option><option value="APROVADA_PENDENTE_INTEGRACAO">Aprovada · integração pendente</option><option value="EM_EXECUCAO">Em execução</option><option value="CONCLUIDA">Concluídas</option><option value="FALHOU">Falhas</option><option value="RESULTADO_INCERTO">Resultado incerto</option><option value="RECUSADA">Recusadas</option><option value="EXPIRADA">Expiradas</option></select></label></div>
                {error ? <Feedback severity="error" className="mt-4">{error}</Feedback> : null}
                {loading && approvals.length === 0 ? <div className="py-8"><Loading loadingText="Carregando ações" /></div> : null}
                {!loading && approvals.length === 0 ? <p className="mt-4 rounded-2xl bg-history-card-header p-6 text-center font-k2d text-sm text-history-muted">Nenhuma ação encontrada para esta situação.</p> : null}
                {approvals.length ? <ul className="mt-4 space-y-3">{approvals.map((approval) => <ApprovalRow key={approval.id} approval={approval} onOpen={onOpen} />)}</ul> : null}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-history-border pt-4 font-k2d text-sm text-history-muted"><span>{total ? `${page * 20 + 1}–${Math.min((page + 1) * 20, total)} de ${total}` : "0 ações"}</span><div className="flex items-center gap-2"><Button variant="outline" type="button" disabled={page === 0 || loading} onClick={() => void onRefresh(page - 1, status)}>Anterior</Button><span aria-live="polite">Página {page + 1} de {pageCount}</span><Button variant="outline" type="button" disabled={page + 1 >= pageCount || loading} onClick={() => void onRefresh(page + 1, status)}>Próxima</Button></div></div>
            </div>

            {selectedLoading ? <div className="rounded-3xl bg-surface p-6 shadow-history-card"><Loading loadingText="Carregando detalhes da ação" /></div> : null}
            {selectedError ? <Feedback severity="error">{selectedError}</Feedback> : null}
            {selected ? <section ref={selectedActionRef} aria-labelledby="ai-approval-detail-title" className="scroll-mt-24 rounded-3xl bg-surface p-4 shadow-history-card sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="ai-approval-detail-title" className="font-k2d text-xl font-bold text-ink">Revisão da ação</h2><p className="mt-1 font-k2d text-sm text-history-muted">Criada em {formatDate(selected.created_at)}</p></div><div className="flex items-center gap-2"><StatusBadge tone={statusTone(selected.status)} label={statusLabel(selected.status)} /><Button variant="icon" type="button" onClick={closeDetails} className="size-10 rounded-full text-history-muted hover:bg-history-card-header" aria-label="Fechar revisão">×</Button></div></div>
                <p className="mt-4 rounded-2xl bg-history-card-header p-4 font-k2d text-sm leading-relaxed text-ink">{selected.justification}</p>
                <h3 className="mt-5 font-k2d text-sm font-bold text-ink">Dados que serão afetados</h3>
                <dl className="mt-2 divide-y divide-history-border rounded-2xl border border-history-border">{Object.entries(selected.action.parameters).map(([key, value]) => <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)]"><dt className="font-k2d text-xs font-semibold uppercase text-history-muted">{key.replaceAll("_", " ")}</dt><dd className="min-w-0 wrap-anywhere font-k2d text-sm text-ink">{formatValue(value)}</dd></div>)}</dl>
                {selected.before?.length ? <details className="mt-4 rounded-2xl bg-history-card-header p-4"><summary className="cursor-pointer font-k2d font-semibold text-ink focus-visible:outline-2 focus-visible:outline-focus">Estado atual dos dados</summary><pre className="mt-3 overflow-x-auto whitespace-pre-wrap wrap-anywhere font-k2d text-xs text-history-muted">{JSON.stringify(selected.before, null, 2)}</pre></details> : null}
                {selected.result?.message ? <Feedback severity={selected.result.ok ? "success" : "error"} className="mt-4">{selected.result.message}</Feedback> : null}
                {selected.execution_error ? <Feedback severity="error" className="mt-4">{selected.execution_error}</Feedback> : null}
                {selected.audit?.length ? <details className="mt-4 rounded-2xl bg-history-card-header p-4"><summary className="cursor-pointer font-k2d font-semibold text-ink focus-visible:outline-2 focus-visible:outline-focus">Trilha de auditoria</summary><ul className="mt-3 space-y-2">{selected.audit.map((entry) => <li key={`${entry.event}-${entry.at}-${entry.actor}`} className="font-k2d text-sm text-history-muted">{entry.event} · {formatDate(entry.at)} · {entry.actor}</li>)}</ul></details> : null}
                {resultMessage ? <Feedback severity={resultUncertain ? "info" : selected.status === "FALHOU" ? "error" : "success"} className="mt-4">{resultMessage}</Feedback> : null}
                {decisionError ? <Feedback severity="error" className="mt-4">{decisionError}</Feedback> : null}
                {decisionChoice ? <div className="mt-4 rounded-2xl border border-history-status-observation-text/30 bg-history-status-observation-bg p-4"><h3 className="font-k2d font-bold text-ink">Confirmar {decisionChoice === "approve" ? "aprovação" : "recusa"}</h3><p className="mt-1 font-k2d text-sm text-history-muted">{decisionChoice === "approve" ? "Aprovar pode executar a operação imediatamente." : "A decisão será registrada e não poderá ser desfeita."}</p>{decisionChoice === "reject" ? <label className="mt-3 block font-k2d text-sm font-semibold text-ink">Motivo da recusa · opcional, até 1.000 caracteres<textarea value={reason} onChange={(event) => updateDecisionForm({ reason: event.target.value, reasonError: null })} maxLength={maxAIApprovalReasonLength} aria-invalid={Boolean(decisionForm.reasonError)} aria-describedby={decisionForm.reasonError ? "ai-approval-reason-help ai-approval-reason-error" : "ai-approval-reason-help"} rows={3} className="mt-1 w-full rounded-xl border border-history-border bg-surface p-3 font-k2d text-sm font-normal focus-visible:outline-2 focus-visible:outline-focus" /></label> : null}{decisionChoice === "reject" ? <><p id="ai-approval-reason-help" className="sr-only">O motivo é opcional e pode ter até {maxAIApprovalReasonLength.toLocaleString("pt-BR")} caracteres.</p>{decisionForm.reasonError ? <p id="ai-approval-reason-error" className="mt-1 text-sm text-feedback-error" role="alert">{decisionForm.reasonError}</p> : null}</> : null}<div className="mt-3 flex flex-wrap justify-end gap-2"><Button variant="outline" type="button" onClick={() => updateDecisionForm({ choice: null, reasonError: null })} disabled={isSubmitting}>Voltar</Button><Button variant={decisionChoice === "approve" ? "success" : "subtle-danger"} type="button" onClick={() => void confirmDecision()} disabled={isSubmitting}>{isSubmitting ? "Registrando…" : decisionChoice === "approve" ? "Confirmar e executar" : "Confirmar recusa"}</Button></div></div> : null}
                <div className="mt-5 flex flex-wrap justify-end gap-2">{resultUncertain ? <Button variant="outline" type="button" onClick={() => void checkSelectedStatus()} disabled={isSubmitting || selectedLoading}>Consultar situação</Button> : null}{canDecide && !decisionChoice ? <><Button variant="subtle-danger" type="button" onClick={() => updateDecisionForm({ choice: "reject", reason: "", error: null, reasonError: null })}>Recusar</Button><Button variant="success" type="button" onClick={() => updateDecisionForm({ choice: "approve", reason: "", error: null, reasonError: null })}>Aprovar e executar</Button></> : null}{canExecute ? <Button variant="standard" type="button" onClick={() => void executeApproved()} disabled={isSubmitting}>Executar operação aprovada</Button> : null}</div>
                {resultUncertain ? <p className="mt-3 font-k2d text-xs text-history-status-observation-text">Uma operação com resultado incerto não pode ser reenviada. Consulte a situação ou aguarde a confirmação da API.</p> : null}
                {selected.requester_id && !isRequester && (isPending(selected.status) || normalizedStatus(selected.status) === "APROVADA_PENDENTE_INTEGRACAO") ? <p className="mt-3 font-k2d text-xs text-history-muted">Somente quem solicitou esta ação pode decidir ou executar a operação.</p> : null}
            </section> : null}
        </section>
    );
}
