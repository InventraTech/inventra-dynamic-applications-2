import type { Requisition, RequisitionItem } from "../../../../types/requisitions";
import { formatRequisitionDate, getRequisitionStatusPresentation, getRequisitionTypeLabel } from "../../../../utils/requisitionPresentation";
import StatusBadge from "../../../ui/StatusBadge";
import Feedback from "../../../ui/Feedback";
import RequisitionItemForm from "../RequisitionItemForm";
import RequisitionItemsPanel from "../RequisitionItemsPanel";
import RequisitionActionPanel from "../RequisitionActionPanel";

interface RequisitionDetailViewProps {
    requisition: Requisition;
    items: RequisitionItem[];
    kitchenId: number;
    userId: string | null;
    canReview: boolean;
    created: boolean;
    onChanged: () => Promise<void> | void;
}

export default function RequisitionDetailView({ requisition, items, kitchenId, userId, canReview, created, onChanged }: RequisitionDetailViewProps) {
    const owner = requisition.requester.id === userId;
    const canEdit = requisition.status === "DRAFT" && (owner || canReview);
    const status = getRequisitionStatusPresentation(requisition.status);

    return (
        <section className="grid min-w-0 gap-5" aria-labelledby="requisition-detail-heading">
            <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
                <div className="grid min-w-0 gap-1"><div className="flex min-w-0 flex-wrap items-center gap-3"><h2 id="requisition-detail-heading" className="font-k2d text-2xl font-bold text-ink">Requisição #{requisition.id}</h2><StatusBadge label={status.label} tone={status.tone} /></div><p className="text-sm text-history-muted">{getRequisitionTypeLabel(requisition.type)} · {requisition.kitchen.name}</p></div>
                <div className="grid gap-1 text-sm text-history-muted sm:text-right"><span>Criada em {formatRequisitionDate(requisition.createdAt)}</span><span>Origem ou destino: {requisition.origin}</span></div>
            </header>
            {created && <Feedback severity="success">Rascunho criado. Adicione os itens da cozinha e envie para análise quando estiver pronto.</Feedback>}
            <section className="grid min-w-0 gap-3 rounded-3xl bg-surface p-4 shadow-history-card sm:grid-cols-2 sm:p-6" aria-labelledby="requisition-information-heading">
                <h3 id="requisition-information-heading" className="sm:col-span-2 font-k2d text-lg font-bold text-ink">Informações da requisição</h3>
                <div className="grid min-w-0 gap-1"><span className="text-sm text-history-muted">Solicitante</span><strong className="wrap-anywhere text-ink">{requisition.requester.name}</strong></div>
                <div className="grid min-w-0 gap-1"><span className="text-sm text-history-muted">Aprovador</span><strong className="wrap-anywhere text-ink">{requisition.approver?.name ?? "Aguardando decisão"}</strong></div>
                {requisition.reason && <div className="grid min-w-0 gap-1 sm:col-span-2"><span className="text-sm text-history-muted">Motivo registrado</span><p className="wrap-anywhere text-ink">{requisition.reason}</p></div>}
            </section>
            <RequisitionItemsPanel requisition={requisition} items={items} canEdit={canEdit} onChanged={onChanged} />
            {canEdit && <section className="rounded-3xl bg-surface p-4 shadow-history-card sm:p-6"><RequisitionItemForm requisition={requisition} kitchenId={kitchenId} onAdded={onChanged} /></section>}
            <RequisitionActionPanel requisition={requisition} userId={userId} canReview={canReview} itemCount={items.length} onChanged={onChanged} />
        </section>
    );
}
