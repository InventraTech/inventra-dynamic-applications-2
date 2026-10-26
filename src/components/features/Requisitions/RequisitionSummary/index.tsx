import type { Requisition, RequisitionItem } from "../../../../types/requisitions";
import { formatRequisitionCurrency, formatRequisitionDate, getRequisitionStatusPresentation, getRequisitionTypeLabel } from "../../../../utils/requisitionPresentation";
import StatusBadge from "../../../ui/StatusBadge";

interface RequisitionSummaryProps {
    requisition: Requisition;
    items: RequisitionItem[];
}

export default function RequisitionSummary({ requisition, items }: RequisitionSummaryProps) {
    const status = getRequisitionStatusPresentation(requisition.status);
    const hasUnpricedItems = items.some((item) => item.estimatedPrice === null);

    return (
        <section className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5" aria-labelledby="requisition-summary-heading">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><h3 id="requisition-summary-heading" className="font-k2d text-lg font-bold text-ink">Resumo</h3><StatusBadge label={status.label} tone={status.tone} /></div>
            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-sidebar-active px-3 py-1 text-xs font-semibold text-heading">{getRequisitionTypeLabel(requisition.type)}</span><span className="rounded-full bg-history-card-header px-3 py-1 text-xs text-history-muted">{items.length} {items.length === 1 ? "item" : "itens"}</span></div>
            <div className="grid min-w-0 gap-1"><span className="text-sm text-history-muted">Estimativa da requisição{hasUnpricedItems ? " · parcial" : ""}</span><strong className="wrap-anywhere font-k2d text-2xl font-bold text-brand">{formatRequisitionCurrency(requisition.estimatedTotal)}</strong><span className="text-xs leading-relaxed text-history-muted">Valor previsto; não representa pagamento.</span></div>
            <dl className="grid min-w-0 gap-3 border-t border-history-border pt-4 text-sm">
                <div className="grid min-w-0 gap-1"><dt className="text-history-muted">Solicitante</dt><dd className="m-0 wrap-anywhere font-semibold text-ink">{requisition.requester.name}</dd></div>
                <div className="grid min-w-0 gap-1"><dt className="text-history-muted">Criada em</dt><dd className="m-0 font-semibold text-ink">{formatRequisitionDate(requisition.createdAt)}</dd></div>
                <div className="grid min-w-0 gap-1"><dt className="text-history-muted">Cozinha</dt><dd className="m-0 wrap-anywhere font-semibold text-ink">{requisition.kitchen.name}</dd></div>
            </dl>
        </section>
    );
}
