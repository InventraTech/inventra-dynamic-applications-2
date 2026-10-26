import type { Requisition, RequisitionItem } from "../../../types/requisitions";
import { formatRequisitionCurrency, getRequisitionStatusPresentation, getRequisitionTypeLabel } from "../../../utils/requisitionPresentation";
import StatusBadge from "../../ui/StatusBadge";
import UserAvatar from "../../ui/UserAvatar";

interface RequisitionSummaryProps {
    requisition: Requisition;
    items: RequisitionItem[];
    heading?: string;
    reviewerName?: string;
    reviewerPhotoUrl?: string | null;
    embedded?: boolean;
}

export default function RequisitionSummary({ requisition, items, heading = "Resumo", reviewerName, reviewerPhotoUrl, embedded = false }: RequisitionSummaryProps) {
    const status = getRequisitionStatusPresentation(requisition.status);
    const hasUnpricedItems = items.some((item) => item.estimatedPrice === null);
    const isSupervisorReview = requisition.status === "UNDER_REVIEW" && Boolean(reviewerName);
    const actorName = isSupervisorReview ? reviewerName ?? "Supervisor" : requisition.requester.name;
    const actorPhoto = isSupervisorReview ? reviewerPhotoUrl : requisition.requester.photoUrl;
    const actorRole = isSupervisorReview ? "Supervisor da cozinha" : "Solicitante da cozinha";

    return (
        <section className={`grid min-w-0 gap-4 ${embedded ? "" : "rounded-3xl bg-surface p-4 shadow-history-card sm:p-5"}`} aria-labelledby="requisition-summary-heading">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><h3 id="requisition-summary-heading" className="font-k2d text-lg font-bold text-ink">{heading}</h3><StatusBadge label={status.label} tone={status.tone} /></div>
            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-sidebar-active px-3 py-1 text-xs font-semibold text-heading">{getRequisitionTypeLabel(requisition.type)}</span><span className="rounded-full bg-history-card-header px-3 py-1 text-xs text-history-muted">{items.length} {items.length === 1 ? "item" : "itens"}</span></div>
            <div className="grid min-w-0 gap-1"><span className="text-sm text-history-muted">Estimativa da requisição{hasUnpricedItems ? " · parcial" : ""}</span><strong className="wrap-anywhere font-k2d text-3xl font-bold text-brand">{formatRequisitionCurrency(requisition.estimatedTotal)}</strong><span className="text-xs leading-relaxed text-history-muted">Valor previsto; não representa pagamento.</span></div>
            <div className="flex min-w-0 items-center gap-3 border-t border-history-border pt-4"><UserAvatar name={actorName} photoUrl={actorPhoto} className="size-11 text-sm" /><div className="grid min-w-0 gap-1"><strong className="wrap-anywhere text-ink">{actorName}</strong><span className="text-xs text-history-muted">{actorRole}</span></div></div>
        </section>
    );
}
