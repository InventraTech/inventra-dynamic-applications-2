import type { Requisition, RequisitionItem } from "../../../../types/requisitions";
import { formatRequisitionDate, getRequisitionStatusPresentation, getRequisitionTypeLabel } from "../../../../utils/requisitionPresentation";
import StatusBadge from "../../../ui/StatusBadge";
import Feedback from "../../../ui/Feedback";
import RequisitionItemsPanel from "../RequisitionItemsPanel";
import RequisitionActionPanel from "../RequisitionActionPanel";
import RequisitionSummary from "../RequisitionSummary";
import Breadcrumb from "../../../ui/Breadcrumb";
import { Link } from "react-router-dom";

interface RequisitionDetailViewProps {
    requisition: Requisition;
    items: RequisitionItem[];
    userId: string | null;
    canReview: boolean;
    created: boolean;
    onChanged: () => Promise<void> | void;
}

export default function RequisitionDetailView({ requisition, items, userId, canReview, created, onChanged }: RequisitionDetailViewProps) {
    const owner = requisition.requester.id === userId;
    const canEdit = requisition.status === "DRAFT" && (owner || canReview);
    const status = getRequisitionStatusPresentation(requisition.status);

    return (
        <section className="grid min-w-0 gap-5" aria-labelledby="requisition-detail-heading">
            <Breadcrumb items={[{ label: "Requisições", href: "/requisicoes" }, { label: `Requisição #${requisition.id}` }]} />
            <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
                <div className="grid min-w-0 gap-1"><div className="flex min-w-0 flex-wrap items-center gap-3"><h2 id="requisition-detail-heading" className="font-k2d text-2xl font-bold text-ink">Requisição #{requisition.id}</h2><StatusBadge label={status.label} tone={status.tone} /></div><p className="text-sm text-history-muted">{getRequisitionTypeLabel(requisition.type)} · {requisition.kitchen.name}</p></div>
                <Link className="rounded-xl border border-history-border bg-surface px-4 py-2 text-sm font-semibold text-brand transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/requisicoes">Voltar à lista</Link>
            </header>
            {created && <Feedback severity="success">Rascunho criado. Adicione os itens da cozinha e envie para análise quando estiver pronto.</Feedback>}
            <div className="grid min-w-0 items-start gap-5 lg:grid-cols-3">
            <div className="grid min-w-0 gap-5 lg:col-span-2">
            <section className="grid min-w-0 gap-3 rounded-3xl bg-surface p-4 shadow-history-card sm:grid-cols-2 sm:p-6" aria-labelledby="requisition-information-heading">
                <h3 id="requisition-information-heading" className="sm:col-span-2 font-k2d text-lg font-bold text-ink">Informações da requisição</h3>
                <div className="grid min-w-0 gap-1"><span className="text-sm text-history-muted">Solicitante</span><strong className="wrap-anywhere text-ink">{requisition.requester.name}</strong><span className="text-xs text-history-muted">Criada em {formatRequisitionDate(requisition.createdAt)}</span></div>
                <div className="grid min-w-0 gap-1"><span className="text-xs font-bold uppercase tracking-wide text-history-muted">Cozinha de origem</span><strong className="wrap-anywhere text-ink">{requisition.kitchen.name}</strong><span className="text-sm text-history-muted">{requisition.type === "TRANSFER" ? "Destino" : "Origem ou contexto"}: {requisition.origin}</span></div>
                {requisition.approver && <div className="grid min-w-0 gap-1 sm:col-span-2"><span className="text-sm text-history-muted">Aprovador</span><strong className="wrap-anywhere text-ink">{requisition.approver.name}</strong></div>}
                {requisition.reason && <div className="grid min-w-0 gap-1 sm:col-span-2"><span className="text-sm text-history-muted">Motivo registrado</span><p className="wrap-anywhere text-ink">{requisition.reason}</p></div>}
            </section>
            <section className="grid min-w-0 gap-3">
                {canEdit && <div className="flex justify-end"><Link className="rounded-xl border border-brand bg-surface px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={`/requisicoes/${requisition.id}/editar`}>Adicionar item</Link></div>}
                <RequisitionItemsPanel requisition={requisition} items={items} canEdit={canEdit} onChanged={onChanged} />
            </section>
            </div>
            <aside className="grid min-w-0 gap-4 lg:col-start-3 lg:row-start-1">
                <RequisitionSummary requisition={requisition} items={items} heading={requisition.status === "DRAFT" ? "Resumo do rascunho" : canReview && requisition.status === "UNDER_REVIEW" ? "Análise do supervisor" : "Resumo da requisição"} />
                <RequisitionActionPanel requisition={requisition} userId={userId} canReview={canReview} itemCount={items.length} onChanged={onChanged} />
                {requisition.status === "UNDER_REVIEW" && (requisition.type === "CONSUMPTION" || requisition.type === "TRANSFER") && <Feedback severity="info">A aprovação desta requisição baixa os itens do estoque da cozinha. A transferência não cria entrada automática no destino.</Feedback>}
                {requisition.status === "UNDER_REVIEW" && <div className="grid gap-1 rounded-2xl bg-linear-to-r from-brand-strong to-brand p-4 text-on-brand"><strong className="font-k2d">Decisão com contexto</strong><p className="text-sm leading-relaxed">Confira os itens, as quantidades e as observações antes de aprovar ou rejeitar.</p></div>}
                {requisition.status === "DRAFT" && requisition.type === "PURCHASE" && <Feedback severity="info">A compra aprovada registra a decisão, mas não dá entrada automática no estoque.</Feedback>}
                {requisition.status === "DRAFT" && <div className="grid gap-1 rounded-2xl bg-linear-to-r from-brand-strong to-brand p-4 text-on-brand"><strong className="font-k2d">Pedido organizado, cozinha pronta</strong><p className="text-sm leading-relaxed">Confira os itens e as estimativas antes de enviar para análise.</p></div>}
            </aside>
            </div>
        </section>
    );
}
