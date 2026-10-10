import { useEffect, useMemo, useState } from "react";

import type { HistoryProps } from "../../../types/history";
import { ApiError } from "../../../services/api";
import { getSession } from "../../../services/authSession";
import { getHistoryRows } from "../../../services/history";
import HistoryTabs from "./HistoryTabs";
import HistorySearch from "./HistorySearch";
import HistoryTable from "./HistoryTable";
import { HISTORY_PAGE_SIZE } from "./constants";

function getLoadError(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) {
        return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    }
    return "Não foi possível carregar o histórico. Tente novamente.";
}

function HistoryContent({ mode }: HistoryProps) {
    const [session] = useState(() => getSession());
    const [allRows, setAllRows] = useState<Awaited<ReturnType<typeof getHistoryRows>>>([]);
    const [completedLoadKey, setCompletedLoadKey] = useState<string | null>(null);
    const [loadFailure, setLoadFailure] = useState<{ key: string; message: string } | null>(null);
    const [searchState, setSearchState] = useState({ mode, value: "" });
    const [pageState, setPageState] = useState({ mode, page: 1 });
    const [retryKey, setRetryKey] = useState(0);
    const kitchenId = session?.user.kitchen?.id;
    const loadKey = `${mode}:${kitchenId ?? "unlinked"}:${retryKey}`;
    const loading = Boolean(kitchenId) && completedLoadKey !== loadKey;
    const error = !kitchenId
        ? "Este usuário ainda não está associado a uma cozinha. Peça ao administrador para vincular uma cozinha à sua conta."
        : loadFailure?.key === loadKey
            ? loadFailure.message
            : null;
    const search = searchState.mode === mode ? searchState.value : "";
    const page = pageState.mode === mode ? pageState.page : 1;

    useEffect(() => {
        if (!kitchenId) return;

        const controller = new AbortController();
        getHistoryRows(mode, kitchenId, controller.signal)
            .then((result) => setAllRows(result))
            .catch((loadError: unknown) => {
                if (!controller.signal.aborted) {
                    setLoadFailure({ key: loadKey, message: getLoadError(loadError) });
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setCompletedLoadKey(loadKey);
            });

        return () => controller.abort();
    }, [mode, retryKey, kitchenId, loadKey]);

    const filteredRows = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
        if (!normalizedSearch) return allRows;

        return allRows.filter((row) =>
            [row.id, row.product, row.brand, row.status]
                .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedSearch)),
        );
    }, [allRows, search]);

    const pageCount = Math.max(1, Math.ceil(filteredRows.length / HISTORY_PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const pageRows = filteredRows.slice((currentPage - 1) * HISTORY_PAGE_SIZE, currentPage * HISTORY_PAGE_SIZE);

    return (
        <section className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden px-6 pb-6 pt-6 max-md:px-4 max-sm:px-3">
            <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <HistoryTabs mode={mode} />
                <HistorySearch
                    mode={mode}
                    value={search}
                    onChange={(value) => {
                        setSearchState({ mode, value });
                        setPageState({ mode, page: 1 });
                    }}
                />
            </div>
            <HistoryTable
                rows={pageRows}
                mode={mode}
                totalRows={filteredRows.length}
                page={currentPage}
                pageCount={pageCount}
                loading={loading}
                error={error}
                canRetry={Boolean(kitchenId)}
                onPageChange={(nextPage) => setPageState({ mode, page: nextPage })}
                onRetry={() => setRetryKey((key) => key + 1)}
            />
        </section>
    );
}

export default HistoryContent;
