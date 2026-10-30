import type { KitchenStockItem, StockBatch } from "../../../types/stock";
import productIcon from "../../../assets/icons/produto.svg";
import stockIcon from "../../../assets/icons/estoque.svg";
import warningIcon from "../../../assets/icons/alerta.svg";
import expiryIcon from "../../../assets/icons/vencimento.svg";

interface StockMetricsProps {
    products: KitchenStockItem[];
    expiringBatches: StockBatch[];
    expiringDays: number;
    expiringLoading: boolean;
    expiringError: string | null;
}

export default function StockMetrics({ products, expiringBatches, expiringDays, expiringLoading, expiringError }: StockMetricsProps) {
    const activeBatches = products.reduce((total, product) => total + product.activeBatches, 0);
    const lowStock = products.filter((product) => product.lowStock).length;
    const metrics = [
        { key: "products", value: products.length, label: "Produtos acompanhados", detail: "Linhas do resumo de estoque", icon: productIcon, tone: "bg-sidebar-active" },
        { key: "batches", value: activeBatches, label: "Lotes ativos", detail: "Soma dos lotes ativos de cada produto", icon: stockIcon, tone: "bg-feedback-success-bg" },
        { key: "low", value: lowStock, label: "Abaixo do mínimo", detail: "Saldo menor que o mínimo definido", icon: warningIcon, tone: "bg-feedback-error-bg" },
        { key: "expiry", value: expiringBatches.length, loading: expiringLoading, unavailable: Boolean(expiringError), label: `Vencendo em até ${expiringDays} dias`, detail: "Lotes ativos dentro do prazo escolhido", icon: expiryIcon, tone: "bg-history-status-observation-bg" },
    ] as const;

    return (
        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4 large-text:grid-cols-1" aria-label="Resumo do estoque da cozinha">
            {metrics.map((metric) => (
                <li key={metric.key} className="flex min-h-20 min-w-0 items-center gap-3 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5">
                    <span className={`grid size-10 shrink-0 place-items-center rounded-2xl sm:size-12 ${metric.tone}`} aria-hidden="true">
                        <img className="size-5 sm:size-6" src={metric.icon} alt="" />
                    </span>
                    <span className="grid min-w-0 gap-0.5">
                        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                            <strong className="font-k2d text-xl leading-none text-ink sm:text-2xl">
                                {"loading" in metric && (metric.loading || metric.unavailable)
                                    ? <><span aria-hidden="true">—</span><span className="sr-only">{metric.loading ? "Atualizando" : "Indisponível"}</span></>
                                    : metric.value}
                            </strong>
                            <span className="text-sm font-semibold leading-tight text-ink">{metric.label}</span>
                        </span>
                        <span className="text-xs leading-normal text-history-muted">{metric.detail}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}
