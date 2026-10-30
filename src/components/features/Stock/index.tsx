import { useState } from "react";
import { Link } from "react-router-dom";
import type { KitchenStockItem, StockBatch } from "../../../types/stock";
import useStockDashboard from "../../../hooks/useStockDashboard";
import useStockBatches from "../../../hooks/useStockBatches";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Loading from "../../ui/Loading";
import StockBatchDialog from "./StockBatchDialog";
import StockConsumptionDialog from "./StockConsumptionDialog";
import StockEntryDialog from "./StockEntryDialog";
import StockExpiryAlert from "./StockExpiryAlert";
import StockHero from "./StockHero";
import StockLowStockAlert from "./StockLowStockAlert";
import StockMetrics from "./StockMetrics";
import StockMovementTable from "./StockMovementTable";
import StockProductCatalog from "./StockProductCatalog";
import StockWriteOffDialog from "./StockWriteOffDialog";
import type { StockProductStatusFilter } from "./StockProductFilters";
import Mascot from "../../ui/Mascot";

interface StockFlowProps {
    kitchenId: number | null;
    kitchenName: string | null;
    canCreateKitchen: boolean;
}

export default function StockFlow({ kitchenId, kitchenName, canCreateKitchen }: StockFlowProps) {
    const stock = useStockDashboard(kitchenId);
    const [query, setQuery] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [status, setStatus] = useState<StockProductStatusFilter>("ALL");
    const [entryOpen, setEntryOpen] = useState(false);
    const [consumptionOpen, setConsumptionOpen] = useState(false);
    const [batchesOpen, setBatchesOpen] = useState(false);
    const [writeOffOpen, setWriteOffOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<KitchenStockItem | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<StockBatch | null>(null);
    const batches = useStockBatches(kitchenId ?? 0, selectedProduct?.product.id ?? null, batchesOpen, stock.refreshKey);

    function openEntry() {
        stock.clearMutationFeedback();
        setEntryOpen(true);
    }

    function openConsumption() {
        stock.clearMutationFeedback();
        setConsumptionOpen(true);
    }

    function openProductBatches(product: KitchenStockItem) {
        stock.clearMutationFeedback();
        setSelectedProduct(product);
        setBatchesOpen(true);
    }

    function registerWriteOff(batch: StockBatch) {
        setSelectedBatch(batch);
        setBatchesOpen(false);
        setWriteOffOpen(true);
    }

    function clearFilters() {
        setQuery("");
        setCategoryId(null);
        setStatus("ALL");
    }

    return (
        <section className="flex min-w-0 flex-col gap-4 px-4 pb-8 pt-5 sm:gap-5 sm:px-6 sm:pt-6 max-sm:px-3">
            {kitchenId === null || kitchenName === null ? (
                <div className="grid min-h-72 place-content-center justify-items-center gap-3 rounded-3xl bg-surface p-6 text-center shadow-history-card sm:p-8">
                    <Mascot size="compacto" className="w-20" />
                    <h2 className="m-0 font-k2d text-xl font-bold text-ink">Você ainda não tem uma cozinha</h2>
                    <p className="m-0 max-w-prose text-sm leading-relaxed text-history-muted">O estoque mostra somente os dados da cozinha vinculada à sua conta. {canCreateKitchen ? "Crie uma cozinha para começar a acompanhar produtos, lotes e movimentações." : "Peça ao supervisor da sua equipe para vincular sua conta a uma cozinha."}</p>
                    <div className="flex min-w-0 flex-wrap justify-center gap-3 pt-1">
                        {canCreateKitchen && <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 py-2.5 font-k2d text-sm font-bold text-on-brand transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/cadastro/cozinha">Criar cozinha</Link>}
                        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-history-border bg-surface px-5 py-2.5 font-k2d text-sm font-bold text-sidebar-purple transition-colors hover:bg-history-card-header focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/home">Voltar ao painel</Link>
                    </div>
                </div>
            ) : (
                <>
                    <StockHero kitchenName={kitchenName} onConsume={openConsumption} />
                    {stock.mutation.success && <Feedback severity="success">{stock.mutation.success}</Feedback>}
                    {stock.products.loading && stock.products.data.length === 0 && <div className="flex min-h-32 items-center justify-center rounded-3xl bg-surface shadow-history-card"><Loading loadingText="Carregando estoque da cozinha…" /></div>}
                    {stock.products.error && stock.products.data.length === 0 && <div className="grid min-w-0 justify-items-start gap-3 rounded-3xl bg-surface p-5 shadow-history-card"><Feedback severity="error">{stock.products.error}</Feedback><Button variant="outline" type="button" onClick={stock.retryProducts}>Tentar carregar novamente</Button></div>}
                    {stock.products.error && stock.products.data.length > 0 && <Feedback severity="error">Os dados podem estar desatualizados. {stock.products.error}</Feedback>}
                    {(stock.products.data.length > 0 || (!stock.products.loading && !stock.products.error)) && (
                        <>
                            <StockMetrics products={stock.products.data} expiringBatches={stock.expiring.data} expiringDays={stock.days} expiringLoading={stock.expiring.loading} expiringError={stock.expiring.error} />
                            <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)]">
                                <StockLowStockAlert products={stock.products.data} kitchenName={kitchenName} />
                                <StockExpiryAlert kitchenName={kitchenName} products={stock.products.data} batches={stock.expiring.data} days={stock.days} loading={stock.expiring.loading} error={stock.expiring.error} onDaysChange={stock.setDays} onRetry={stock.retryExpiring} />
                            </div>
                            <StockProductCatalog products={stock.products.data} query={query} categoryId={categoryId} status={status} onQueryChange={setQuery} onCategoryChange={setCategoryId} onStatusChange={setStatus} onClearFilters={clearFilters} onViewBatches={openProductBatches} onRegisterEntry={openEntry} />
                            <StockMovementTable movements={stock.movements.data} products={stock.products.data} loading={stock.movements.loading} error={stock.movements.error} type={stock.movementType} limit={stock.limit} onTypeChange={stock.setMovementType} onLimitChange={stock.setLimit} onRetry={stock.retryMovements} />
                        </>
                    )}

                    <StockEntryDialog open={entryOpen} kitchenId={kitchenId} products={stock.products.data} suppliers={stock.suppliers.data} suppliersLoading={stock.suppliers.loading} suppliersError={stock.suppliers.error} submitting={stock.mutation.submitting && stock.mutation.kind === "entry"} error={stock.mutation.kind === "entry" ? stock.mutation.error : null} onOpenChange={setEntryOpen} onSubmit={stock.createEntry} onRetrySuppliers={stock.retrySuppliers} />
                    <StockConsumptionDialog open={consumptionOpen} kitchenId={kitchenId} products={stock.products.data} submitting={stock.mutation.submitting && stock.mutation.kind === "consumption"} error={stock.mutation.kind === "consumption" ? stock.mutation.error : null} onOpenChange={setConsumptionOpen} onSubmit={stock.createConsumption} />
                    <StockBatchDialog open={batchesOpen} product={selectedProduct} batches={batches.batches} loading={batches.loading} error={batches.error} onOpenChange={setBatchesOpen} onRegisterWriteOff={(batch) => void registerWriteOff(batch)} onRetry={batches.retry} />
                    <StockWriteOffDialog open={writeOffOpen} batch={selectedBatch} product={selectedProduct} submitting={stock.mutation.submitting && stock.mutation.kind === "write-off"} error={stock.mutation.kind === "write-off" ? stock.mutation.error : null} onOpenChange={setWriteOffOpen} onSubmit={stock.createWriteOff} />
                </>
            )}
        </section>
    );
}
