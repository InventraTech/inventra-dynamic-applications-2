import { useEffect, useState } from "react";
import { listInventories } from "../services/inventory";
import type { Inventory } from "../types/inventory";

interface InventoryListState {
    data: Inventory[];
    loading: boolean;
    error: string | null;
}

export default function useInventories(kitchenId: number | null) {
    const [state, setState] = useState<InventoryListState>({ data: [], loading: true, error: null });
    const [retryVersion, setRetryVersion] = useState(0);
    const [reloadVersion, setReloadVersion] = useState(0);

    useEffect(() => {
        if (kitchenId === null) {
            setState({ data: [], loading: false, error: null });
            return;
        }

        const controller = new AbortController();
        setState((current) => ({ ...current, loading: true, error: null }));
        listInventories(kitchenId, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) setState({ data, loading: false, error: null });
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                setState((current) => ({
                    data: current.data,
                    loading: false,
                    error: error instanceof Error ? error.message : "Não foi possível carregar os inventários desta cozinha.",
                }));
            });

        return () => controller.abort();
    }, [kitchenId, reloadVersion, retryVersion]);

    function retry() {
        setRetryVersion((version) => version + 1);
    }

    function refresh() {
        setReloadVersion((version) => version + 1);
    }

    return { ...state, retry, refresh };
}
