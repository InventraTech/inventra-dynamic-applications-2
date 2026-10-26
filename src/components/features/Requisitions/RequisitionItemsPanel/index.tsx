import { useState } from "react";
import { removeRequisitionItem } from "../../../../services/requisitions";
import type { Requisition, RequisitionItem } from "../../../../types/requisitions";
import { formatRequisitionCurrency } from "../../../../utils/requisitionPresentation";
import Button from "../../../ui/Button";
import Feedback from "../../../ui/Feedback";

interface RequisitionItemsPanelProps {
    requisition: Requisition;
    items: RequisitionItem[];
    canEdit: boolean;
    onChanged: () => Promise<void> | void;
}

export default function RequisitionItemsPanel({ requisition, items, canEdit, onChanged }: RequisitionItemsPanelProps) {
    const [removingItemId, setRemovingItemId] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ severity: "error" | "success"; message: string } | null>(null);

    async function handleRemove(item: RequisitionItem) {
        setFeedback(null);
        setRemovingItemId(item.id);
        try {
            await removeRequisitionItem(requisition.id, item.id);
            await onChanged();
            setFeedback({ severity: "success", message: `${item.product.name} foi removido do rascunho.` });
        } catch (error: unknown) {
            setFeedback({ severity: "error", message: error instanceof Error ? error.message : "Não foi possível remover o item." });
        } finally {
            setRemovingItemId(null);
        }
    }

    return (
        <section className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-6" aria-labelledby="requisition-items-heading">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><h3 id="requisition-items-heading" className="font-k2d text-lg font-bold text-ink">Itens da requisição</h3><span className="rounded-full bg-sidebar-active px-3 py-1 text-sm font-semibold text-heading">{items.length} {items.length === 1 ? "item" : "itens"}</span></div>
            {items.length === 0 ? <p className="rounded-xl bg-history-card-header p-4 text-sm text-history-muted">Este rascunho ainda não tem itens.</p> : (
                <ul className="grid min-w-0 list-none gap-3 p-0">
                    {items.map((item) => (
                        <li key={item.id} className="grid min-w-0 gap-3 border-b border-history-border pb-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                            <div className="grid min-w-0 gap-1"><strong className="wrap-anywhere text-ink">{item.product.name}</strong><span className="text-sm text-history-muted">Quantidade: {item.quantity}</span>{item.suggestedSupplier && <span className="text-sm text-history-muted">Fornecedor sugerido: {item.suggestedSupplier.legalName}</span>}{item.note && <span className="text-sm text-history-muted wrap-anywhere">Observação: {item.note}</span>}</div>
                            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 sm:justify-end"><span className="text-sm font-semibold text-brand">{item.estimatedPrice === null ? "Preço não informado" : formatRequisitionCurrency(item.estimatedPrice * item.quantity)}</span>{canEdit && <Button variant="link" type="button" className="text-feedback-error" disabled={removingItemId !== null} onClick={() => void handleRemove(item)} aria-label={`Remover ${item.product.name} do rascunho`}>{removingItemId === item.id ? "Removendo…" : "Remover item"}</Button>}</div>
                        </li>
                    ))}
                </ul>
            )}
            {feedback && <Feedback severity={feedback.severity}>{feedback.message}</Feedback>}
        </section>
    );
}
