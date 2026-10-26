import type { HistoryCardProps, HistoryItem } from "../../../types/history";
import HistoryStatusBadge from "./HistoryStatusBadge";
import expandIcon from "../../../assets/icons/seta-cima.svg";
import collapseIcon from "../../../assets/icons/seta-baixo.svg";
import UserAvatar from "../../ui/UserAvatar";

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    const first = [...parts[0]][0] ?? "?";
    const last = parts.length > 1 ? [...parts[parts.length - 1]][0] : undefined;
    return `${first}${last ?? ""}`.toLocaleUpperCase("pt-BR");
}

function getFirstLetter(value: string): string {
    return [...value.trim()][0]?.toLocaleUpperCase("pt-BR") ?? "?";
}

function formatQuantity(quantity: number): string {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(quantity);
}

function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getRequestTimestamp(request: HistoryCardProps["request"], mode: HistoryCardProps["mode"]): string {
    return mode === "withdrawal" && request.status === "APPROVED" && request.approvedAt
        ? request.approvedAt
        : request.createdAt;
}

function formatSummaryDate(request: HistoryCardProps["request"], mode: HistoryCardProps["mode"]): string {
    const approved = mode === "withdrawal" && request.status === "APPROVED" && Boolean(request.approvedAt);
    const timestamp = new Date(getRequestTimestamp(request, mode));
    if (Number.isNaN(timestamp.getTime())) return "Data indisponível";

    const parts = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).formatToParts(timestamp);
    const day = parts.find((part) => part.type === "day")?.value ?? "";
    const month = parts.find((part) => part.type === "month")?.value.replace(".", "") ?? "";
    const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(timestamp);
    return `${approved ? "Aprovada" : "Criada"} em ${day} ${month} · ${time}`;
}

function formatProductQuantity(item: HistoryItem): string {
    const quantity = formatQuantity(item.quantity);
    return item.product.unit ? `${quantity} ${item.product.unit}` : quantity;
}

function HistoryCard({ request, mode, expanded, onToggle }: HistoryCardProps) {
    const detailsId = `history-request-${mode}-${request.id}-details`;

    return (
        <article className={`rounded-3xl border-2 bg-surface px-6 py-4 shadow-history-card transition-colors max-sm:px-4 ${expanded ? "border-sidebar-indicator" : "border-transparent"}`}>
            <div className="grid min-w-0 grid-cols-1 items-center gap-x-5 gap-y-4 xl:grid-cols-4 large-text:grid-cols-1">
                <div className="flex min-w-0 flex-col gap-0.75">
                    <h3 className="wrap-anywhere font-k2d text-xl font-bold text-sidebar-text">Requisição #{request.id}</h3>
                    <p className="font-k2d text-sm text-login-footer-copy">{formatSummaryDate(request, mode)}</p>
                </div>

                <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar className="size-9.5 text-sm" name={request.requester.name} photoUrl={request.requester.photoUrl} fallbackText={getInitials(request.requester.name)} />
                    <div className="min-w-0">
                        <p className="wrap-anywhere font-k2d text-base font-bold text-sidebar-text">{request.requester.name}</p>
                        <p className="wrap-anywhere font-k2d text-sm text-login-footer-copy">
                            Aprovador: {request.approver?.name ?? (request.status === "UNDER_REVIEW" ? "Aguardando aprovação" : "—")}
                        </p>
                    </div>
                </div>

                <div className="min-w-0 xl:text-right">
                    <p className="font-k2d text-sm text-login-footer-copy">Total estimado</p>
                    <p className="wrap-anywhere font-k2d text-base font-bold text-sidebar-text">{formatCurrency(request.estimatedTotal)}</p>
                </div>

                <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 xl:justify-end large-text:justify-between">
                    <HistoryStatusBadge status={request.status} />
                    <button
                        aria-label={`${expanded ? "Recolher" : "Expandir"} requisição #${request.id}`}
                        aria-controls={detailsId}
                        aria-expanded={expanded}
                        className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-history-border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-indicator ${expanded ? "bg-sidebar-active" : "bg-history-card-header hover:bg-sidebar-active"}`}
                        onClick={onToggle}
                        type="button"
                    >
                        <img src={expanded ? expandIcon : collapseIcon} alt="" aria-hidden="true" width={20} height={20} />
                    </button>
                </div>
            </div>

            <div className="mt-4 border-t border-history-border pt-4" id={detailsId} hidden={!expanded}>
                {expanded && (
                    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:gap-10 large-text:flex-col">
                        <dl className="flex min-w-0 shrink-0 flex-col gap-3 lg:w-70 large-text:w-full">
                            <div>
                                <dt className="font-k2d text-sm text-login-footer-copy">Motivo da requisição</dt>
                                <dd className="break-words font-k2d text-base text-sidebar-text">{request.reason || "—"}</dd>
                            </div>
                            <div>
                                <dt className="font-k2d text-sm text-login-footer-copy">Solicitante</dt>
                                <dd className="break-words font-k2d text-base text-sidebar-text">{request.requester.name}</dd>
                            </div>
                            <div>
                                <dt className="font-k2d text-sm text-login-footer-copy">Aprovador</dt>
                                <dd className="break-words font-k2d text-base text-sidebar-text">
                                    {request.approver?.name ?? (request.status === "UNDER_REVIEW" ? "Aguardando aprovação" : "—")}
                                    {mode === "withdrawal" && request.status === "APPROVED" && request.approvedAt && (
                                        <span className="block text-sm text-login-footer-copy">aprovada em {formatSummaryDate(request, mode).replace("Aprovada em ", "")}</span>
                                    )}
                                </dd>
                            </div>
                        </dl>

                        <div className="min-w-0 flex-1 overflow-x-auto rounded-xl" tabIndex={0} role="region" aria-label={`Itens da requisição ${request.id}; tabela com rolagem horizontal`}>
                            <table className={`w-full border-collapse text-left font-k2d ${mode === "purchase" ? "min-w-190" : "min-w-130"}`}>
                                <caption className="sr-only">Itens da requisição {request.id}</caption>
                                <thead className="bg-history-card-header text-sm text-login-footer-copy">
                                    <tr>
                                        <th className="rounded-l-xl px-3 py-2 font-medium" scope="col">Produto</th>
                                        <th className="px-3 py-2 font-medium" scope="col">Qtd.</th>
                                        {mode === "purchase" && (
                                            <>
                                                <th className="px-3 py-2 font-medium" scope="col">Fornecedor sugerido</th>
                                                <th className="px-3 py-2 font-medium" scope="col">Preço estimado</th>
                                            </>
                                        )}
                                        <th className="rounded-r-xl px-3 py-2 font-medium" scope="col">Observação do item</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {request.items.map((item) => (
                                        <tr className="border-b border-history-border last:border-0" key={item.id}>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-sidebar-active font-k2d text-sm font-bold text-sidebar-indicator">
                                                        {getFirstLetter(item.product.name)}
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block wrap-anywhere font-k2d text-sm font-bold text-sidebar-text">{item.product.name}</span>
                                                        <span className="block wrap-anywhere font-k2d text-sm text-login-footer-copy">{item.product.brand}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 font-k2d text-base font-bold text-sidebar-text">{formatProductQuantity(item)}</td>
                                            {mode === "purchase" && (
                                                <>
                                                    <td className="px-3 py-2.5 font-k2d text-sm text-sidebar-text">{item.suggestedSupplier?.legalName ?? "—"}</td>
                                                    <td className="whitespace-nowrap px-3 py-2.5 font-k2d text-sm text-sidebar-text">{formatCurrency(item.estimatedPrice)}</td>
                                                </>
                                            )}
                                            <td className="px-3 py-2.5 font-k2d text-sm text-sidebar-text">{item.note?.trim() || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

export default HistoryCard;
