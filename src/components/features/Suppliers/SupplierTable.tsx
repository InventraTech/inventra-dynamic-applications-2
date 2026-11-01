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
    canManage: boolean;
    onView: (supplier: Supplier, trigger: HTMLButtonElement) => void;
    onEdit: (supplier: Supplier, trigger: HTMLButtonElement) => void;
    onChangeStatus: (supplier: Supplier, trigger: HTMLButtonElement) => void;
}

function formatCreatedAt(createdAt: string): string {
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR").format(date);
}

function SupplierTable({ suppliers, totalCount, canManage, onView, onEdit, onChangeStatus }: SupplierTableProps) {
    return (
        <section className="min-w-0 rounded-3xl bg-surface p-3 shadow-history-card sm:p-5" aria-labelledby="supplier-table-title">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-1 sm:px-2">
                <div>
                    <h2 id="supplier-table-title" className="font-k2d text-lg font-bold text-sidebar-text">Cadastro de fornecedores</h2>
                    <p className="mt-1 text-sm leading-relaxed text-history-muted">Em ordem alfabética pela razão social. Busca e situação filtram os cadastros carregados.</p>
                </div>
                <p className="text-sm text-history-muted" aria-live="polite">{suppliers.length} {suppliers.length === 1 ? "fornecedor" : "fornecedores"}</p>
            </div>

            {suppliers.length === 0 ? (
                <div className="rounded-2xl bg-history-card-header px-4 py-10 text-center">
                    <p className="font-k2d font-semibold text-sidebar-text">Nenhum fornecedor corresponde à busca ou situação selecionada.</p>
                    <p className="mt-1 text-sm text-history-muted">Altere a busca ou escolha outro filtro.</p>
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
                                        <div className="flex min-w-max justify-end gap-2">
                                            <Button variant="outline" type="button" onClick={(event) => onView(supplier, event.currentTarget)} className="min-h-9 rounded-lg px-3 py-1.5 text-xs">Ver detalhes</Button>
                                            {canManage && <>
                                                <Button variant="icon" type="button" onClick={(event) => onEdit(supplier, event.currentTarget)} aria-label={`Editar ${supplier.legalName}`} title={`Editar ${supplier.legalName}`} className="size-10 rounded-xl bg-sidebar-active text-sidebar-purple hover:bg-sidebar-line">
                                                    <img className="size-4.5" src={editIcon} alt="" aria-hidden="true" />
                                                </Button>
                                                <Button variant="outline" type="button" onClick={(event) => onChangeStatus(supplier, event.currentTarget)} className={`min-h-9 rounded-lg px-3 py-1.5 text-xs ${supplier.active ? "border-feedback-error/40 text-feedback-error hover:bg-feedback-error-bg" : "border-feedback-success/40 text-feedback-success hover:bg-feedback-success-bg"}`}>
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

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-history-muted">
                <span>Mostrando {suppliers.length} de {totalCount} {totalCount === 1 ? "fornecedor" : "fornecedores"}. A API devolve a lista inteira, sem paginação.</span>
                <span>{canManage ? "Edição, foto e situação: somente supervisor." : "A lista ativa é somente para consulta."}</span>
            </div>
        </section>
    );
}

export default SupplierTable;
