import { useEffect, useState } from "react";
import { getKitchenStockBatches } from "../services/stock";
import type { StockBatch } from "../types/stock";

interface StockBatchesState {
    batches: StockBatch[];
    loading: boolean;
    error: string | null;
}

export default function useStockBatches(kitchenId: number, productId: number | null, open: boolean, refreshKey: number) {
    const [state, setState] = useState<StockBatchesState>({ batches: [], loading: false, error: null });
    const [retryVersion, setRetryVersion] = useState(0);

    useEffect(() => {
        if (!open || productId === null) {
            setState({ batches: [], loading: false, error: null });
            return;
        }

        const controller = new AbortController();
        setState((current) => ({ ...current, loading: true, error: null }));
        getKitchenStockBatches(kitchenId, productId, controller.signal)
            .then((batches) => {
                if (!controller.signal.aborted) setState({ batches, loading: false, error: null });
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                setState({ batches: [], loading: false, error: error instanceof Error ? error.message : "Não foi possível carregar os lotes deste produto." });
            });

        return () => controller.abort();
    }, [kitchenId, open, productId, refreshKey, retryVersion]);

    function retry() {
        setRetryVersion((version) => version + 1);
    }

    return { ...state, retry };
}
