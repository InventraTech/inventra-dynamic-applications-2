import type { HistoryTableProps } from "../../../types/history";
import { HISTORY_PAGE_SIZE } from "./constants";
import HistoryStatusBadge from "./HistoryStatusBadge";
import withdrawalPreviousIcon from "../../../assets/icons/history-1-pagination-prev.svg";
import withdrawalNextIcon from "../../../assets/icons/history-1-pagination-next.svg";
import purchasePreviousIcon from "../../../assets/icons/history-2-pagination-prev.svg";
import purchaseNextIcon from "../../../assets/icons/history-2-pagination-next.svg";

function HistoryTable({
    rows,
    mode,
    totalRows,
    page,
    pageCount,
    loading,
    error,
    canRetry,
    onPageChange,
    onRetry,
}: HistoryTableProps) {
    const columns = ["Status", "Produto", "ID", "Data", "Hora", "Quantidade", "Marca"];
    const previousIcon = mode === "withdrawal" ? withdrawalPreviousIcon : purchasePreviousIcon;
    const nextIcon = mode === "withdrawal" ? withdrawalNextIcon : purchaseNextIcon;
    const firstRow = totalRows === 0 ? 0 : (page - 1) * HISTORY_PAGE_SIZE + 1;
    const lastRow = Math.min(page * HISTORY_PAGE_SIZE, totalRows);
    const visiblePageStart = Math.max(1, Math.min(page - 2, pageCount - 4));
    const visiblePages = Array.from(
        { length: Math.min(5, pageCount) },
        (_, index) => visiblePageStart + index,
    );

    return (
        <div className="w-full min-w-0 overflow-x-auto rounded-3xl bg-white shadow-history-card" aria-busy={loading}>
            <div className="flex min-w-max flex-col gap-1 px-5 pb-2 pt-4">
                <div className="flex h-10 min-w-max items-center overflow-hidden rounded-xl bg-history-card-header px-4">
                    {columns.map((column, index) => (
                        <div className={`${index === 0 ? "w-34" : index === 1 ? "w-60" : index === 2 ? "w-24" : index === 3 ? "w-28" : index === 4 ? "w-22" : index === 5 ? "w-30" : "flex-1"} flex shrink-0 items-center overflow-hidden`} key={column}>
                            <span className="font-k2d text-history-header font-semibold uppercase tracking-history-header text-history-muted whitespace-nowrap">
                                {column}
                            </span>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex min-h-44 items-center justify-center gap-3 px-6 font-k2d text-sm text-history-muted" role="status">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-sidebar-line border-t-sidebar-purple" aria-hidden="true" />
                        Carregando histórico…
                    </div>
                ) : error ? (
                    <div className="flex min-h-44 flex-col items-center justify-center gap-3 px-6 text-center" role="alert">
                        <p className="max-w-xl font-k2d text-sm text-history-muted">{error}</p>
                        {canRetry && (
                            <button
                                className="rounded-full bg-sidebar-purple px-4 py-2 font-k2d text-sm font-semibold text-white transition-colors hover:bg-sidebar-indicator focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-purple"
                                type="button"
                                onClick={onRetry}
                            >
                                Tentar novamente
                            </button>
                        )}
                    </div>
                ) : rows.length === 0 ? (
                    <div className="flex min-h-44 items-center justify-center px-6 text-center font-k2d text-sm text-history-muted">
                        Nenhum registro encontrado.
                    </div>
                ) : rows.map((row) => (
                    <div className="flex h-14 min-w-max items-center overflow-hidden border-b border-history-border px-4" key={row.key}>
                        <div className="flex w-34 shrink-0 items-center">
                            <HistoryStatusBadge row={row} mode={mode} />
                        </div>
                        <div className="flex w-60 shrink-0 items-center gap-2 overflow-hidden">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-history-avatar">
                                <span className="font-k2d text-sm font-bold text-sidebar-purple">{row.initial}</span>
                            </div>
                            <span className="font-k2d text-sm font-bold text-sidebar-text whitespace-nowrap">{row.product}</span>
                        </div>
                        <div className="flex w-24 shrink-0 items-center overflow-hidden">
                            <span className="font-k2d text-history-body font-medium text-history-muted whitespace-nowrap">{row.id}</span>
                        </div>
                        <div className="flex w-28 shrink-0 items-center overflow-hidden">
                            <span className="font-k2d text-history-body text-sidebar-text whitespace-nowrap">{row.date}</span>
                        </div>
                        <div className="flex w-22 shrink-0 items-center overflow-hidden">
                            <span className="font-k2d text-history-body text-history-muted whitespace-nowrap">{row.time}</span>
                        </div>
                        <div className="flex w-30 shrink-0 items-center overflow-hidden">
                            <span className="font-k2d text-sm font-bold text-sidebar-text whitespace-nowrap">{row.quantity}</span>
                        </div>
                        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
                            <span className="font-k2d text-history-body text-sidebar-text whitespace-nowrap">{row.brand}</span>
                        </div>
                    </div>
                ))}

                <footer className="flex flex-col items-start justify-between gap-3 border-t border-history-border pb-1 pt-3 sm:flex-row sm:items-center">
                    <span className="font-k2d text-history-tab text-history-muted">
                        Mostrando {firstRow}–{lastRow} de {totalRows} registros
                    </span>
                    <div className="flex items-center gap-2" aria-label="Paginação do histórico">
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-history-card-header disabled:opacity-50"
                            type="button"
                            disabled={page <= 1 || loading || Boolean(error)}
                            onClick={() => onPageChange(page - 1)}
                            aria-label="Página anterior"
                        >
                            <img src={previousIcon} alt="" aria-hidden="true" />
                        </button>
                        {visiblePages.map((pageNumber) => (
                            <button
                                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 font-k2d text-history-tab font-bold ${pageNumber === page ? "bg-sidebar-purple text-white" : "bg-history-card-header text-history-muted hover:bg-sidebar-active"}`}
                                type="button"
                                key={pageNumber}
                                aria-label={`Página ${pageNumber}`}
                                aria-current={pageNumber === page ? "page" : undefined}
                                disabled={loading || Boolean(error)}
                                onClick={() => onPageChange(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        ))}
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-history-card-header disabled:opacity-50"
                            type="button"
                            disabled={page >= pageCount || loading || Boolean(error)}
                            onClick={() => onPageChange(page + 1)}
                            aria-label="Próxima página"
                        >
                            <img src={nextIcon} alt="" aria-hidden="true" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default HistoryTable;
