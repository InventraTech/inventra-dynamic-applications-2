import type { KitchenStockItem } from "../../../types/stock";
import { formatStockQuantity } from "../../../utils/stockPresentation";
import ProductImage from "../../ui/ProductImage";
import StatusBadge from "../../ui/StatusBadge";
import alertIcon from "../../../assets/icons/alerta.svg";

interface StockLowStockAlertProps {
    products: KitchenStockItem[];
    kitchenName: string;
}

export default function StockLowStockAlert({ products, kitchenName }: StockLowStockAlertProps) {
    const lowStockProducts = products.filter((product) => product.lowStock);

    return (
        <section className="flex min-w-0 flex-col gap-3 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7" aria-labelledby="estoque-minimo-heading">
            <header className="flex min-w-0 flex-wrap items-center gap-2">
                <img className="size-5 shrink-0" src={alertIcon} alt="" aria-hidden="true" />
                <h2 id="estoque-minimo-heading" className="m-0 font-k2d text-lg font-bold leading-tight text-ink">Abaixo do estoque mínimo</h2>
                <StatusBadge label={`${lowStockProducts.length} ${lowStockProducts.length === 1 ? "produto" : "produtos"}`} tone={lowStockProducts.length ? "danger" : "success"} />
            </header>
            <p className="m-0 text-sm leading-relaxed text-history-muted">Só desta cozinha: {kitchenName}. O alerta aparece quando o saldo fica menor que o mínimo definido.</p>
            {lowStockProducts.length === 0 ? (
                <p className="m-0 rounded-2xl bg-feedback-success-bg p-4 text-sm leading-relaxed text-feedback-success">Nenhum produto está abaixo do mínimo definido.</p>
            ) : (
                <ul className="m-0 grid list-none divide-y divide-history-border p-0" aria-label="Produtos abaixo do estoque mínimo">
                    {lowStockProducts.map((item) => (
                        <li key={item.product.id} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-x-4">
                            <ProductImage name={item.product.name} photoUrl={item.product.photoUrl} className="size-10 rounded-xl" />
                            <span className="grid min-w-0 gap-0.5">
                                <span className="font-k2d text-sm font-bold leading-tight text-ink wrap-anywhere">{item.product.name}</span>
                                <span className="text-xs leading-normal text-history-muted wrap-anywhere">{item.product.brand || item.category?.name || "Sem marca"} · {item.unit.symbol}</span>
                            </span>
                            <span className="grid min-w-0 pl-13 sm:pl-0 sm:text-right">
                                <strong className="font-k2d text-sm text-feedback-error">{formatStockQuantity(item.totalQuantity, item.unit.symbol)}</strong>
                                <span className="text-xs text-history-muted">mínimo {formatStockQuantity(item.minStock ?? 0, item.unit.symbol)}</span>
                            </span>
                            <StatusBadge className="col-start-2 w-fit sm:col-start-auto" label="Abaixo do mínimo" tone="danger" />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
