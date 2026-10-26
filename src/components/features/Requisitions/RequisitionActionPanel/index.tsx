import { useState, type FormEvent } from "react";
import { cancelRequisition, submitRequisition } from "../../../../services/requisitions";
import type { Requisition } from "../../../../types/requisitions";
import { validateDecisionReason } from "../../../../utils/requisitionValidation";
import Button from "../../../ui/Button";
import Dialog from "../../../ui/Dialog";
import Feedback from "../../../ui/Feedback";

type DialogAction = "submit" | "cancel" | null;

interface RequisitionActionPanelProps {
    requisition: Requisition;
    userId: string | null;
    canReview: boolean;
    itemCount: number;
    onChanged: () => Promise<void> | void;
}

export default function RequisitionActionPanel({ requisition, userId, canReview, itemCount, onChanged }: RequisitionActionPanelProps) {
    const [dialogAction, setDialogAction] = useState<DialogAction>(null);
    const [reason, setReason] = useState("");
    const [reasonError, setReasonError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ severity: "error" | "success"; message: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const isOwner = requisition.requester.id === userId;
    const canManage = isOwner || canReview;
    const canSubmit = requisition.status === "DRAFT" && canManage;
    const canCancel = canManage && (["DRAFT", "UNDER_REVIEW"].includes(requisition.status) || (requisition.status === "APPROVED" && canReview));
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
        if (dialogAction === "cancel") {
            const error = validateDecisionReason(reason);
            setReasonError(error);
            if (error) return;
        }

        setSubmitting(true);
        try {
            if (dialogAction === "submit") await submitRequisition(requisition.id);
            else await cancelRequisition(requisition.id, reason.trim());
            const message = dialogAction === "submit" ? "Requisição enviada para análise." : "Requisição cancelada.";
            closeDialog(false);
            await onChanged();
            setFeedback({ severity: "success", message });
        } catch (error: unknown) {
            setFeedback({ severity: "error", message: error instanceof Error ? error.message : "Não foi possível concluir a ação. Os dados foram mantidos." });
        } finally {
            setSubmitting(false);
        }
    }

    if (!canSubmit && !canCancel) return null;

    return (
        <>
            <section className="grid min-w-0 gap-3 rounded-3xl bg-surface p-4 shadow-history-card sm:p-6" aria-labelledby="requisition-actions-heading">
                <h3 id="requisition-actions-heading" className="font-k2d text-lg font-bold text-ink">Próximas ações</h3>
                {canSubmit && <div className="grid gap-3"><Button variant="primary" type="button" disabled={itemCount === 0} onClick={() => setDialogAction("submit")} className="min-h-11 rounded-xl px-5">Enviar para análise</Button>{itemCount === 0 && <p className="text-sm text-history-muted">Adicione ao menos um item antes de enviar.</p>}</div>}
                {canCancel && <Button variant="link" type="button" onClick={() => setDialogAction("cancel")} className="justify-self-start text-feedback-error">Cancelar requisição</Button>}
                {feedback && <Feedback severity={feedback.severity}>{feedback.message}</Feedback>}
            </section>

            <Dialog open={dialogAction !== null} onOpenChange={closeDialog} aria-labelledby="requisition-action-title" aria-describedby="requisition-action-description">
                <form className="grid gap-4 p-5 sm:p-6" onSubmit={handleAction}>
                    <div className="grid gap-2"><h3 id="requisition-action-title" className="font-k2d text-xl font-bold text-ink">{dialogAction === "submit" ? "Enviar para análise?" : "Cancelar requisição?"}</h3><p id="requisition-action-description" className="leading-relaxed text-history-muted">{dialogAction === "submit" ? "O supervisor poderá analisar os itens. Depois do envio, o rascunho não poderá mais ser editado." : approvedCancellation ? "A requisição aprovada será cancelada e as quantidades baixadas serão devolvidas ao estoque após a confirmação do backend." : "O rascunho ou a requisição em análise será cancelada. Essa ação não pode ser desfeita."}</p></div>
                    {dialogAction === "cancel" && <div className="grid gap-2"><label htmlFor="requisition-cancel-reason" className="font-semibold text-ink">Motivo do cancelamento <span aria-hidden="true">*</span></label><textarea id="requisition-cancel-reason" rows={4} maxLength={255} required value={reason} aria-invalid={reasonError ? true : undefined} aria-describedby={reasonError ? "requisition-cancel-reason-error" : "requisition-cancel-reason-hint"} onChange={(event) => { setReason(event.target.value); if (reasonError) setReasonError(null); }} className="min-w-0 rounded-xl border border-history-border bg-surface px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" /><span id="requisition-cancel-reason-hint" className="text-right text-xs text-history-muted">{reason.length}/255</span>{reasonError && <p id="requisition-cancel-reason-error" className="text-sm text-feedback-error">{reasonError}</p>}</div>}
                    <div className="flex flex-wrap justify-end gap-3"><Button variant="link" type="button" onClick={() => closeDialog(false)} disabled={submitting}>Voltar</Button><Button variant="primary" type="submit" disabled={submitting} aria-busy={submitting} className={dialogAction === "cancel" ? "min-h-11 rounded-xl bg-feedback-error px-5" : "min-h-11 rounded-xl px-5"}>{submitting ? "Salvando…" : dialogAction === "submit" ? "Enviar requisição" : "Confirmar cancelamento"}</Button></div>
                </form>
            </Dialog>
        </>
    );
}
