import type { KitchenStockItem, StockBatch } from "../../../types/stock";
import { formatStockDate, formatStockQuantity, getBatchStatusPresentation } from "../../../utils/stockPresentation";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import Feedback from "../../ui/Feedback";
import Loading from "../../ui/Loading";
import StatusBadge from "../../ui/StatusBadge";

interface StockBatchDialogProps {
    open: boolean;
    product: KitchenStockItem | null;
    batches: StockBatch[];
    loading: boolean;
    error: string | null;
    onOpenChange: (open: boolean) => void;
    onRegisterWriteOff: (batch: StockBatch) => void;
    onRetry: () => void;
}
export default function StockBatchDialog({ open, product, batches, loading, error, onOpenChange, onRegisterWriteOff, onRetry }: StockBatchDialogProps) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange} aria-labelledby="estoque-lotes-heading" aria-busy={loading} className="max-w-3xl">
            <div className="grid min-w-0 gap-4 p-5 sm:p-7">
                <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-1">
                        <h2 id="estoque-lotes-heading" className="m-0 font-k2d text-xl font-bold text-sidebar-purple">Lotes do produto</h2>
                        <p className="m-0 text-sm leading-relaxed text-history-muted">{product?.product.name ?? "Produto"} · os lotes podem estar ativos, baixados, vencidos ou cancelados.</p>
                    </div>
                    <Button variant="icon" type="button" autoFocus className="min-h-10 min-w-0 rounded-xl border border-history-border px-3 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" onClick={() => onOpenChange(false)}>Fechar</Button>
                </header>
                {loading ? (
                    <div className="flex min-h-36 items-center justify-center"><Loading loadingText="Carregando lotes…" /></div>
                ) : error ? (
                    <div className="grid justify-items-start gap-3"><Feedback severity="error">{error}</Feedback><Button variant="outline" type="button" onClick={onRetry}>Tentar carregar novamente</Button></div>
                ) : !product || batches.length === 0 ? (
                    <p className="m-0 rounded-2xl bg-history-card-header p-4 text-sm leading-relaxed text-history-muted">Nenhum lote foi registrado para este produto nesta cozinha.</p>
                ) : (
                    <ul className="m-0 grid list-none gap-3 p-0" aria-label={`Lotes de ${product.product.name}`}>
                        {batches.map((batch) => {
                            const status = getBatchStatusPresentation(batch);
                            return (
                                <li key={batch.id} className="grid min-w-0 gap-3 rounded-2xl border border-history-border p-4 sm:p-5">
                                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                                        <div className="grid min-w-0 gap-1">
                                            <h3 className="m-0 font-k2d text-base font-bold text-ink wrap-anywhere">Lote {batch.batchNumber}</h3>
                                            <span className="text-xs text-history-muted">Entrada em {formatStockDate(batch.entryDate)}</span>
                                        </div>
                                        <StatusBadge label={status.label} tone={status.tone} />
                                    </div>
                                    <dl className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 border-y border-history-border py-3 text-sm sm:grid-cols-3">
                                        <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Saldo do lote</dt><dd className="m-0 font-bold text-ink">{formatStockQuantity(batch.currentQuantity, product.unit.symbol)}</dd></div>
                                        <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Quantidade inicial</dt><dd className="m-0 text-ink">{formatStockQuantity(batch.initialQuantity, product.unit.symbol)}</dd></div>
                                        <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Validade</dt><dd className="m-0 text-ink">{formatStockDate(batch.expirationDate)}</dd></div>
                                        <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Fornecedor</dt><dd className="m-0 wrap-anywhere text-ink">{batch.supplier?.legalName ?? "Sem fornecedor"}</dd></div>
                                        <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Nota fiscal</dt><dd className="m-0 wrap-anywhere text-ink">{batch.invoiceNumber || "Não informada"}</dd></div>
                                        <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Preço unitário</dt><dd className="m-0 text-ink">{batch.unitPrice === null ? "Não informado" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(batch.unitPrice)}</dd></div>
                                    </dl>
                                    {batch.status === "ACTIVE" && batch.currentQuantity > 0 && (
                                        <Button variant="subtle-danger" type="button" className="w-fit" onClick={() => onRegisterWriteOff(batch)}>Registrar perda ou vencimento</Button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </Dialog>
    );
}
