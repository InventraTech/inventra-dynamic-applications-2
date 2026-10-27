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

function RequisitionPagination({ page, pageSize, totalCount, onPageChange, onPageSizeChange }: RequisitionListProps) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const firstVisible = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastVisible = Math.min(page * pageSize, totalCount);
    const visiblePages = getVisiblePages(page, totalPages);

    return (
        <footer className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-3xl bg-surface px-4 py-3 text-xs text-history-muted shadow-history-card xl:rounded-none xl:border-t xl:border-history-border xl:bg-transparent xl:px-5 xl:shadow-none">
            <p className="m-0">Mostrando {firstVisible}–{lastVisible} de {totalCount} {totalCount === 1 ? "requisição" : "requisições"}</p>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
                <nav className="flex flex-wrap items-center gap-1" aria-label="Paginação das requisições">
                    {totalPages > 1 && <Button variant="ghost" type="button" className="size-9 bg-sidebar-active px-0 text-brand hover:bg-history-card-header" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior">←</Button>}
                    {visiblePages.map((pageNumber, index) => (
                        <span key={pageNumber} className="flex items-center gap-1">
                            {index > 0 && pageNumber - visiblePages[index - 1] > 1 && <span aria-hidden="true" className="px-1">…</span>}
                            <Button variant="ghost" type="button" className={"size-9 px-0 " + (pageNumber === page ? "bg-brand text-on-brand hover:bg-brand-strong" : "text-sidebar-purple hover:bg-sidebar-active")} aria-current={pageNumber === page ? "page" : undefined} aria-label={"Página " + pageNumber} onClick={() => onPageChange(pageNumber)}>{pageNumber}</Button>
                        </span>
                    ))}
                    {totalPages > 1 && <Button variant="ghost" type="button" className="size-9 bg-sidebar-active px-0 text-brand hover:bg-history-card-header" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Próxima página">→</Button>}
                </nav>
                <label className="flex items-center gap-2" htmlFor="requisition-page-size">
                    <span>por página</span>
                    <select id="requisition-page-size" className="min-h-9 rounded-full border border-history-border bg-surface px-3 font-k2d text-sm text-sidebar-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </label>
            </div>
        </footer>
    );
}

function RequisitionCards({ requisitions }: Pick<RequisitionListProps, "requisitions">) {
    return (
        <ul className="grid list-none gap-4 p-0 xl:hidden">
            {requisitions.map((requisition) => {
                const status = getRequisitionStatusPresentation(requisition.status);
                const itemSummary = requisition.itemNames.length ? requisition.itemNames.join(", ") : "Nenhum item adicionado";
                return (
                    <li key={requisition.id} className="grid min-w-0 gap-3 rounded-3xl bg-surface p-5 shadow-history-card">
                        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                            <div className="grid min-w-0 gap-1">
                                <Link className="w-fit rounded-sm font-semibold text-ink underline-offset-2 hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={"/requisicoes/" + requisition.id}>
                                    Requisição #{requisition.id}
                                </Link>
                                <span className="text-sm text-history-muted">{getRequisitionTypeLabel(requisition.type)} · {formatRequisitionDate(requisition.createdAt)}</span>
                            </div>
                            <StatusBadge label={status.label} tone={status.tone} />
                        </div>
                        <div className="flex min-w-0 items-center gap-3 border-y border-history-border py-3">
                            <UserAvatar name={requisition.requester.name} photoUrl={requisition.requester.photoUrl} className="size-10 shrink-0 text-xs" />
                            <div className="grid min-w-0 gap-0.5">
                                <span className="wrap-anywhere font-semibold text-ink">{requisition.requester.name}</span>
                                <span className="text-xs text-history-muted">{requisition.type === "PURCHASE" ? requisition.kitchen.name : "Destino: " + requisition.origin}</span>
                            </div>
                        </div>
                        <div className="grid min-w-0 gap-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-history-muted">Itens da requisição · {requisition.itemCount}</span>
                            <p className="m-0 line-clamp-2 wrap-anywhere text-sm text-ink">{itemSummary}</p>
                        </div>
                        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                            <span className="font-k2d text-lg font-bold text-brand">{formatRequisitionCurrency(requisition.estimatedTotal)}</span>
                            <Link className="inline-flex min-h-10 items-center justify-center rounded-xl bg-sidebar-active px-4 py-2 font-k2d text-sm font-bold text-brand transition-colors hover:bg-history-card-header focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={"/requisicoes/" + requisition.id} aria-label={"Ver detalhes da requisição " + requisition.id}>Ver requisição <span className="ml-2" aria-hidden="true">→</span></Link>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

function RequisitionTable({ requisitions }: Pick<RequisitionListProps, "requisitions">) {
    return (
        <div className="hidden min-w-0 xl:block">
            <div className="min-w-0 overflow-x-auto" role="region" aria-label="Tabela de requisições. Use as setas horizontais para ver todas as colunas." tabIndex={0}>
                <table className="w-full min-w-240 border-separate border-spacing-0 text-left text-sm text-ink">
                    <caption className="sr-only">Requisições da cozinha, solicitantes, itens, estimativas e status</caption>
                    <thead className="bg-history-card-header text-xs text-history-muted">
                        <tr>
                            <th className="px-5 py-4 font-semibold" scope="col">Requisição / tipo</th>
                            <th className="px-4 py-4 font-semibold" scope="col">Solicitante</th>
                            <th className="px-4 py-4 font-semibold" scope="col">Itens da cozinha</th>
                            <th className="px-4 py-4 text-right font-semibold" scope="col">Estimativa</th>
                            <th className="px-4 py-4 font-semibold" scope="col">Status</th>
                            <th className="w-14 px-4 py-4"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-history-border">
                        {requisitions.map((requisition) => {
                            const status = getRequisitionStatusPresentation(requisition.status);
                            const itemSummary = requisition.itemNames.length ? requisition.itemNames.join(", ") : "Nenhum item adicionado";
                            return (
                                <tr key={requisition.id} className="transition-colors hover:bg-history-card-header">
                                    <th className="min-w-48 px-5 py-4 text-left font-normal" scope="row">
                                        <Link className="rounded-sm font-semibold text-ink underline-offset-2 hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={"/requisicoes/" + requisition.id} aria-label={"Abrir requisição número " + requisition.id}>
                                            #{requisition.id} · {getRequisitionTypeLabel(requisition.type)}
                                        </Link>
                                        <span className="mt-1 block max-w-64 wrap-anywhere text-xs text-history-muted">{requisition.type === "PURCHASE" ? requisition.kitchen.name : "Destino: " + requisition.origin}</span>
                                    </th>
                                    <td className="min-w-48 px-4 py-4">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <UserAvatar name={requisition.requester.name} photoUrl={requisition.requester.photoUrl} className="size-9 shrink-0 text-xs" />
                                            <div className="grid min-w-0 gap-1"><span className="wrap-anywhere font-semibold">{requisition.requester.name}</span><span className="text-xs text-history-muted">{formatRequisitionDate(requisition.createdAt)}</span></div>
                                        </div>
                                    </td>
                                    <td className="min-w-64 max-w-80 px-4 py-4"><span className="block max-w-80 line-clamp-2 wrap-anywhere">{itemSummary}</span><span className="mt-1 block text-xs text-history-muted">{requisition.itemCount} {requisition.itemCount === 1 ? "item" : "itens"}</span></td>
                                    <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-brand">{formatRequisitionCurrency(requisition.estimatedTotal)}</td>
                                    <td className="px-4 py-4"><StatusBadge label={status.label} tone={status.tone} /></td>
                                    <td className="px-4 py-4"><Link className="grid size-10 place-items-center rounded-full bg-sidebar-active font-semibold text-brand transition-colors hover:bg-history-card-header focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={"/requisicoes/" + requisition.id} aria-label={"Ver detalhes da requisição " + requisition.id}><span aria-hidden="true">→</span></Link></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function RequisitionList(props: RequisitionListProps) {
    return (
        <section className="grid min-w-0 gap-4 xl:gap-0 xl:overflow-hidden xl:rounded-3xl xl:bg-surface xl:shadow-history-card" aria-label="Lista de requisições">
            <RequisitionCards requisitions={props.requisitions} />
            <RequisitionTable requisitions={props.requisitions} />
            <RequisitionPagination {...props} />
        </section>
    );
}
