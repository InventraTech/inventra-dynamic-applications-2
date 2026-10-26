import { Link } from "react-router-dom";
import type { Requisition } from "../../../types/requisitions";
import StatusBadge from "../../ui/StatusBadge";
import { formatRequisitionCurrency, formatRequisitionDate, getRequisitionStatusPresentation, getRequisitionTypeLabel } from "../../../utils/requisitionPresentation";
import UserAvatar from "../../ui/UserAvatar";
import Button from "../../ui/Button";

interface RequisitionListProps {
    requisitions: Requisition[];
    page: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

function getVisiblePages(page: number, totalPages: number): number[] {
    return [...new Set([1, page - 1, page, page + 1, totalPages])]
        .filter((number) => number > 0 && number <= totalPages)
        .sort((first, second) => first - second);
}

export default function RequisitionList({ requisitions, page, pageSize, totalCount, onPageChange, onPageSizeChange }: RequisitionListProps) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const firstVisible = (page - 1) * pageSize + 1;
    const lastVisible = Math.min(page * pageSize, totalCount);
    const visiblePages = getVisiblePages(page, totalPages);

    return (
        <section className="min-w-0 overflow-hidden rounded-3xl bg-surface shadow-history-card" aria-label="Lista de requisições">
        <div className="min-w-0 overflow-x-auto" role="region" aria-label="Tabela de requisições. Use as setas horizontais para ver todas as colunas." tabIndex={0}>
            <table className="w-full min-w-max border-separate border-spacing-0 text-left text-sm text-ink">
                <caption className="sr-only">Requisições da cozinha, solicitantes, itens, estimativas e status</caption>
                <thead className="bg-history-card-header text-xs text-history-muted">
                    <tr>
                        <th className="px-4 py-4 font-semibold" scope="col">Requisição / tipo</th>
                        <th className="px-4 py-4 font-semibold" scope="col">Solicitante</th>
                        <th className="px-4 py-4 font-semibold" scope="col">Itens da cozinha</th>
                        <th className="px-4 py-4 text-right font-semibold" scope="col">Estimativa</th>
                        <th className="px-4 py-4 font-semibold" scope="col">Status</th>
                        <th className="px-4 py-4" scope="col"><span className="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-history-border">
                    {requisitions.map((requisition) => {
                        const status = getRequisitionStatusPresentation(requisition.status);
                        const itemSummary = requisition.itemNames.length ? requisition.itemNames.join(", ") : "Nenhum item adicionado";
                        return (
                            <tr key={requisition.id} className="hover:bg-history-card-header">
                                <th className="min-w-48 px-4 py-4 text-left font-normal" scope="row">
                                    <Link className="rounded-sm font-semibold text-ink underline-offset-2 hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={`/requisicoes/${requisition.id}`} aria-label={`Abrir requisição número ${requisition.id}`}>
                                        #{requisition.id} · {getRequisitionTypeLabel(requisition.type)}
                                    </Link>
                                    <span className="mt-1 block max-w-64 wrap-anywhere text-xs text-history-muted">{requisition.type === "PURCHASE" ? requisition.kitchen.name : `Destino: ${requisition.origin}`}</span>
                                </th>
                                <td className="min-w-48 px-4 py-4">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <UserAvatar name={requisition.requester.name} photoUrl={requisition.requester.photoUrl} className="size-9 text-xs" />
                                        <div className="grid min-w-0 gap-1"><span className="wrap-anywhere font-semibold">{requisition.requester.name}</span><span className="text-xs text-history-muted">{formatRequisitionDate(requisition.createdAt)}</span></div>
                                    </div>
                                </td>
                                <td className="min-w-64 max-w-80 px-4 py-4">
                                    <span className="block max-w-80 wrap-anywhere">{itemSummary}</span>
                                    <span className="mt-1 block text-xs text-history-muted">{requisition.itemCount} {requisition.itemCount === 1 ? "item" : "itens"}</span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-brand">{formatRequisitionCurrency(requisition.estimatedTotal)}</td>
                                <td className="px-4 py-4"><StatusBadge label={status.label} tone={status.tone} /></td>
                                <td className="px-4 py-4">
                                    <Link className="grid size-10 place-items-center rounded-full bg-sidebar-active font-semibold text-brand transition-colors hover:bg-history-card-header focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={`/requisicoes/${requisition.id}`} aria-label={`Ver detalhes da requisição ${requisition.id}`}>
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        <footer className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-history-border px-4 py-3 text-xs text-history-muted">
            <p className="m-0">Mostrando {firstVisible}–{lastVisible} de {totalCount} {totalCount === 1 ? "requisição" : "requisições"}</p>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
                <nav className="flex flex-wrap items-center gap-1" aria-label="Paginação das requisições">
                    {totalPages > 1 && <Button variant="icon" type="button" className="size-10 rounded-lg bg-sidebar-active px-0 text-brand" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior">←</Button>}
                    {visiblePages.map((pageNumber, index) => (
                        <span key={pageNumber} className="flex items-center gap-1">
                            {index > 0 && pageNumber - visiblePages[index - 1] > 1 && <span aria-hidden="true" className="px-1">…</span>}
                            <Button variant="icon" type="button" className={`size-10 rounded-lg px-0 ${pageNumber === page ? "bg-brand text-on-brand" : "text-ink hover:bg-sidebar-active"}`} aria-current={pageNumber === page ? "page" : undefined} aria-label={`Página ${pageNumber}`} onClick={() => onPageChange(pageNumber)}>{pageNumber}</Button>
                        </span>
                    ))}
                    {totalPages > 1 && <Button variant="icon" type="button" className="size-10 rounded-lg bg-sidebar-active px-0 text-brand" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Próxima página">→</Button>}
                </nav>
                <label className="flex items-center gap-2" htmlFor="requisition-page-size">
                    <span>por página</span>
                    <select id="requisition-page-size" className="min-h-10 rounded-lg border border-history-border bg-surface px-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </label>
            </div>
        </footer>
        </section>
    );
}
