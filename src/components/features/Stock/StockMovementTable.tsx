import type { KitchenStockItem, StockMovement, StockMovementType } from "../../../types/stock";
import { formatStockDateTime, formatStockQuantity, getMovementTone, getStockMovementLabel } from "../../../utils/stockPresentation";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Loading from "../../ui/Loading";
import ProductImage from "../../ui/ProductImage";
import StatusBadge from "../../ui/StatusBadge";
import UserAvatar from "../../ui/UserAvatar";

export type StockMovementFilter = "ALL" | StockMovementType;

interface StockMovementTableProps {
    movements: StockMovement[];
    products: KitchenStockItem[];
    loading: boolean;
    error: string | null;
    type: StockMovementFilter;
    limit: number;
    onTypeChange: (type: StockMovementFilter) => void;
    onLimitChange: (limit: number) => void;
    onRetry: () => void;
}

function getUnit(products: KitchenStockItem[], productId: number): string {
    return products.find(({ product }) => product.id === productId)?.unit.symbol ?? "unidade";
}

function formatMovementQuantity(movement: StockMovement, unit: string): string {
    const quantity = movement.type === "WRITE_OFF" ? -Math.abs(movement.quantity) : movement.quantity;
    const amount = formatStockQuantity(quantity, unit);
    return quantity > 0 ? `+${amount}` : amount;
}

function MovementKind({ movement }: { movement: StockMovement }) {
    return <StatusBadge className="w-max max-w-none shrink-0 whitespace-nowrap" label={getStockMovementLabel(movement.type, movement.reason)} tone={getMovementTone(movement)} />;
}

function MovementProduct({ movement, unit }: { movement: StockMovement; unit: string }) {
    return (
        <span className="flex min-w-0 items-center gap-3">
            <ProductImage name={movement.product.name} photoUrl={movement.product.photoUrl} className="size-9 rounded-xl" />
            <span className="grid min-w-0 gap-0.5">
                <span className="font-semibold text-ink wrap-anywhere">{movement.product.name}</span>
                <span className="text-xs text-history-muted">{unit}</span>
            </span>
        </span>
    );
}

function MovementActor({ movement }: { movement: StockMovement }) {
    const name = movement.user?.name ?? "Sistema";
    return (
        <span className="flex min-w-0 items-center gap-2">
            <UserAvatar name={name} photoUrl={movement.user?.photoUrl} className="size-8 text-[0.65rem]" />
            <span className="min-w-0 wrap-anywhere text-sm text-ink">{name}</span>
        </span>
    );
}

export default function StockMovementTable({ movements, products, loading, error, type, limit, onTypeChange, onLimitChange, onRetry }: StockMovementTableProps) {
    return (
        <section className="flex min-w-0 flex-col overflow-hidden rounded-3xl bg-surface shadow-history-card" aria-labelledby="estoque-movimentacoes-heading" aria-busy={loading}>
            <header className="flex min-w-0 flex-wrap items-start justify-between gap-4 px-5 py-5 sm:px-7 sm:py-6">
                <div className="grid min-w-0 gap-1">
                    <h2 id="estoque-movimentacoes-heading" className="m-0 font-k2d text-xl font-bold text-ink sm:text-2xl">Movimentações recentes</h2>
                    <p className="m-0 max-w-prose text-sm leading-relaxed text-history-muted">Da mais nova para a mais antiga, só desta cozinha. A lista mostra um limite de registros, não o histórico completo.</p>
                </div>
                <div className="flex min-w-0 flex-wrap gap-2">
                    <label className="flex min-h-10 min-w-0 items-center gap-2 rounded-xl border border-history-border bg-surface px-3 text-xs text-history-muted" htmlFor="estoque-movimentacao-tipo">
                        <span>Tipo:</span>
                        <select id="estoque-movimentacao-tipo" className="min-h-8 min-w-0 bg-transparent font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={type} onChange={(event) => onTypeChange(event.target.value as StockMovementFilter)}>
                            <option value="ALL">Todos</option>
                            <option value="ENTRY">Entrada</option>
                            <option value="WRITE_OFF">Baixa</option>
                            <option value="ADJUSTMENT">Ajuste</option>
                        </select>
                    </label>
                    <label className="flex min-h-10 min-w-0 items-center gap-2 rounded-xl border border-history-border bg-surface px-3 text-xs text-history-muted" htmlFor="estoque-movimentacao-limite">
                        <span>Mostrar:</span>
                        <select id="estoque-movimentacao-limite" className="min-h-8 min-w-0 bg-transparent font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={limit} onChange={(event) => onLimitChange(Number(event.target.value))}>
                            {[50, 100, 200, 500].map((value) => <option key={value} value={value}>últimas {value}</option>)}
                        </select>
                    </label>
                </div>
            </header>

            {loading ? (
                <div className="flex min-h-40 items-center justify-center"><Loading loadingText="Carregando movimentações…" /></div>
            ) : error ? (
                <div className="grid justify-items-start gap-3 px-5 pb-5 sm:px-7 sm:pb-7"><Feedback severity="error">{error}</Feedback><Button variant="outline" type="button" onClick={onRetry}>Tentar carregar novamente</Button></div>
            ) : movements.length === 0 ? (
                <p className="m-4 rounded-2xl bg-history-card-header p-4 text-sm leading-relaxed text-history-muted sm:m-7">Não há movimentações para este filtro. Entradas e baixas futuras aparecerão aqui quando forem registradas.</p>
            ) : (
                <>
                    <ul className="m-0 grid list-none gap-3 px-4 pb-4 xl:hidden" aria-label="Movimentações recentes em cartões">
                        {movements.map((movement) => {
                            const unit = getUnit(products, movement.product.id);
                            return (
                                <li key={movement.id} className="grid min-w-0 gap-3 rounded-2xl border border-history-border p-4">
                                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                                        <span className="text-sm font-semibold text-ink">{formatStockDateTime(movement.createdAt)}</span>
                                        <MovementKind movement={movement} />
                                    </div>
                                    <MovementProduct movement={movement} unit={unit} />
                                    <dl className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 border-y border-history-border py-3 text-sm">
                                        <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Lote</dt><dd className="m-0 wrap-anywhere text-ink">{movement.batch.batchNumber}</dd></div>
                                        <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Quantidade</dt><dd className="m-0 font-bold text-ink">{formatMovementQuantity(movement, unit)}</dd></div>
                                        <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Saldo após</dt><dd className="m-0 text-ink">{formatStockQuantity(movement.balanceAfter, unit)}</dd></div>
                                        <div className="grid min-w-0 gap-0.5"><dt className="text-xs text-history-muted">Requisição</dt><dd className="m-0 font-semibold text-sidebar-purple">{movement.requisitionId === null ? "—" : `#${movement.requisitionId}`}</dd></div>
                                    </dl>
                                    <MovementActor movement={movement} />
                                </li>
                            );
                        })}
                    </ul>

                    <div className="hidden min-w-0 xl:block">
                        <div className="min-w-0 overflow-x-auto" role="region" aria-label="Tabela de movimentações. Use as setas horizontais para ver todas as colunas." tabIndex={0}>
                            <table className="w-full min-w-270 border-separate border-spacing-0 text-left text-sm text-ink">
                                <caption className="sr-only">Movimentações recentes com data, motivo, produto, lote, quantidade, saldo, usuário e requisição</caption>
                                <thead className="bg-history-card-header text-xs text-history-muted">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold" scope="col">Quando</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Tipo e motivo</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Produto</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Lote</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Quantidade</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Saldo após</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Usuário</th>
                                        <th className="px-4 py-3 font-semibold" scope="col">Requisição</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-history-border">
                                    {movements.map((movement) => {
                                        const unit = getUnit(products, movement.product.id);
                                        return (
                                            <tr key={movement.id} className="transition-colors hover:bg-history-card-header">
                                                <td className="whitespace-nowrap px-5 py-3">{formatStockDateTime(movement.createdAt)}</td>
                                                <td className="px-4 py-3"><MovementKind movement={movement} /></td>
                                                <td className="min-w-56 px-4 py-3"><MovementProduct movement={movement} unit={unit} /></td>
                                                <td className="max-w-40 px-4 py-3 wrap-anywhere">{movement.batch.batchNumber}</td>
                                                <td className="whitespace-nowrap px-4 py-3 font-k2d font-bold">{formatMovementQuantity(movement, unit)}</td>
                                                <td className="whitespace-nowrap px-4 py-3">{formatStockQuantity(movement.balanceAfter, unit)}</td>
                                                <td className="min-w-44 px-4 py-3"><MovementActor movement={movement} /></td>
                                                <td className="px-4 py-3 font-semibold text-sidebar-purple">{movement.requisitionId === null ? "—" : `#${movement.requisitionId}`}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <footer className="border-t border-history-border px-5 py-3 text-xs leading-relaxed text-history-muted sm:px-7">
                        Exibindo {movements.length} das últimas {limit} movimentações. O endpoint aceita até 500 registros por consulta e não oferece paginação por data.
                    </footer>
                </>
            )}
        </section>
    );
}
