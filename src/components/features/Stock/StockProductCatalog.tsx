import type { KitchenStockItem } from "../../../types/stock";
import { formatStockDate, formatStockQuantity, getProductStockStatus } from "../../../utils/stockPresentation";
import type { StockProductStatusFilter } from "./StockProductFilters";
import StockProductFilters from "./StockProductFilters";
import ProductImage from "../../ui/ProductImage";
import StatusBadge from "../../ui/StatusBadge";
import Button from "../../ui/Button";

interface StockProductCatalogProps {
    products: KitchenStockItem[];
    query: string;
    categoryId: number | null;
    status: StockProductStatusFilter;
    onQueryChange: (query: string) => void;
    onCategoryChange: (categoryId: number | null) => void;
    onStatusChange: (status: StockProductStatusFilter) => void;
    onClearFilters: () => void;
    onViewBatches: (product: KitchenStockItem) => void;
    onRegisterEntry: () => void;
}

function matchesStatus(product: KitchenStockItem, status: StockProductStatusFilter): boolean {
    if (status === "LOW") return product.lowStock;
    if (status === "AVAILABLE") return !product.lowStock && product.totalQuantity > 0;
    if (status === "EMPTY") return !product.lowStock && product.totalQuantity <= 0;
    return true;
}

function ProductStatus({ product }: { product: KitchenStockItem }) {
    const status = getProductStockStatus(product);
    return <StatusBadge label={status.label} tone={status.tone} />;
}

function ProductDetails({ product }: { product: KitchenStockItem }) {
    return (
        <span className="grid min-w-0 gap-0.5">
            <span className="font-k2d text-sm font-bold leading-tight text-ink wrap-anywhere">{product.product.name}</span>
            <span className="text-xs leading-normal text-history-muted wrap-anywhere">{product.product.brand || "Sem marca"}</span>
        </span>
    );
}

function NoProducts({ filtersApplied, onClearFilters }: { filtersApplied: boolean; onClearFilters: () => void }) {
    return (
        <div className="grid justify-items-center gap-3 rounded-2xl bg-history-card-header p-6 text-center">
            <h3 className="m-0 font-k2d text-lg font-bold text-ink">{filtersApplied ? "Nenhum produto corresponde aos filtros" : "Nenhum produto vinculado a esta cozinha"}</h3>
            <p className="m-0 max-w-prose text-sm leading-relaxed text-history-muted">{filtersApplied ? "Limpe a busca, categoria ou situação para ver os produtos da cozinha." : "Quando houver produtos vinculados à cozinha com parâmetros ou lotes, eles aparecerão aqui."}</p>
            {filtersApplied && <Button variant="outline" type="button" onClick={onClearFilters}>Limpar filtros</Button>}
        </div>
    );
}

export default function StockProductCatalog({ products, query, categoryId, status, onQueryChange, onCategoryChange, onStatusChange, onClearFilters, onViewBatches, onRegisterEntry }: StockProductCatalogProps) {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    const visibleProducts = products.filter((product) => {
        const matchesQuery = !normalizedQuery || [product.product.name, product.product.brand ?? ""].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
        const matchesCategory = categoryId === null || product.category?.id === categoryId;
        return matchesQuery && matchesCategory && matchesStatus(product, status);
    });
    const filtersApplied = Boolean(normalizedQuery) || categoryId !== null || status !== "ALL";

    return (
        <section className="flex min-w-0 flex-col overflow-hidden rounded-3xl bg-surface shadow-history-card" aria-labelledby="estoque-produtos-heading">
            <header className="grid min-w-0 gap-4 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-1">
                        <h2 id="estoque-produtos-heading" className="m-0 font-k2d text-xl font-bold text-ink sm:text-2xl">Produtos da cozinha</h2>
                        <p className="m-0 max-w-prose text-sm leading-relaxed text-history-muted">Saldo utilizável, lotes ativos e validade mais próxima de cada produto vinculado à cozinha atual.</p>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="text-xs text-history-muted sm:text-sm">{visibleProducts.length} de {products.length} produtos</span>
                        <Button variant="primary" type="button" onClick={onRegisterEntry}>
                            <span aria-hidden="true">＋ㅤ</span> Registrar entrada
                        </Button>
                    </div>
                </div>
                <StockProductFilters products={products} query={query} categoryId={categoryId} status={status} onQueryChange={onQueryChange} onCategoryChange={onCategoryChange} onStatusChange={onStatusChange} />
            </header>

            {visibleProducts.length === 0 ? (
                <div className="px-5 pb-5 sm:px-7 sm:pb-7"><NoProducts filtersApplied={filtersApplied} onClearFilters={onClearFilters} /></div>
            ) : (
                <>
                    <ul className="m-0 grid list-none gap-3 px-4 pb-4 xl:hidden" aria-label="Produtos da cozinha em cartões">
                        {visibleProducts.map((product) => (
                            <li key={product.product.id} className="grid min-w-0 gap-3 rounded-2xl border border-history-border bg-surface p-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <ProductImage name={product.product.name} photoUrl={product.product.photoUrl} size="compact" />
                                    <ProductDetails product={product} />
                                </div>
                                <dl className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 border-y border-history-border py-3 text-sm sm:grid-cols-3">
                                    <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Categoria</dt><dd className="m-0 wrap-anywhere text-ink">{product.category?.name ?? "Não definida"}</dd></div>
                                    <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Saldo utilizável</dt><dd className="m-0 font-bold text-ink">{formatStockQuantity(product.totalQuantity, product.unit.symbol)}</dd></div>
                                    <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Lotes ativos</dt><dd className="m-0 text-ink">{product.activeBatches}</dd></div>
                                    <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Próxima validade</dt><dd className="m-0 text-ink">{formatStockDate(product.nextExpirationDate)}</dd></div>
                                    <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Estoque mínimo</dt><dd className="m-0 text-ink">{product.minStock === null ? "Não definido" : formatStockQuantity(product.minStock, product.unit.symbol)}</dd></div>
                                    <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Situação</dt><dd className="m-0"><ProductStatus product={product} /></dd></div>
                                </dl>
                                <Button variant="outline" type="button" className="w-full" onClick={() => onViewBatches(product)} aria-label={`Ver lotes de ${product.product.name}`}>
                                    Ver lotes <span aria-hidden="true">›</span>
                                </Button>
                            </li>
                        ))}
                    </ul>

                    <div className="hidden min-w-0 xl:block">
                        <div className="min-w-0 overflow-x-auto" role="region" aria-label="Tabela de produtos e saldos. Use as setas horizontais para ver todas as colunas." tabIndex={0}>
                            <table className="w-full min-w-270 border-separate border-spacing-0 text-left text-sm text-ink">
                                <caption className="sr-only">Produtos vinculados à cozinha, saldo utilizável, lotes, validade, mínimo e situação</caption>
                                <thead className="bg-history-card-header text-xs text-history-muted">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold" scope="col">Produto</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Categoria</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Saldo utilizável</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Lotes ativos</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Próxima validade</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Estoque mínimo</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Situação</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-history-border">
                                    {visibleProducts.map((product) => (
                                        <tr key={product.product.id} className="transition-colors hover:bg-history-card-header">
                                            <th className="min-w-64 px-5 py-3 text-left font-normal" scope="row">
                                                <span className="flex min-w-0 items-center gap-3"><ProductImage name={product.product.name} photoUrl={product.product.photoUrl} size="compact" /><ProductDetails product={product} /></span>
                                            </th>
                                            <td className="min-w-32 px-4 py-3">{product.category?.name ?? "Não definida"}</td>
                                            <td className="whitespace-nowrap px-4 py-3 font-k2d font-bold">{formatStockQuantity(product.totalQuantity, product.unit.symbol)}</td>
                                            <td className="px-4 py-3">{product.activeBatches}</td>
                                            <td className="whitespace-nowrap px-4 py-3">{formatStockDate(product.nextExpirationDate)}</td>
                                            <td className="whitespace-nowrap px-4 py-3">{product.minStock === null ? "Não definido" : formatStockQuantity(product.minStock, product.unit.symbol)}</td>
                                            <td className="px-4 py-3"><ProductStatus product={product} /></td>
                                            <td className="px-4 py-3"><Button variant="outline" type="button" className="min-h-9 px-3 py-1 text-xs" onClick={() => onViewBatches(product)} aria-label={`Ver lotes de ${product.product.name}`}>Ver lotes <span aria-hidden="true">›</span></Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <footer className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-history-border px-5 py-3 text-xs text-history-muted sm:px-7">
                        <p className="m-0">Mostrando {visibleProducts.length} de {products.length} produtos · a lista da cozinha não é paginada pela API.</p>
                        <p className="m-0 font-medium text-sidebar-purple">Saldo = lotes ativos e dentro da validade</p>
                    </footer>
                </>
            )}
        </section>
    );
}
