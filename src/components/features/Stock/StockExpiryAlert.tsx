import type { KitchenStockItem, StockBatch } from "../../../types/stock";
import { formatDaysUntil, formatStockDate, formatStockQuantity, getDaysUntilDate } from "../../../utils/stockPresentation";
import ProductImage from "../../ui/ProductImage";
import StatusBadge from "../../ui/StatusBadge";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Loading from "../../ui/Loading";
import expiryIcon from "../../../assets/icons/vencimento.svg";

interface StockExpiryAlertProps {
    kitchenName: string;
    products: KitchenStockItem[];
    batches: StockBatch[];
    days: number;
    loading: boolean;
    error: string | null;
    onDaysChange: (days: number) => void;
    onRetry: () => void;
}

const horizons = [7, 15, 30, 60] as const;

export default function StockExpiryAlert({ kitchenName, products, batches, days, loading, error, onDaysChange, onRetry }: StockExpiryAlertProps) {
    return (
        <section className="flex min-w-0 flex-col gap-3 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7" aria-labelledby="estoque-vencimentos-heading" aria-busy={loading}>
            <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <img className="size-5 shrink-0" src={expiryIcon} alt="" aria-hidden="true" />
                    <h2 id="estoque-vencimentos-heading" className="m-0 font-k2d text-lg font-bold leading-tight text-ink">Vencendo em até {days} dias</h2>
                    <StatusBadge label={`${batches.length} ${batches.length === 1 ? "lote" : "lotes"}`} tone={batches.length ? "warning" : "neutral"} />
                </div>
                <div className="flex max-w-full flex-wrap items-center gap-1 rounded-full border border-history-border bg-history-card-header p-1" role="group" aria-label="Período para alertas de validade">
                    {horizons.map((horizon) => (
                        <Button key={horizon} variant="ghost" type="button" aria-pressed={days === horizon} onClick={() => onDaysChange(horizon)} className={`min-h-8 min-w-0 rounded-full px-3 py-1 text-xs ${days === horizon ? "bg-brand text-on-brand hover:bg-brand-strong" : "text-history-muted hover:bg-sidebar-active"}`}>
                            {horizon} dias
                        </Button>
                    ))}
                </div>
            </header>
            <p className="m-0 text-sm leading-relaxed text-history-muted">Lotes ativos da cozinha {kitchenName} com validade nos próximos {days} dias. A lista mostra lotes, não apenas a próxima validade de cada produto.</p>
            {loading ? (
                <div className="flex min-h-28 items-center justify-center" aria-label="Carregando lotes próximos do vencimento"><Loading loadingText="Carregando validades…" /></div>
            ) : error ? (
                <div className="grid justify-items-start gap-2"><Feedback severity="error">{error}</Feedback><Button variant="outline" type="button" onClick={onRetry}>Tentar carregar novamente</Button></div>
            ) : batches.length === 0 ? (
                <p className="m-0 rounded-2xl bg-history-card-header p-4 text-sm leading-relaxed text-history-muted">Nenhum lote ativo vence nos próximos {days} dias.</p>
            ) : (
                <ul className="m-0 grid list-none divide-y divide-history-border p-0" aria-label={`Lotes vencendo em até ${days} dias`}>
                    {batches.map((batch) => {
                        const expirationDays = batch.expirationDate ? getDaysUntilDate(batch.expirationDate) : null;
                        const tone = expirationDays === null ? "neutral" : expirationDays <= 7 ? "danger" : "warning";
                        const unitSymbol = products.find((product) => product.product.id === batch.product.id)?.unit.symbol ?? "unidade";
                        return (
                            <li key={batch.id} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] sm:gap-x-4">
                                <ProductImage name={batch.product.name} photoUrl={batch.product.photoUrl} size="compact" className="size-10" />
                                <span className="grid min-w-0 gap-0.5">
                                    <span className="font-k2d text-sm font-bold leading-tight text-ink wrap-anywhere">{batch.product.name}</span>
                                    <span className="text-xs text-history-muted wrap-anywhere">Lote {batch.batchNumber}</span>
                                </span>
                                <span className="grid min-w-0 pl-13 sm:pl-0">
                                    <strong className="text-sm text-ink">{formatStockDate(batch.expirationDate)}</strong>
                                    <StatusBadge className="w-fit" label={expirationDays === null ? "Sem validade" : formatDaysUntil(expirationDays)} tone={tone} />
                                </span>
                                <strong className="pl-13 text-sm text-ink sm:pl-0">{formatStockQuantity(batch.currentQuantity, unitSymbol)}</strong>
                                <span className="pl-13 text-xs text-history-muted wrap-anywhere sm:pl-0">{batch.supplier?.legalName ?? "Sem fornecedor"}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
