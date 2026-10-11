import type { HistoryCardProps, HistoryItem } from "../../../types/history";
import HistoryStatusBadge from "./HistoryStatusBadge";
import expandIcon from "../../../assets/icons/history-v2/accordion-up.svg";
import collapseIcon from "../../../assets/icons/history-v2/accordion-down.svg";

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
    const extraItems = request.items.length - 2;

    return (
        <article className={`rounded-3xl border-2 bg-white px-6 py-4 shadow-history-card transition-colors max-sm:px-4 ${expanded ? "border-[#5700bb]" : "border-transparent"}`}>
            <div className="grid grid-cols-1 items-center gap-x-5 gap-y-4 min-[1100px]:grid-cols-[minmax(150px,0.8fr)_minmax(170px,1fr)_minmax(190px,1.2fr)] min-[1700px]:grid-cols-[230px_250px_minmax(180px,1fr)_200px_auto]">
                <div className="flex min-w-0 flex-col gap-[3px]">
                    <h3 className="truncate font-k2d text-[19px] font-bold text-[#221b2e]">Requisição #{request.id}</h3>
                    <p className="font-k2d text-sm text-[#6b647a]">{formatSummaryDate(request, mode)}</p>
                </div>

                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#efe7fe] font-k2d text-sm font-bold text-[#5700bb]">
                        {getInitials(request.requester.name)}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-k2d text-base font-bold text-[#221b2e]">{request.requester.name}</p>
                        <p className="truncate font-k2d text-sm text-[#6b647a]">
                            Aprovador: {request.approver?.name ?? (request.status === "UNDER_REVIEW" ? "Aguardando aprovação" : "—")}
                        </p>
                    </div>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2" aria-label="Produtos da requisição">
                    {request.items.slice(0, 2).map((item) => (
                        <span className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-[#e4def0] bg-[#f7f5fc] py-1.5 pl-2 pr-3" key={item.id}>
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#efe7fe] font-k2d text-xs font-bold text-[#5700bb]">
                                {getFirstLetter(item.product.name)}
                            </span>
                            <span className="max-w-32 truncate font-k2d text-sm font-medium text-[#221b2e]">{item.product.name}</span>
                            <span className="font-k2d text-sm font-bold text-[#5700bb]">{formatQuantity(item.quantity)}</span>
                        </span>
                    ))}
                    {extraItems > 0 && (
                        <span className="rounded-full bg-[#efe7fe] px-3 py-1.5 font-k2d text-sm font-bold text-[#5700bb]">
                            +{extraItems} {extraItems === 1 ? "item" : "itens"}
                        </span>
                    )}
                </div>

                <div className="min-w-0 min-[1100px]:col-span-2 min-[1700px]:col-span-1">
                    <p className="font-k2d text-[13px] text-[#6b647a]">Motivo</p>
                    <p className="truncate font-k2d text-sm text-[#221b2e]">{request.reason || "—"}</p>
                </div>

                <div className="flex items-center justify-between gap-3 min-[1100px]:col-span-2 min-[1700px]:col-span-1 min-[1700px]:justify-end">
                    <HistoryStatusBadge status={request.status} />
                    <button
                        aria-label={`${expanded ? "Recolher" : "Expandir"} requisição #${request.id}`}
                        aria-controls={detailsId}
                        aria-expanded={expanded}
                        className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5700bb] ${expanded ? "bg-[#efe7fe]" : "bg-[#f7f5fc] hover:bg-[#efe7fe]"}`}
                        onClick={onToggle}
                        type="button"
                    >
                        <img src={expanded ? expandIcon : collapseIcon} alt="" aria-hidden="true" width={20} height={20} />
                    </button>
                </div>
            </div>

            <div className="mt-4 border-t border-[#edeaf5] pt-4" id={detailsId} hidden={!expanded}>
                {expanded && (
                    <div className="flex flex-col gap-5 lg:flex-row lg:gap-10">
                        <dl className="flex shrink-0 flex-col gap-3 lg:w-[280px]">
                            <div>
                                <dt className="font-k2d text-[13px] text-[#6b647a]">Motivo da requisição</dt>
                                <dd className="break-words font-k2d text-base text-[#221b2e]">{request.reason || "—"}</dd>
                            </div>
                            <div>
                                <dt className="font-k2d text-[13px] text-[#6b647a]">Solicitante</dt>
                                <dd className="break-words font-k2d text-base text-[#221b2e]">{request.requester.name}</dd>
                            </div>
                            <div>
                                <dt className="font-k2d text-[13px] text-[#6b647a]">Aprovador</dt>
                                <dd className="break-words font-k2d text-base text-[#221b2e]">
                                    {request.approver?.name ?? (request.status === "UNDER_REVIEW" ? "Aguardando aprovação" : "—")}
                                    {mode === "withdrawal" && request.status === "APPROVED" && request.approvedAt && (
                                        <span className="block text-sm text-[#6b647a]">aprovada em {formatSummaryDate(request, mode).replace("Aprovada em ", "")}</span>
                                    )}
                                </dd>
                            </div>
                        </dl>

                        <div className="min-w-0 flex-1 overflow-x-auto">
                            <table className={`w-full border-collapse text-left font-k2d ${mode === "purchase" ? "min-w-[760px]" : "min-w-[520px]"}`}>
                                <thead className="bg-[#f7f5fc] text-[13px] text-[#6b647a]">
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
                                        <tr className="border-b border-[#edeaf5] last:border-0" key={item.id}>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-[#efe7fe] font-k2d text-sm font-bold text-[#5700bb]">
                                                        {getFirstLetter(item.product.name)}
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate font-k2d text-sm font-bold text-[#221b2e]">{item.product.name}</span>
                                                        <span className="block truncate font-k2d text-[13px] text-[#6b647a]">{item.product.brand}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 font-k2d text-base font-bold text-[#221b2e]">{formatProductQuantity(item)}</td>
                                            {mode === "purchase" && (
                                                <>
                                                    <td className="px-3 py-2.5 font-k2d text-sm text-[#221b2e]">{item.suggestedSupplier?.legalName ?? "—"}</td>
                                                    <td className="whitespace-nowrap px-3 py-2.5 font-k2d text-sm text-[#221b2e]">{formatCurrency(item.estimatedPrice)}</td>
                                                </>
                                            )}
                                            <td className="px-3 py-2.5 font-k2d text-sm text-[#221b2e]">{item.note?.trim() || "—"}</td>
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
