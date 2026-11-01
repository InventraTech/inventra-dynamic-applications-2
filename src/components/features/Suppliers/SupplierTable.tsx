import type { Supplier } from "../../../types/suppliers";
import { formatSupplierCnpj } from "../../../utils/validateSupplier";
import Button from "../../ui/Button";
import SupplierAvatar from "./SupplierAvatar";
import SupplierStatusBadge from "./SupplierStatusBadge";
import editIcon from "../../../assets/icons/editar.svg";
import emailIcon from "../../../assets/icons/email.svg";

interface SupplierTableProps {
    suppliers: Supplier[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    canManage: boolean;
    emptyTitle: string;
    emptyDescription: string;
    onClearFilters: () => void;
    onView: (supplier: Supplier, trigger: HTMLButtonElement) => void;
    onEdit: (supplier: Supplier, trigger: HTMLButtonElement) => void;
    onChangeStatus: (supplier: Supplier, trigger: HTMLButtonElement) => void;
}

function formatCreatedAt(createdAt: string): string {
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR").format(date);
}

function SupplierTable({ suppliers, totalCount, page, pageSize, totalPages, onPageChange, onPageSizeChange, canManage, emptyTitle, emptyDescription, onClearFilters, onView, onEdit, onChangeStatus }: SupplierTableProps) {
    const firstVisible = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastVisible = Math.min(page * pageSize, totalCount);

    return (
        <section className="min-w-0 rounded-3xl bg-surface p-3 shadow-history-card sm:p-5" aria-labelledby="supplier-table-title">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-1 sm:px-2">
                <div>
                    <h2 id="supplier-table-title" className="font-k2d text-lg font-bold text-sidebar-text">Cadastro de fornecedores</h2>
                    <p className="mt-1 text-sm leading-relaxed text-history-muted">Em ordem alfabética pela razão social. Busca e situação filtram os cadastros carregados.</p>
                </div>
                <p className="text-sm text-history-muted" aria-live="polite">{totalCount} {totalCount === 1 ? "fornecedor" : "fornecedores"}</p>
            </div>

            {suppliers.length === 0 ? (
                <div className="rounded-2xl bg-history-card-header px-4 py-10 text-center">
                    <p className="font-k2d font-semibold text-sidebar-text">{emptyTitle}</p>
                    <p className="mt-1 text-sm text-history-muted">{emptyDescription}</p>
                    <Button variant="outline" type="button" onClick={onClearFilters} className="mt-3">Limpar busca e filtros</Button>
                </div>
            ) : (
                <div className="min-w-0 overflow-x-auto rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" role="region" aria-label="Tabela de fornecedores. Deslize horizontalmente para consultar todos os dados." tabIndex={0}>
                    <table className="w-full min-w-260 border-collapse text-left font-k2d text-sm">
                        <caption className="sr-only">Fornecedores compartilhados, contatos, data de cadastro, situação e ações disponíveis</caption>
                        <thead className="bg-history-card-header text-xs uppercase tracking-wide text-history-muted">
                            <tr>
                                <th className="rounded-l-xl px-3 py-3 font-bold" scope="col">Fornecedor</th>
                                <th className="px-3 py-3 font-bold" scope="col">Contato</th>
                                <th className="whitespace-nowrap px-3 py-3 font-bold" scope="col">Cadastro</th>
                                <th className="px-3 py-3 font-bold" scope="col">Situação</th>
                                <th className="rounded-r-xl px-3 py-3 text-right font-bold" scope="col">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((supplier) => (
                                <tr className={`border-b border-history-border last:border-0 ${supplier.active ? "" : "text-history-muted"}`} key={supplier.id}>
                                    <th className="px-3 py-3 text-left font-normal" scope="row">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <SupplierAvatar supplier={supplier} />
                                            <span className="min-w-0">
                                                <span className="block max-w-72 wrap-anywhere font-bold text-sidebar-text">{supplier.legalName}</span>
                                                <span className="block text-xs text-history-muted">CNPJ {formatSupplierCnpj(supplier.cnpj) || supplier.cnpj}</span>
                                            </span>
                                        </div>
                                    </th>
                                    <td className="min-w-72 px-3 py-3">
                                        <div className="grid gap-1.5">
                                            <span className="flex min-w-0 items-center gap-2 wrap-anywhere">
                                                {supplier.email ? <><img className="size-4 shrink-0" src={emailIcon} alt="" aria-hidden="true" /><span>{supplier.email}</span></> : <span className="text-history-muted">E-mail não informado</span>}
                                            </span>
                                            <span className="wrap-anywhere text-xs text-history-muted">WhatsApp: {supplier.whatsapp || "não informado"}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-history-muted">{formatCreatedAt(supplier.createdAt)}</td>
                                    <td className="px-3 py-3"><SupplierStatusBadge active={supplier.active} /></td>
                                    <td className="px-3 py-3">
                                        <div className="flex min-w-max items-center justify-end gap-2">
                                            <Button variant="outline" type="button" onClick={(event) => onView(supplier, event.currentTarget)} className="h-10 w-32 shrink-0 justify-center rounded-lg px-2 text-xs">Ver detalhes</Button>
                                            {canManage && <>
                                                <Button variant="icon" type="button" onClick={(event) => onEdit(supplier, event.currentTarget)} aria-label={`Editar ${supplier.legalName}`} title={`Editar ${supplier.legalName}`} className="size-10 shrink-0 rounded-xl bg-sidebar-active p-0 text-sidebar-purple hover:bg-sidebar-line">
                                                    <img className="size-4.5" src={editIcon} alt="" aria-hidden="true" />
                                                </Button>
                                                <Button variant="outline" type="button" onClick={(event) => onChangeStatus(supplier, event.currentTarget)} className={`h-10 w-24 shrink-0 justify-center rounded-lg px-2 text-xs ${supplier.active ? "border-feedback-error/40 text-feedback-error hover:bg-feedback-error-bg" : "border-feedback-success/40 text-feedback-success hover:bg-feedback-success-bg"}`}>
                                                    {supplier.active ? "Desativar" : "Reativar"}
                                                </Button>
                                            </>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-history-border px-2 pt-3 text-xs text-history-muted">
                <div className="grid gap-1">
                    <span aria-live="polite">Mostrando {firstVisible}–{lastVisible} de {totalCount} {totalCount === 1 ? "fornecedor" : "fornecedores"}</span>
                    <span>{canManage ? "Edição, foto e situação: somente supervisor." : "A lista ativa é somente para consulta."}</span>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <nav className="flex items-center gap-2" aria-label="Paginação de fornecedores">
                        <Button variant="ghost" type="button" className="size-9 px-0 text-sidebar-purple hover:bg-sidebar-active disabled:opacity-50" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior">←</Button>
                        <span className="whitespace-nowrap" aria-live="polite">Página {page} de {totalPages}</span>
                        <Button variant="ghost" type="button" className="size-9 px-0 text-sidebar-purple hover:bg-sidebar-active disabled:opacity-50" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Próxima página">→</Button>
                    </nav>
                    <label className="flex items-center gap-2" htmlFor="supplier-page-size">
                        <span>por página</span>
                        <select id="supplier-page-size" className="min-h-9 rounded-full border border-history-border bg-surface px-3 font-k2d text-sm text-sidebar-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </label>
                </div>
            </div>
        </section>
    );
}

export default SupplierTable;
