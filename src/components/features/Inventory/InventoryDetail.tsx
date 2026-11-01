import { Link } from "react-router-dom";
import useInventoryActions from "../../../hooks/useInventoryActions";
import useInventoryDetail from "../../../hooks/useInventoryDetail";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import InventoryCountForm from "./InventoryCountForm";
import InventoryCountsTable from "./InventoryCountsTable";
import InventoryCountOverview from "./InventoryCountOverview";
import InventoryDetailHero from "./InventoryDetailHero";
import InventoryDetailSkeleton from "./InventoryDetailSkeleton";
import InventoryLifecyclePanel from "./InventoryLifecyclePanel";

interface InventoryDetailProps {
    inventoryId: number;
    kitchenId: number | null;
}

export default function InventoryDetail({ inventoryId, kitchenId }: InventoryDetailProps) {
    const detail = useInventoryDetail(inventoryId, kitchenId);
    const actions = useInventoryActions(inventoryId, detail.refresh);

    if (kitchenId === null) return (
        <div className="grid justify-items-center gap-3 px-4 py-12 text-center sm:px-6">
            <h2 className="m-0 font-k2d text-xl font-bold text-ink">Nenhuma cozinha vinculada</h2>
            <p className="m-0 max-w-prose text-sm leading-relaxed text-history-muted">Associe sua conta a uma cozinha antes de abrir um inventário.</p>
            <Link to="/cozinha" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-sidebar-indicator bg-surface px-4 py-2 font-k2d text-sm font-bold text-sidebar-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Abrir cozinha</Link>
        </div>
    );

    if (detail.loading && !detail.inventory) return <div aria-busy="true"><p className="sr-only" role="status" aria-live="polite">Carregando inventário e contagens…</p><InventoryDetailSkeleton /></div>;

    if (detail.error && !detail.inventory) return (
        <section className="mx-4 my-6 grid min-w-0 justify-items-start gap-3 rounded-3xl bg-surface p-5 shadow-history-card sm:mx-6 sm:p-6" aria-labelledby="inventory-detail-error-title">
            <h2 id="inventory-detail-error-title" className="m-0 font-k2d text-lg font-bold text-ink">Não foi possível abrir este inventário</h2>
            <Feedback severity="error">{detail.error}</Feedback>
            <div className="flex flex-wrap gap-2"><Button variant="outline" type="button" onClick={detail.retry}>Tentar novamente</Button><Link to="/inventarios" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-history-border bg-surface px-4 py-2 font-k2d text-sm font-bold text-sidebar-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Voltar ao histórico</Link></div>
        </section>
    );

    if (!detail.inventory) return null;

    const editable = detail.inventory.status === "OPEN";
    const removeError = actions.action === "remove-count" ? actions.error : null;

    return (
        <div className="grid min-w-0 gap-4 px-4 pb-8 pt-5 sm:gap-5 sm:px-6 sm:pt-6">
            <InventoryDetailHero inventory={detail.inventory} />
            {detail.loading && <p className="m-0 text-sm text-history-muted" role="status" aria-live="polite">Atualizando os dados do inventário…</p>}
            {detail.error && <Feedback severity="error">{detail.error} Os dados exibidos podem estar desatualizados.</Feedback>}
            <InventoryCountOverview counts={detail.counts} />

            <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="grid min-w-0 gap-4">
                    {editable && <InventoryCountForm
                        batches={detail.batches}
                        counts={detail.counts}
                        products={detail.products}
                        loadingBatches={detail.loading}
                        batchesError={detail.batchesError ?? detail.productsError}
                        submitting={actions.saving && actions.action === "count"}
                        submitError={actions.action === "count" ? actions.error : null}
                        submitSuccess={actions.action === "count" ? actions.success : null}
                        onSubmit={actions.addCount}
                        onRetryBatches={detail.retry}
                    />}
                    {(detail.batchesError || detail.productsError) && !editable && <Feedback severity="info">Os dados auxiliares de lotes ou unidades não carregaram; as contagens registradas continuam disponíveis abaixo.</Feedback>}
                    <InventoryCountsTable
                        counts={detail.counts}
                        batches={detail.batches}
                        products={detail.products}
                        canEdit={editable}
                        saving={actions.saving && actions.action === "remove-count"}
                        error={removeError}
                        onRemove={actions.removeCount}
                    />
                </div>
                <InventoryLifecyclePanel
                    inventory={detail.inventory}
                    count={detail.counts.length}
                    saving={actions.saving}
                    action={actions.action}
                    error={actions.error}
                    success={actions.success}
                    onClose={actions.close}
                    onCancel={actions.cancel}
                    onClearFeedback={actions.clearFeedback}
                />
            </div>
        </div>
    );
}
