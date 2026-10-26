import { useState, type FormEvent } from "react";
import { approveRequisition, cancelRequisition, rejectRequisition, submitRequisition } from "../../../services/requisitions";
import type { Requisition } from "../../../types/requisitions";
import { validateDecisionReason } from "../../../utils/requisitionValidation";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import Feedback from "../../ui/Feedback";

type DialogAction = "submit" | "cancel" | "approve" | "reject" | null;

interface RequisitionActionPanelProps {
    requisition: Requisition;
    userId: string | null;
    canReview: boolean;
    itemCount: number;
    onChanged: () => Promise<void> | void;
    onSaveDraft?: () => void;
    onActionCompleted?: () => void;
    embedded?: boolean;
    showCancel?: boolean;
    showHeading?: boolean;
}

export default function RequisitionActionPanel({ requisition, userId, canReview, itemCount, onChanged, onSaveDraft, onActionCompleted, embedded = false, showCancel = true, showHeading = true }: RequisitionActionPanelProps) {
    const [dialogAction, setDialogAction] = useState<DialogAction>(null);
    const [reason, setReason] = useState("");
    const [reasonError, setReasonError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ severity: "error" | "success"; message: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const isOwner = requisition.requester.id === userId;
    const canManage = isOwner || canReview;
    const canSubmit = requisition.status === "DRAFT" && canManage;
    const canCancel = showCancel && canManage && (["DRAFT", "UNDER_REVIEW"].includes(requisition.status) || (requisition.status === "APPROVED" && canReview));
    const canApproveOrReject = canReview && requisition.status === "UNDER_REVIEW";
    const approvedCancellation = requisition.status === "APPROVED";

    function closeDialog(open: boolean) {
        if (open) return;
        setDialogAction(null);
        setReason("");
        setReasonError(null);
    }

    async function handleAction(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!dialogAction) return;
        setFeedback(null);
        if (dialogAction === "cancel" || dialogAction === "reject") {
            const error = validateDecisionReason(reason);
            setReasonError(error);
            if (error) return;
        }

        setSubmitting(true);
        try {
            if (dialogAction === "submit") await submitRequisition(requisition.id);
            else if (dialogAction === "approve") await approveRequisition(requisition.id);
            else if (dialogAction === "reject") await rejectRequisition(requisition.id, reason.trim());
            else await cancelRequisition(requisition.id, reason.trim());
            const message = dialogAction === "submit" ? "Requisição enviada para análise." : dialogAction === "approve" ? "Requisição aprovada." : dialogAction === "reject" ? "Requisição rejeitada." : "Requisição cancelada.";
            closeDialog(false);
            await onChanged();
            setFeedback({ severity: "success", message });
            onActionCompleted?.();
        } catch (error: unknown) {
            setFeedback({ severity: "error", message: error instanceof Error ? error.message : "Não foi possível concluir a ação. Os dados foram mantidos." });
        } finally {
            setSubmitting(false);
        }
    }

    if (!canSubmit && !canCancel && !canApproveOrReject) return null;

    return (
        <>
            <section className={`grid min-w-0 gap-3 ${embedded ? "border-t border-history-border pt-4" : "rounded-3xl bg-surface p-4 shadow-history-card sm:p-6"}`} aria-labelledby={showHeading ? "requisition-actions-heading" : undefined} aria-label={showHeading ? undefined : "Ações da requisição"}>
                {showHeading && <h3 id="requisition-actions-heading" className="font-k2d text-lg font-bold text-ink">Próximas ações</h3>}
                {canSubmit && <div className="grid gap-3">{onSaveDraft && <Button variant="primary" type="button" onClick={onSaveDraft} className="min-h-11 rounded-xl border border-brand bg-surface px-5 text-brand hover:bg-sidebar-active">Salvar rascunho</Button>}<Button variant="primary" type="button" disabled={itemCount === 0} onClick={() => setDialogAction("submit")} className="min-h-11 rounded-xl px-5">Enviar para análise</Button>{itemCount === 0 && <p className="text-sm text-history-muted">Adicione ao menos um item antes de enviar.</p>}{onSaveDraft && <p className="text-xs leading-relaxed text-history-muted">Você pode sair e continuar o rascunho depois.</p>}</div>}
                {canApproveOrReject && <div className="grid gap-3 sm:grid-cols-2"><Button variant="primary" type="button" disabled={itemCount === 0} onClick={() => setDialogAction("approve")} className="min-h-11 rounded-xl bg-feedback-success px-5">Aprovar requisição</Button><Button variant="link" type="button" onClick={() => setDialogAction("reject")} className="min-h-11 justify-center rounded-xl bg-feedback-error-bg px-5 text-feedback-error">Rejeitar requisição</Button></div>}
                {canCancel && <Button variant="link" type="button" onClick={() => setDialogAction("cancel")} className="min-h-11 w-full justify-center rounded-xl bg-feedback-error-bg px-5 text-feedback-error">Cancelar requisição</Button>}
                {feedback && <Feedback severity={feedback.severity}>{feedback.message}</Feedback>}
            </section>

            <Dialog open={dialogAction !== null} onOpenChange={closeDialog} aria-labelledby="requisition-action-title" aria-describedby="requisition-action-description">
                <form className="grid gap-4 p-5 sm:p-6" onSubmit={handleAction}>
                    <div className="grid gap-2"><h3 id="requisition-action-title" className="font-k2d text-xl font-bold text-ink">{dialogAction === "submit" ? "Enviar para análise?" : dialogAction === "cancel" ? "Cancelar requisição?" : dialogAction === "approve" ? "Aprovar requisição?" : "Rejeitar requisição?"}</h3><p id="requisition-action-description" className="leading-relaxed text-history-muted">{dialogAction === "submit" ? "O supervisor poderá analisar os itens. Depois do envio, o rascunho não poderá mais ser editado." : dialogAction === "cancel" ? approvedCancellation ? "A requisição aprovada será cancelada e o backend devolverá ao estoque as quantidades baixadas." : "O rascunho ou a requisição em análise será cancelada. Essa ação não pode ser desfeita." : dialogAction === "approve" ? requisition.type === "PURCHASE" ? "A aprovação registra a decisão, mas não cria entrada automática no estoque." : requisition.type === "TRANSFER" ? "A aprovação baixa os itens da cozinha atual. O destino informado não recebe uma entrada automática." : "A aprovação baixa os itens do estoque da cozinha. O backend valida a disponibilidade antes de confirmar." : "A rejeição encerra a análise e registra o motivo informado."}</p></div>
                    {(dialogAction === "cancel" || dialogAction === "reject") && <div className="grid gap-2"><label htmlFor="requisition-decision-reason" className="font-semibold text-ink">{dialogAction === "cancel" ? "Motivo do cancelamento" : "Motivo da rejeição"} <span aria-hidden="true">*</span></label><textarea id="requisition-decision-reason" rows={4} maxLength={255} required value={reason} aria-invalid={reasonError ? true : undefined} aria-describedby={reasonError ? "requisition-decision-reason-error" : "requisition-decision-reason-hint"} onChange={(event) => { setReason(event.target.value); if (reasonError) setReasonError(null); }} className="min-w-0 rounded-xl border border-history-border bg-surface px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" /><span id="requisition-decision-reason-hint" className="text-right text-xs text-history-muted">{reason.length}/255</span>{reasonError && <p id="requisition-decision-reason-error" className="text-sm text-feedback-error">{reasonError}</p>}</div>}
                    <div className="flex flex-wrap justify-end gap-3"><Button variant="link" type="button" onClick={() => closeDialog(false)} disabled={submitting}>Voltar</Button><Button variant="primary" type="submit" disabled={submitting || (dialogAction === "approve" && itemCount === 0)} aria-busy={submitting} className={dialogAction === "cancel" || dialogAction === "reject" ? "min-h-11 rounded-xl bg-feedback-error px-5" : dialogAction === "approve" ? "min-h-11 rounded-xl bg-feedback-success px-5" : "min-h-11 rounded-xl px-5"}>{submitting ? "Salvando…" : dialogAction === "submit" ? "Enviar requisição" : dialogAction === "approve" ? "Confirmar aprovação" : dialogAction === "reject" ? "Confirmar rejeição" : "Confirmar cancelamento"}</Button></div>
                </form>
            </Dialog>
        </>
    );
}
