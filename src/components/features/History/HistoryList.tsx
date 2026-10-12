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
            <div className="flex min-h-85 flex-col gap-3 rounded-[20px] bg-history-card-header px-7 py-6" aria-busy="true" aria-label="Carregando requisições">
                <div className="flex flex-col gap-3" aria-hidden="true">
                    {[1, 2, 3].map((item) => (
                        <div className="flex min-h-15.5 items-center gap-3.5 rounded-[18px] bg-white p-4" key={item}>
                            <span className="size-9 shrink-0 animate-pulse rounded-full bg-[#e4def0]" />
                            <div className="flex flex-col gap-2">
                                <span className="h-3 w-42.5 max-w-[38vw] animate-pulse rounded-full bg-[#e4def0]" />
                                <span className="h-2.5 w-27.5 max-w-[28vw] animate-pulse rounded-full bg-[#e4def0]" />
                            </div>
                            <span className="ml-auto h-6 w-17.5 animate-pulse rounded-full bg-[#e4def0]" />
                        </div>
                    ))}
                </div>
                <p className="mt-auto pt-1 text-center font-k2d text-[15px] text-login-footer-copy" role="status" aria-live="polite">
                    Buscando as requisições da cozinha…
                </p>
            </div>
        );
    }

    if (kitchenMissing) {
        return (
            <div className="flex min-h-85 flex-col items-center justify-center gap-3 rounded-[20px] bg-history-card-header px-7 py-6 text-center">
                <Mascote size="amplo" />
                <h2 className="font-k2d text-xl font-bold text-sidebar-text">Você ainda não tem uma cozinha</h2>
                <p className="max-w-105 font-k2d text-base text-login-footer-copy">
                    Crie a sua para acompanhar as requisições e as retiradas do estoque.
                </p>
                {canCreateKitchen ? (
                    <Link
                        className="mt-1 inline-flex min-h-12 items-center justify-center rounded-2xl bg-sidebar-indicator px-6.5 py-3.25 font-k2d text-base font-bold text-white transition-colors hover:bg-sidebar-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-indicator"
                        to="/cadastro/cozinha"
                    >
                        Criar cozinha
                    </Link>
                ) : (
                    <p className="font-k2d text-sm text-login-footer-copy">Peça ao administrador para vincular uma cozinha à sua conta.</p>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-85 flex-col items-center justify-center gap-3 rounded-[20px] bg-history-card-header p-7 text-center" role="alert">
                <span className="flex size-19.75 items-center justify-center rounded-history-tabs bg-login-field">
                    <img src={errorGlyph} alt="" aria-hidden="true" width={44} height={44} />
                </span>
                <h2 className="max-w-110 font-k2d text-xl font-bold text-sidebar-text">Não foi possível carregar as requisições</h2>
                <p className="max-w-105 font-k2d text-base text-login-footer-copy">
                    Verifique a sua conexão e tente de novo. Se continuar, avise o suporte.
                </p>
                {canRetry && (
                    <button
                        className="mt-1 min-h-12 rounded-2xl bg-sidebar-indicator px-6.5 py-3.25 font-k2d text-base font-bold text-white transition-colors hover:bg-sidebar-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-indicator"
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
                <div className="flex min-h-85 flex-col items-center justify-center gap-3 rounded-[20px] bg-history-card-header p-7 text-center">
                    <span className="flex size-19.75 items-center justify-center rounded-history-tabs bg-login-field">
                        <img src={searchGlyph} alt="" aria-hidden="true" width={44} height={44} />
                    </span>
                    <h2 className="max-w-110 wrap-break-word font-k2d text-xl font-bold text-sidebar-text">
                        Nada encontrado para “{search.trim()}”
                    </h2>
                    <p className="max-w-105 font-k2d text-base text-login-footer-copy">
                        Confira o nome do produto, da pessoa ou o número da requisição.
                    </p>
                    <button
                        className="mt-1 min-h-12 rounded-2xl border-[1.5px] border-sidebar-indicator bg-white px-6.5 py-3.25 font-k2d text-base font-bold text-sidebar-indicator transition-colors hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-indicator"
                        type="button"
                        onClick={onClearSearch}
                    >
                        Limpar busca
                    </button>
                </div>
            );
        }

        return (
            <div className="flex min-h-85 flex-col items-center justify-center gap-3 rounded-[20px] bg-history-card-header px-7 py-6 text-center">
                <Mascote size="amplo" />
                <h2 className="font-k2d text-xl font-bold text-sidebar-text">
                    {mode === "purchase" ? "Nenhuma solicitação por aqui" : "Nenhuma retirada aprovada ainda"}
                </h2>
                <p className="max-w-105 font-k2d text-base text-login-footer-copy">
                    {mode === "purchase"
                        ? "Quando alguém pedir uma compra, ela aparece nesta lista."
                        : "Quando uma requisição de consumo for aprovada, ela aparecerá nesta lista."}
                </p>
                {mode === "purchase" && (
                    <p className="max-w-110 font-k2d text-sm text-sidebar-indicator">
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
            <p className="font-k2d text-sm text-login-footer-copy" role="status">
                <strong className="font-bold text-sidebar-text">{countLabel}</strong>
                <span> · {sortLabel}</span>
            </p>
            {groups.map((group) => {
                const relativeLabel = getRelativeDayLabel(group.date);

                return (
                    <section className="flex flex-col gap-2" key={group.key} aria-label={`Requisições de ${formatGroupDate(group.date)}`}>
                        <h2 className="flex items-center gap-2 font-k2d text-[17px] font-bold text-sidebar-text">
                            <span className="flex h-5 w-4.5 shrink-0 items-center justify-center">
                                <img src={dateMarker} alt="" aria-hidden="true" width={15.5885} height={20} />
                            </span>
                            {relativeLabel && <span>{relativeLabel}</span>}
                            <span className="font-normal text-login-footer-copy">{formatGroupDate(group.date)}</span>
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
