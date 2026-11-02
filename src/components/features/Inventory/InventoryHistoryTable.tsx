import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Inventory, InventoryStatus } from "../../../types/inventory";
import { formatInventoryDate, getInitials, inventoryStatusPresentation } from "../../../utils/inventoryPresentation";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";

type StatusFilter = "ALL" | InventoryStatus;
type SortOrder = "NEWEST" | "OLDEST";

interface InventoryHistoryTableProps {
    inventories: Inventory[];
}

export default function InventoryHistoryTable({ inventories }: InventoryHistoryTableProps) {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [sortOrder, setSortOrder] = useState<SortOrder>("NEWEST");
    const visibleInventories = useMemo(() => inventories
        .filter((inventory) => statusFilter === "ALL" || inventory.status === statusFilter)
        .slice()
        .sort((first, second) => {
            const difference = new Date(first.startedAt).getTime() - new Date(second.startedAt).getTime();
            return sortOrder === "NEWEST" ? -difference : difference;
        }), [inventories, sortOrder, statusFilter]);

    function clearFilters() {
        setStatusFilter("ALL");
        setSortOrder("NEWEST");
    }

    return (
        <section className="min-w-0 overflow-hidden rounded-3xl bg-surface shadow-history-card" aria-labelledby="inventory-history-heading">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                <div className="grid min-w-0 gap-1">
                    <h3 id="inventory-history-heading" className="m-0 font-k2d text-lg font-bold text-ink sm:text-xl">Histórico de inventários</h3>
                    <p className="m-0 text-sm leading-relaxed text-history-muted">A lista completa desta cozinha. Os filtros e a ordem são aplicados nesta tela.</p>
                </div>
                <div className="flex min-w-0 flex-wrap gap-2">
                    <label className="flex min-h-10 min-w-0 items-center gap-2 rounded-xl border border-history-border bg-surface px-3 text-sm text-history-muted">
                        Situação
                        <select className="min-w-20 cursor-pointer bg-transparent font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
                            <option value="ALL">Todas</option>
                            <option value="OPEN">Aberto</option>
                            <option value="CLOSED">Fechado</option>
                            <option value="CANCELLED">Cancelado</option>
                        </select>
                    </label>
                    <label className="flex min-h-10 min-w-0 items-center gap-2 rounded-xl border border-history-border bg-surface px-3 text-sm text-history-muted">
                        Ordem
                        <select className="min-w-28 cursor-pointer bg-transparent font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                            <option value="NEWEST">Mais recente</option>
                            <option value="OLDEST">Mais antigo</option>
                        </select>
                    </label>
                </div>
            </div>

            {visibleInventories.length === 0 ? (
                <div className="grid justify-items-center gap-3 px-5 py-10 text-center">
                    <p className="m-0 text-sm text-history-muted">{inventories.length === 0 ? "Nenhum inventário foi registrado nesta cozinha." : "Nenhum inventário corresponde a esta situação."}</p>
                    {statusFilter !== "ALL" && inventories.length > 0 && <Button variant="outline" type="button" onClick={clearFilters}>Limpar filtro</Button>}
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus" tabIndex={0} aria-label="Tabela rolável do histórico de inventários">
                    <table className="w-full min-w-240 border-collapse text-left">
                        <caption className="sr-only">Inventários da cozinha ordenados do {sortOrder === "NEWEST" ? "mais recente para o mais antigo" : "mais antigo para o mais recente"}; filtro: {statusFilter === "ALL" ? "todas as situações" : inventoryStatusPresentation[statusFilter].label}.</caption>
                        <thead className="bg-history-card-header text-xs font-semibold text-history-muted sm:text-sm">
                            <tr>
                                <th className="px-4 py-3" scope="col">Nº</th>
                                <th className="px-4 py-3" scope="col">Início</th>
                                <th className="px-4 py-3" scope="col">Responsável</th>
                                <th className="px-4 py-3" scope="col">Situação</th>
                                <th className="px-4 py-3" scope="col">Encerrado em</th>
                                <th className="px-4 py-3" scope="col">Observação</th>
                                <th className="px-4 py-3 text-right" scope="col">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleInventories.map((inventory) => {
                                const status = inventoryStatusPresentation[inventory.status];
                                return (
                                    <tr key={inventory.id} className="border-b border-history-border last:border-b-0">
                                        <th className="whitespace-nowrap px-4 py-4 font-k2d text-sm font-bold text-ink" scope="row">#{inventory.id}</th>
                                        <td className="whitespace-nowrap px-4 py-4 text-sm text-ink">{formatInventoryDate(inventory.startedAt, { hour: "2-digit", minute: "2-digit" })}</td>
                                        <td className="px-4 py-4">
                                            <span className="flex min-w-44 items-center gap-2">
                                                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-active text-xs font-bold text-sidebar-purple" aria-hidden="true">{getInitials(inventory.responsible.name)}</span>
                                                <span className="min-w-0 text-sm font-medium text-ink">{inventory.responsible.name}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-4"><StatusBadge label={status.label} tone={status.tone} /></td>
                                        <td className="whitespace-nowrap px-4 py-4 text-sm text-history-muted">{formatInventoryDate(inventory.closedAt, { hour: "2-digit", minute: "2-digit" })}</td>
                                        <td className="max-w-64 px-4 py-4 text-sm text-history-muted"><span className="line-clamp-2">{inventory.note || "—"}</span></td>
                                        <td className="px-4 py-4 text-right">
                                            <Link className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 font-k2d text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${inventory.status === "OPEN" ? "border-transparent bg-login-gold text-brand-strong hover:brightness-95" : "border-sidebar-indicator bg-surface text-sidebar-purple hover:bg-history-card-header"}`} to={`/inventarios/${inventory.id}`} aria-label={`${inventory.status === "OPEN" ? "Retomar" : "Abrir"} inventário número ${inventory.id}`}>
                                                {inventory.status === "OPEN" ? "Retomar" : "Abrir"}<span aria-hidden="true">›</span>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <p className="m-0 flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs leading-relaxed text-history-muted sm:px-5">
                <span role="status" aria-live="polite">Mostrando {visibleInventories.length} de {inventories.length} inventários desta cozinha.</span>
                <span>Sem paginação nem busca na API.</span>
            </p>
        </section>
    );
}
