import { useState } from "react";
import { Link } from "react-router-dom";

import type { HistoryListProps, HistoryRequest } from "../../../types/history";
import HistoryCard from "./HistoryCard";
import Mascote from "../../ui/Mascot";
import dateMarker from "../../../assets/icons/marcador-data.svg";
import errorGlyph from "../../../assets/icons/erro.svg";
import searchGlyph from "../../../assets/icons/busca.svg";

interface HistoryDayGroup {
    key: string;
    date: Date | null;
    requests: HistoryRequest[];
}

function getRequestDate(request: HistoryRequest, mode: HistoryListProps["mode"]): Date | null {
    const dateValue = mode === "withdrawal" && request.status === "APPROVED" && request.approvedAt
        ? request.approvedAt
        : request.createdAt;
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getDayKey(date: Date | null): string {
    if (!date) return "sem-data";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function groupRequestsByDate(requests: HistoryRequest[], mode: HistoryListProps["mode"]): HistoryDayGroup[] {
    const groups = new Map<string, HistoryDayGroup>();

    requests.forEach((request) => {
        const date = getRequestDate(request, mode);
        const key = getDayKey(date);
        const group = groups.get(key);
        if (group) {
            group.requests.push(request);
        } else {
            groups.set(key, { key, date, requests: [request] });
        }
    });

    return [...groups.values()];
}

function getRelativeDayLabel(date: Date | null): string | null {
    if (!date) return null;

    const today = new Date();
    const todayKey = getDayKey(today);
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const key = getDayKey(date);

    if (key === todayKey) return "Hoje";
    if (key === getDayKey(yesterday)) return "Ontem";
    return null;
}

function formatGroupDate(date: Date | null): string {
    if (!date) return "Data indisponível";
    return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" }).format(date);
}

function HistoryList({
    requests,
    mode,
    loading,
    error,
    kitchenMissing,
    canCreateKitchen,
    canRetry,
    search,
    onRetry,
    onClearSearch,
}: HistoryListProps) {
    const [expandedRequestId, setExpandedRequestId] = useState<number | "first" | null>("first");

    if (loading) {
        return (
            <div className="flex min-h-[340px] flex-col gap-3 rounded-[20px] bg-[#f7f5fc] px-7 py-6" aria-busy="true" aria-label="Carregando requisições">
                <div className="flex flex-col gap-3" aria-hidden="true">
                    {[1, 2, 3].map((item) => (
                        <div className="flex min-h-[62px] items-center gap-3.5 rounded-[18px] bg-white p-4" key={item}>
                            <span className="size-9 shrink-0 animate-pulse rounded-full bg-[#e4def0]" />
                            <div className="flex flex-col gap-2">
                                <span className="h-3 w-[170px] max-w-[38vw] animate-pulse rounded-full bg-[#e4def0]" />
                                <span className="h-2.5 w-[110px] max-w-[28vw] animate-pulse rounded-full bg-[#e4def0]" />
                            </div>
                            <span className="ml-auto h-6 w-[70px] animate-pulse rounded-full bg-[#e4def0]" />
                        </div>
                    ))}
                </div>
                <p className="mt-auto pt-1 text-center font-k2d text-[15px] text-[#6b647a]" role="status" aria-live="polite">
                    Buscando as requisições da cozinha…
                </p>
            </div>
        );
    }

    if (kitchenMissing) {
        return (
            <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-[20px] bg-[#f7f5fc] px-7 py-6 text-center">
                <Mascote size="amplo" />
                <h2 className="font-k2d text-xl font-bold text-[#221b2e]">Você ainda não tem uma cozinha</h2>
                <p className="max-w-[420px] font-k2d text-base text-[#6b647a]">
                    Crie a sua para acompanhar as requisições e as retiradas do estoque.
                </p>
                {canCreateKitchen ? (
                    <Link
                        className="mt-1 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#5700bb] px-[26px] py-[13px] font-k2d text-base font-bold text-white transition-colors hover:bg-[#360082] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5700bb]"
                        to="/cadastro/cozinha"
                    >
                        Criar cozinha
                    </Link>
                ) : (
                    <p className="font-k2d text-sm text-[#6b647a]">Peça ao administrador para vincular uma cozinha à sua conta.</p>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-[20px] bg-[#f7f5fc] p-7 text-center" role="alert">
                <span className="flex h-[79px] w-[79px] items-center justify-center rounded-[22px] bg-[#f1ecf6]">
                    <img src={errorGlyph} alt="" aria-hidden="true" width={44} height={44} />
                </span>
                <h2 className="max-w-[440px] font-k2d text-xl font-bold text-[#221b2e]">Não foi possível carregar as requisições</h2>
                <p className="max-w-[420px] font-k2d text-base text-[#6b647a]">
                    Verifique a sua conexão e tente de novo. Se continuar, avise o suporte.
                </p>
                {canRetry && (
                    <button
                        className="mt-1 min-h-12 rounded-2xl bg-[#5700bb] px-[26px] py-[13px] font-k2d text-base font-bold text-white transition-colors hover:bg-[#360082] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5700bb]"
                        type="button"
                        onClick={onRetry}
                    >
                        Tentar novamente
                    </button>
                )}
            </div>
        );
    }

    if (requests.length === 0) {
        if (search.trim()) {
            return (
                <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-[20px] bg-[#f7f5fc] p-7 text-center">
                    <span className="flex h-[79px] w-[79px] items-center justify-center rounded-[22px] bg-[#f1ecf6]">
                        <img src={searchGlyph} alt="" aria-hidden="true" width={44} height={44} />
                    </span>
                    <h2 className="max-w-[440px] break-words font-k2d text-xl font-bold text-[#221b2e]">
                        Nada encontrado para “{search.trim()}”
                    </h2>
                    <p className="max-w-[420px] font-k2d text-base text-[#6b647a]">
                        Confira o nome do produto, da pessoa ou o número da requisição.
                    </p>
                    <button
                        className="mt-1 min-h-12 rounded-2xl border-[1.5px] border-[#5700bb] bg-white px-[26px] py-[13px] font-k2d text-base font-bold text-[#5700bb] transition-colors hover:bg-[#efe7fe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5700bb]"
                        type="button"
                        onClick={onClearSearch}
                    >
                        Limpar busca
                    </button>
                </div>
            );
        }

        return (
            <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-[20px] bg-[#f7f5fc] px-7 py-6 text-center">
                <Mascote size="amplo" />
                <h2 className="font-k2d text-xl font-bold text-[#221b2e]">
                    {mode === "purchase" ? "Nenhuma solicitação por aqui" : "Nenhuma retirada aprovada ainda"}
                </h2>
                <p className="max-w-[420px] font-k2d text-base text-[#6b647a]">
                    {mode === "purchase"
                        ? "Quando alguém pedir uma compra, ela aparece nesta lista."
                        : "Quando uma requisição de consumo for aprovada, ela aparecerá nesta lista."}
                </p>
                {mode === "purchase" && (
                    <p className="max-w-[440px] font-k2d text-sm text-[#5700bb]">
                        Na aba Retirada do estoque: “Nenhuma retirada aprovada ainda.”
                    </p>
                )}
            </div>
        );
    }

    const countLabel = mode === "withdrawal"
        ? `${requests.length} ${requests.length === 1 ? "requisição de consumo aprovada" : "requisições de consumo aprovadas"}`
        : `${requests.length} ${requests.length === 1 ? "solicitação de compra" : "solicitações de compra"}`;
    const sortLabel = mode === "withdrawal"
        ? "ordenadas pela data de aprovação (ou de criação, quando não há aprovação)"
        : "ordenadas pela data de criação";
    const groups = groupRequestsByDate(requests, mode);

    return (
        <div className="flex flex-col gap-3" aria-busy={loading}>
            <p className="font-k2d text-sm text-[#6b647a]" role="status">
                <strong className="font-bold text-[#221b2e]">{countLabel}</strong>
                <span> · {sortLabel}</span>
            </p>
            {groups.map((group) => {
                const relativeLabel = getRelativeDayLabel(group.date);

                return (
                    <section className="flex flex-col gap-2" key={group.key} aria-label={`Requisições de ${formatGroupDate(group.date)}`}>
                        <h2 className="flex items-center gap-2 font-k2d text-[17px] font-bold text-[#221b2e]">
                            <span className="flex h-5 w-[18px] shrink-0 items-center justify-center">
                                <img src={dateMarker} alt="" aria-hidden="true" width={15.5885} height={20} />
                            </span>
                            {relativeLabel && <span>{relativeLabel}</span>}
                            <span className="font-normal text-[#6b647a]">{formatGroupDate(group.date)}</span>
                        </h2>
                        <div className="flex flex-col gap-2.5">
                            {group.requests.map((request) => {
                                const expanded = expandedRequestId === "first"
                                    ? groups[0]?.requests[0]?.id === request.id
                                    : expandedRequestId === request.id;

                                return (
                                    <HistoryCard
                                        key={request.id}
                                        request={request}
                                        mode={mode}
                                        expanded={expanded}
                                        onToggle={() => setExpandedRequestId(expanded ? null : request.id)}
                                    />
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

export default HistoryList;
