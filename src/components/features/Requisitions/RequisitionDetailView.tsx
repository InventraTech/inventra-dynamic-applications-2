import type { Requisition, RequisitionItem } from "../../../types/requisitions";
import { formatRequisitionDate, getRequisitionStatusPresentation, getRequisitionTypeLabel } from "../../../utils/requisitionPresentation";
import StatusBadge from "../../ui/StatusBadge";
import Feedback from "../../ui/Feedback";
import RequisitionItemsPanel from "./RequisitionItemsPanel";
import RequisitionActionPanel from "./RequisitionActionPanel";
import RequisitionSummary from "./RequisitionSummary";
import Breadcrumb from "../../ui/Breadcrumb";
import UserAvatar from "../../ui/UserAvatar";

interface RequisitionDetailViewProps {
    requisition: Requisition;
    items: RequisitionItem[];
    userId: string | null;
    reviewerName: string;
    reviewerPhotoUrl: string | null;
    canReview: boolean;
    created: boolean;
    onChanged: () => Promise<void> | void;
}

export default function RequisitionDetailView({ requisition, items, userId, reviewerName, reviewerPhotoUrl, canReview, created, onChanged }: RequisitionDetailViewProps) {
    const owner = requisition.requester.id === userId;
    const canEdit = requisition.status === "DRAFT" && (owner || canReview);
    const status = getRequisitionStatusPresentation(requisition.status);

    return (
        <section className="grid min-w-0 gap-5" aria-labelledby="requisition-detail-heading">
            <Breadcrumb items={[{ label: "Requisições", href: "/requisicoes" }, { label: `Requisição #${requisition.id}` }]} backHref="/requisicoes" backLabel="Voltar para requisições" />
            <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
                <div className="grid min-w-0 gap-1"><div className="flex min-w-0 flex-wrap items-center gap-3"><h2 id="requisition-detail-heading" className="font-k2d text-2xl font-bold text-ink">Requisição #{requisition.id}</h2><StatusBadge label={status.label} tone={status.tone} /></div><p className="text-sm text-history-muted">{getRequisitionTypeLabel(requisition.type)} · {requisition.kitchen.name}</p></div>
            </header>
            {created && <Feedback severity="success">Rascunho criado. Adicione os itens da cozinha e envie para análise quando estiver pronto.</Feedback>}
            <div className="grid min-w-0 items-start gap-5 xl:grid-cols-3">
                <div className="grid min-w-0 gap-5 xl:col-span-2">
                    <section className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:grid-cols-2 sm:p-6" aria-labelledby="requisition-information-heading">
                        <h3 id="requisition-information-heading" className="font-k2d text-lg font-bold text-ink sm:col-span-2">Informações da requisição</h3>
                        <div className="flex min-w-0 items-center gap-3"><UserAvatar name={requisition.requester.name} photoUrl={requisition.requester.photoUrl} className="size-10 text-sm" /><div className="grid min-w-0 gap-1"><strong className="wrap-anywhere text-ink">{requisition.requester.name}</strong><span className="text-xs text-history-muted">Criada em {formatRequisitionDate(requisition.createdAt)}</span></div></div>
                        <div className="grid min-w-0 gap-1"><span className="text-xs font-bold uppercase tracking-wide text-history-muted">Cozinha de origem</span><strong className="wrap-anywhere text-ink">{requisition.kitchen.name}</strong><span className="text-sm text-history-muted">{requisition.type === "CONSUMPTION" ? "Destino do consumo" : requisition.type === "TRANSFER" ? "Destino da transferência" : "Origem"}: {requisition.origin}</span></div>
                        {requisition.approver && <div className="grid min-w-0 gap-1 sm:col-span-2"><span className="text-sm text-history-muted">Aprovador</span><strong className="wrap-anywhere text-ink">{requisition.approver.name}</strong></div>}
                        {requisition.reason && <div className="grid min-w-0 gap-1 sm:col-span-2"><span className="text-sm text-history-muted">Motivo registrado</span><p className="wrap-anywhere text-ink">{requisition.reason}</p></div>}
                    </section>
                    <RequisitionItemsPanel requisition={requisition} items={items} canEdit={canEdit} onChanged={onChanged} addItemTo={canEdit ? `/requisicoes/${requisition.id}/editar` : undefined} />
                    {requisition.status === "DRAFT" && <Feedback severity="info">Precisa corrigir um item? Remova e adicione novamente com os dados corretos. O rascunho pode ser retomado depois.</Feedback>}
                    {requisition.status === "UNDER_REVIEW" && <Feedback severity="info">{canReview ? "Pedido em análise. Esta requisição está aguardando sua decisão como supervisor." : "Pedido em análise. A decisão de aprovar ou rejeitar aparece somente para o supervisor."}</Feedback>}
                </div>
                <aside className="grid min-w-0 content-start gap-4 xl:col-start-3 xl:row-start-1">
                    <div className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5">
                        <RequisitionSummary requisition={requisition} items={items} heading={requisition.status === "DRAFT" ? "Resumo do rascunho" : canReview && requisition.status === "UNDER_REVIEW" ? "Análise do supervisor" : "Resumo da requisição"} reviewerName={reviewerName} reviewerPhotoUrl={reviewerPhotoUrl} embedded />
                        <RequisitionActionPanel requisition={requisition} userId={userId} canReview={canReview} itemCount={items.length} onChanged={onChanged} embedded showHeading={false} />
                    </div>
                    {requisition.status === "UNDER_REVIEW" && (requisition.type === "CONSUMPTION" || requisition.type === "TRANSFER") && <div className="grid gap-1 rounded-2xl border border-history-status-observation-text/20 bg-history-status-observation-bg p-4 text-history-status-observation-text"><strong className="font-k2d">A aprovação já baixa o estoque</strong><p className="text-sm leading-relaxed">Esta requisição é de {getRequisitionTypeLabel(requisition.type).toLocaleLowerCase("pt-BR")} e descontará as quantidades da cozinha.</p></div>}
                    {requisition.status === "UNDER_REVIEW" && <div className="grid gap-1 rounded-2xl bg-linear-to-r from-brand-strong to-brand p-4 text-on-brand"><strong className="font-k2d">Decisão com contexto</strong><p className="text-sm leading-relaxed">Use os detalhes e as observações para avaliar a necessidade da cozinha.</p></div>}
                    {requisition.status === "DRAFT" && <div className="grid gap-1 rounded-2xl bg-linear-to-r from-brand-strong to-brand p-4 text-on-brand"><strong className="font-k2d">Pedido organizado, cozinha pronta</strong><p className="text-sm leading-relaxed">Confira os itens antes de enviar para o supervisor.</p></div>}
                    {requisition.status === "DRAFT" && requisition.type === "PURCHASE" && <Feedback severity="info">Compra aprovada não é entrada. A entrada da mercadoria acontece em outra etapa.</Feedback>}
                </aside>
            </div>
        </section>
    );
}
