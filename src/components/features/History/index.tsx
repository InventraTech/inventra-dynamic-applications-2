import { useEffect, useMemo, useState } from "react";

import type { HistoryProps, HistoryRequest } from "../../../types/history";
import { ApiError } from "../../../services/api";
import { getSession, updateSessionKitchen } from "../../../services/authSession";
import { getCurrentUser } from "../../../services/authService";
import { getHistoryRequests } from "../../../services/history";
import HistoryTabs from "./HistoryTabs";
import HistorySearch from "./HistorySearch";
import HistoryList from "./HistoryList";

function getLoadError(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) {
        return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    }
    return "Não foi possível carregar o histórico. Tente novamente.";
}

function HistoryContent({ mode }: HistoryProps) {
    const [session] = useState(() => getSession());
    const [kitchen, setKitchen] = useState(() => session?.user.kitchen ?? null);
    const [checkingKitchen, setCheckingKitchen] = useState(() => Boolean(session && !session.user.kitchen));
    const [kitchenFailure, setKitchenFailure] = useState<string | null>(null);
    const [allRequests, setAllRequests] = useState<HistoryRequest[]>([]);
    const [completedLoadKey, setCompletedLoadKey] = useState<string | null>(null);
    const [loadFailure, setLoadFailure] = useState<{ key: string; message: string } | null>(null);
    const [searchState, setSearchState] = useState({ mode, value: "" });
    const [retryKey, setRetryKey] = useState(0);
    const kitchenId = kitchen?.id;
    const loadKey = `${mode}:${kitchenId ?? "unlinked"}:${retryKey}`;
    const loading = checkingKitchen || (Boolean(kitchenId) && completedLoadKey !== loadKey);
    const error = kitchenFailure ?? (checkingKitchen ? null : loadFailure?.key === loadKey ? loadFailure.message : null);
    const kitchenMissing = !checkingKitchen && !kitchenFailure && !kitchenId;
    const profile = session?.user.profile;
    const accessType = typeof profile === "string" ? profile : profile?.accessType;
    const canCreateKitchen = accessType?.toLocaleLowerCase("pt-BR") === "supervisor";
    const search = searchState.mode === mode ? searchState.value : "";

    useEffect(() => {
        if (!session || session.user.kitchen) return;

        const controller = new AbortController();

        getCurrentUser(controller.signal)
            .then((user) => {
                if (controller.signal.aborted) return;
                setKitchen(user.kitchen);
                if (user.kitchen) updateSessionKitchen(user.kitchen);
            })
            .catch((profileError: unknown) => {
                if (!controller.signal.aborted) setKitchenFailure(getLoadError(profileError));
            })
            .finally(() => {
                if (!controller.signal.aborted) setCheckingKitchen(false);
            });

        return () => controller.abort();
    }, [session, retryKey]);

    useEffect(() => {
        if (!kitchenId) return;

        const controller = new AbortController();
        getHistoryRequests(mode, kitchenId, controller.signal)
            .then((result) => setAllRequests(result))
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

    const filteredRequests = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
        if (!normalizedSearch) return allRequests;

        return allRequests.filter((request) => [
            String(request.id),
            request.reason ?? "",
            request.requester.name,
            request.approver?.name ?? "",
            ...request.items.flatMap(({ product }) => [product.name, product.brand]),
        ].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedSearch)));
    }, [allRequests, search]);

    return (
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-10 pb-10 pt-8 max-xl:px-6 max-md:px-4 max-sm:px-3">
            <div className="flex shrink-0 flex-col items-stretch gap-3 xl:flex-row xl:items-center xl:justify-between large-text:flex-col large-text:items-stretch">
                <HistoryTabs mode={mode} />
                <HistorySearch
                    mode={mode}
                    value={search}
                    onChange={(value) => setSearchState({ mode, value })}
                />
            </div>
            <HistoryList
                requests={filteredRequests}
                mode={mode}
                loading={loading}
                error={error}
                kitchenMissing={kitchenMissing}
                canCreateKitchen={canCreateKitchen}
                canRetry={Boolean(session)}
                search={search}
                onRetry={() => {
                    setCheckingKitchen(Boolean(session && !session.user.kitchen));
                    setKitchenFailure(null);
                    setRetryKey((key) => key + 1);
                }}
                onClearSearch={() => setSearchState({ mode, value: "" })}
            />
        </section>
    );
}

export default HistoryContent;
