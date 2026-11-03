import { useCallback, useState } from "react";
import type { AIPendingAction } from "../../../../types/ai";
import { useAIAssistant } from "../../../../hooks/useAIAssistant";
import Feedback from "../../../ui/Feedback";
import StatusBadge from "../../../ui/StatusBadge";
import Button from "../../../ui/Button";
import ApprovalsPanel from "../ApprovalsPanel/index";
import ChatPanel from "../ChatPanel/index";
import ConversationSidebar from "../ConversationSidebar/index";
import DocumentsPanel from "../DocumentsPanel/index";
import kitchenIcon from "../../../../assets/icons/cozinha.svg";

function serviceStatusLabel(status: string | undefined): string {
    if (!status) return "Verificando serviço";
    const normalized = status.toLocaleLowerCase("pt-BR");
    if (normalized === "ok" || normalized === "available" || normalized === "disponível") return "Disponível";
    if (normalized === "degraded" || normalized === "degradado" || normalized === "parcial") return "Disponibilidade parcial";
    if (["unavailable", "indisponível", "offline"].includes(normalized)) return "Indisponível";
    return status;
}

export default function Assistant() {
    const assistant = useAIAssistant();
    const { state } = assistant;
    const { selectApproval, setTab } = assistant;
    const [historySearch, setHistorySearch] = useState("");
    const hasKitchen = Boolean(assistant.kitchenName && assistant.kitchenName !== "Nenhuma cozinha vinculada");

    // Mantém estável a ação passada ao painel de conversa enquanto o histórico muda.
    const openActionFromChat = useCallback(async (action: AIPendingAction) => {
        setTab("actions");
        if (action.id) await selectApproval(action.id);
    }, [selectApproval, setTab]);

    const healthLabel = serviceStatusLabel(state.health?.status);
    const healthTone = state.healthState === "error" || healthLabel === "Indisponível" ? "danger" : healthLabel === "Disponibilidade parcial" ? "warning" : state.healthState === "ready" ? "success" : "neutral";
    const modes = Object.entries(state.health?.modes ?? {}).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join(" · ");
    const firstQuestion = state.messages.find((message) => message.role === "human")?.content;
    const conversationTitle = state.activeHistory?.titulo?.trim() || state.activeHistory?.summary?.trim() || firstQuestion?.trim() || "Nova conversa";

    function handleSearchHistory(query: string) {
        setHistorySearch(query);
        assistant.searchHistory(query);
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-col gap-2 px-4 pb-4 pt-3 sm:px-6 sm:pt-4 2xl:h-full 2xl:overflow-hidden large-text:h-auto large-text:overflow-visible">
            <header className="flex min-w-0 shrink-0 flex-col gap-3 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                    <img className="size-6 shrink-0 object-contain" src={kitchenIcon} alt="" aria-hidden="true" />
                    <div className="min-w-0"><p className="truncate font-k2d text-base font-semibold text-ink">{assistant.kitchenName}</p><div className="mt-1 flex flex-wrap items-center gap-2"><StatusBadge label={healthLabel} tone={healthTone} /><span className="font-k2d text-xs text-history-muted">Uma cozinha por conversa</span></div></div>
                </div>
                <nav className="flex flex-wrap gap-2" aria-label="Áreas do assistente">
                    <Button variant="ghost" type="button" aria-pressed={state.tab === "documents"} onClick={() => setTab("documents")} className={`min-h-10 rounded-xl border px-4 py-2 font-k2d text-sm font-semibold ${state.tab === "documents" ? "border-brand bg-sidebar-active text-sidebar-purple" : "border-history-border bg-surface text-history-muted hover:border-brand hover:bg-sidebar-active hover:text-sidebar-purple"}`}>Documentos · {state.documents.length}</Button>
                    <Button variant="ghost" type="button" aria-pressed={state.tab === "actions"} onClick={() => setTab("actions")} className={`min-h-10 rounded-xl border px-4 py-2 font-k2d text-sm font-semibold ${state.tab === "actions" ? "border-brand bg-sidebar-active text-sidebar-purple" : "border-history-border bg-surface text-history-muted hover:border-brand hover:bg-sidebar-active hover:text-sidebar-purple"}`}>Ações · {state.inboxTotal}</Button>
                </nav>
            </header>

            {assistant.mockMode ? <Feedback severity="info" className="shrink-0 py-2 text-sm"><strong>Modo demonstrativo:</strong> a configuração atual indica que a IA pode retornar dados simulados. Ações só são executadas quando a API real confirma o modo de negócio.</Feedback> : null}
            {state.health?.warning ? <Feedback severity="info" className="shrink-0 py-2 text-sm">{state.health.warning}</Feedback> : null}
            {state.healthState === "error" ? <Feedback severity="error" className="shrink-0 py-2 text-sm">Não foi possível confirmar a disponibilidade do serviço de IA. Você ainda pode consultar o histórico e os documentos já carregados.</Feedback> : null}
            {!hasKitchen ? <Feedback severity="error" className="shrink-0 py-2 text-sm">Sua conta não tem uma cozinha vinculada. Vincule-se a uma cozinha antes de consultar dados com o assistente.</Feedback> : null}
            {hasKitchen && !assistant.canUseAssistant ? <Feedback severity="error" className="shrink-0 py-2 text-sm">Seu perfil não tem permissão para usar o assistente de IA. Acesso disponível para supervisores, estoquistas e compradores.</Feedback> : null}
            {state.healthState === "ready" && state.health?.storage !== "ok" ? <Feedback severity="info" className="shrink-0 py-2 text-sm">O armazenamento de contexto está indisponível ou degradado. Algumas consultas podem não manter o contexto entre mensagens.</Feedback> : null}

            <div className="grid min-w-0 gap-4 xl:grid-cols-[18rem_minmax(0,1fr)] xl:items-start 2xl:min-h-0 2xl:flex-1 2xl:grid-rows-1 2xl:items-stretch 2xl:overflow-hidden large-text:grid-cols-1 large-text:overflow-visible">
                <ConversationSidebar
                    history={state.history}
                    activeHistory={state.activeHistory}
                    loading={state.historyState === "loading"}
                    error={state.historyError}
                    searchValue={historySearch}
                    onSearch={handleSearchHistory}
                    onNew={() => void assistant.newConversation()}
                    onOpen={(conversation) => void assistant.openHistory(conversation)}
                />

                <div className="min-h-0 min-w-0 2xl:h-full" hidden={state.tab !== "conversation"}>
                    {state.tab === "conversation" ? <ChatPanel
                        messages={state.messages}
                        conversationTitle={conversationTitle}
                        disabled={!assistant.canUseAssistant}
                        ownedDocumentCount={state.documents.filter((document) => document.dono).length}
                        loading={state.isSending}
                        readOnly={state.activeHistory !== null}
                        recording={state.isRecording}
                        error={state.chatError}
                        uploadResults={state.uploadResults}
                        onSendMessage={assistant.sendMessage}
                        onSendAudio={assistant.sendAudio}
                        onStop={assistant.stopGeneration}
                        onRecordingChange={assistant.setRecording}
                        onReviewAction={(action) => void openActionFromChat(action)}
                    /> : null}
                </div>

                <div className="min-h-0 min-w-0" hidden={state.tab !== "documents"}>{state.tab === "documents" ? <DocumentsPanel
                    documents={state.documents}
                    uploadResults={state.uploadResults}
                    loading={state.documentsState === "loading"}
                    error={state.documentsError}
                    isSupervisor={assistant.accessType === "SUPERVISOR"}
                    ownedDocumentCount={state.documents.filter((document) => document.dono).length}
                    onBack={() => assistant.setTab("conversation")}
                    onRefresh={assistant.refreshDocuments}
                    onUpload={assistant.uploadDocuments}
                    onDelete={assistant.deleteDocument}
                /> : null}</div>

                <div className="min-w-0" hidden={state.tab !== "actions"}>{state.tab === "actions" ? <ApprovalsPanel
                    inbox={state.inbox}
                    approvals={state.approvals}
                    total={state.approvalsTotal}
                    page={state.approvalsPage}
                    status={state.approvalsStatus}
                    loading={state.approvalsState === "loading"}
                    error={state.approvalsError}
                    selected={state.selectedApproval}
                    selectedLoading={state.selectedApprovalState === "loading"}
                    selectedError={state.selectedApprovalError}
                    uncertainActionIds={state.uncertainApprovalIds}
                    userId={assistant.userId}
                    onBack={() => assistant.setTab("conversation")}
                    onRefresh={assistant.refreshApprovals}
                    onOpen={assistant.selectApproval}
                    onMarkUncertain={assistant.markApprovalUncertain}
                    onClearSelected={assistant.clearSelectedApproval}
                    onDecision={assistant.decideApproval}
                    onExecute={assistant.executeApproval}
                /> : null}</div>
            </div>

            {modes ? <p className="sr-only" aria-live="polite">Modos ativos do serviço: {modes}</p> : null}
            <div className="sr-only" role="status" aria-live="polite">{historySearch ? `Busca do histórico: ${historySearch}` : ""}</div>
        </div>
    );
}
