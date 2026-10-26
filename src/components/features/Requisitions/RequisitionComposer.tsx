import { Link, useNavigate } from "react-router-dom";
import type { Requisition, RequisitionItem } from "../../../types/requisitions";
import Breadcrumb from "../../ui/Breadcrumb";
import Feedback from "../../ui/Feedback";
import RequisitionActionPanel from "./RequisitionActionPanel";
import RequisitionItemForm from "./RequisitionItemForm";
import RequisitionItemsPanel from "./RequisitionItemsPanel";
import RequisitionTypeSelector from "./RequisitionTypeSelector";
import requisitionIcon from "../../../assets/icons/requisicao.svg";

interface RequisitionComposerProps {
    requisition: Requisition;
    items: RequisitionItem[];
    kitchenId: number;
    kitchenName: string | null;
    userId: string | null;
    canReview: boolean;
    created: boolean;
    onChanged: () => Promise<void> | void;
}

export default function RequisitionComposer({ requisition, items, kitchenId, kitchenName, userId, canReview, created, onChanged }: RequisitionComposerProps) {
    const navigate = useNavigate();
    const isOwner = requisition.requester.id === userId;
    const canEdit = requisition.status === "DRAFT" && (isOwner || canReview);

    if (!canEdit) {
        return (
            <div className="grid min-w-0 gap-4">
                <Breadcrumb items={[{ label: "Requisições", href: "/requisicoes" }, { label: `Requisição #${requisition.id}`, href: `/requisicoes/${requisition.id}` }, { label: "Edição indisponível" }]} />
                <Feedback severity="info">Este rascunho não pode mais ser editado. Consulte os detalhes e o andamento da requisição.</Feedback>
                <Link className="w-fit rounded-sm font-semibold text-brand underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={`/requisicoes/${requisition.id}`}>Abrir detalhes da requisição</Link>
            </div>
        );
    }

    return (
        <section className="grid min-w-0 gap-4" aria-labelledby="requisition-composer-heading">
            <Breadcrumb items={[{ label: "Requisições", href: "/requisicoes" }, { label: "Nova requisição" }]} backHref="/requisicoes" backLabel="Voltar para requisições" />
            <header className="flex min-w-0 flex-wrap items-start gap-4">
                <div className="min-w-0"><h2 id="requisition-composer-heading" className="font-k2d text-2xl font-bold text-ink">Nova requisição</h2><p className="text-sm text-history-muted">Rascunho #{requisition.id} · selecione os produtos e confira os detalhes antes de enviar.</p></div>
            </header>
            {created && <Feedback severity="success">Rascunho criado. Os itens adicionados serão salvos automaticamente.</Feedback>}
            <div className="grid min-w-0 items-start gap-5 xl:grid-cols-3">
                <div className="grid min-w-0 gap-5 xl:col-span-2">
                    <section className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-6" aria-labelledby="requisition-composer-data-heading">
                        <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sidebar-active"><img src={requisitionIcon} alt="" aria-hidden="true" className="size-5" /></span><h3 id="requisition-composer-data-heading" className="font-k2d text-lg font-bold text-ink">Dados da requisição</h3></div>
                        <RequisitionTypeSelector value={requisition.type} onChange={() => undefined} disabled />
                        <p className="text-sm leading-relaxed text-history-muted">O tipo é definido ao criar o rascunho e não pode ser alterado depois.</p>
                        <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl bg-history-card-header p-3 sm:px-4"><span className="rounded-full bg-sidebar-active px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand">Cozinha atual</span><span className="min-w-0 wrap-anywhere font-semibold text-ink">{kitchenName ?? requisition.kitchen.name}</span></div>
                        <p className="text-sm text-history-muted">{requisition.type === "TRANSFER" ? `Destino informado: ${requisition.origin}` : `Origem ou contexto: ${requisition.origin}`}</p>
                        <div className="border-t border-history-border pt-4"><RequisitionItemForm requisition={requisition} kitchenId={kitchenId} onAdded={onChanged} /></div>
                    </section>
                </div>
                <aside className="grid min-w-0 content-start gap-4">
                    <div className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5">
                        <RequisitionItemsPanel requisition={requisition} items={items} canEdit onChanged={onChanged} compact embedded />
                        <RequisitionActionPanel requisition={requisition} userId={userId} canReview={canReview} itemCount={items.length} onChanged={onChanged} onSaveDraft={() => navigate("/requisicoes")} onActionCompleted={() => navigate(`/requisicoes/${requisition.id}`, { replace: true })} embedded showCancel={false} showHeading={false} />
                    </div>
                    <div className="grid gap-1 rounded-2xl bg-linear-to-r from-brand-strong to-brand p-4 text-on-brand"><strong className="font-k2d">Da cozinha para a revisão</strong><p className="text-sm leading-relaxed">Confira quantidades e estimativas antes de enviar ao supervisor.</p></div>
                </aside>
            </div>
        </section>
    );
}
