import { useCallback, useEffect, useRef, useState } from "react";
import { getInventory, listInventoryCounts } from "../services/inventory";
import { getKitchenStock, getStockBatchesByKitchen } from "../services/stock";
import type { Inventory, InventoryCount, InventoryBatch } from "../types/inventory";
import type { KitchenStockItem } from "../types/stock";

interface InventoryDetailState {
    inventory: Inventory | null;
    counts: InventoryCount[];
    batches: InventoryBatch[];
    products: KitchenStockItem[];
    loading: boolean;
    error: string | null;
    batchesError: string | null;
    productsError: string | null;
}

const initialState: InventoryDetailState = {
    inventory: null,
    counts: [],
    batches: [],
    products: [],
    loading: true,
    error: null,
    batchesError: null,
    productsError: null,
};

export default function useInventoryDetail(inventoryId: number | null, kitchenId: number | null) {
    const [state, setState] = useState<InventoryDetailState>(initialState);
    const [retryVersion, setRetryVersion] = useState(0);
    const [refreshVersion, setRefreshVersion] = useState(0);
    const loadedInventoryKey = useRef<string | null>(null);
    const retry = useCallback(() => setRetryVersion((version) => version + 1), []);
    const refresh = useCallback(() => setRefreshVersion((version) => version + 1), []);

    useEffect(() => {
        const inventoryKey = `${inventoryId ?? ""}:${kitchenId ?? ""}`;
        const inventoryChanged = loadedInventoryKey.current !== inventoryKey;
        loadedInventoryKey.current = inventoryKey;
        if (inventoryId === null || kitchenId === null) {
            setState({ ...initialState, loading: false, error: inventoryId === null ? "O identificador do inventário é inválido." : null });
            return;
        }

        const currentInventoryId = inventoryId;
        const currentKitchenId = kitchenId;

        const controller = new AbortController();
        setState((current) => inventoryChanged ? { ...initialState, loading: true } : { ...current, loading: true, error: null });

        async function load() {
            try {
                const inventory = await getInventory(currentInventoryId, controller.signal);
                if (inventory.kitchen.id !== currentKitchenId) throw new Error("Este inventário não pertence à cozinha vinculada à sua conta.");

                const [countsResult, batchesResult, productsResult] = await Promise.allSettled([
                    listInventoryCounts(currentInventoryId, controller.signal),
                    getStockBatchesByKitchen(currentKitchenId, controller.signal),
                    getKitchenStock(currentKitchenId, {}, controller.signal),
                ]);
                if (controller.signal.aborted) return;
                if (countsResult.status === "rejected") throw countsResult.reason;

                setState({
                    inventory,
                    counts: countsResult.value,
                    batches: batchesResult.status === "fulfilled" ? batchesResult.value : [],
                    products: productsResult.status === "fulfilled" ? productsResult.value : [],
                    loading: false,
                    error: null,
                    batchesError: batchesResult.status === "rejected" ? "Não foi possível carregar os lotes desta cozinha." : null,
                    productsError: productsResult.status === "rejected" ? "Não foi possível carregar as unidades dos produtos." : null,
                });
            } catch (error: unknown) {
                if (controller.signal.aborted) return;
                setState((current) => ({ ...current, loading: false, error: error instanceof Error && error.message ? error.message : "Não foi possível carregar este inventário." }));
            }
        }

        void load();
        return () => controller.abort();
    }, [inventoryId, kitchenId, refreshVersion, retryVersion]);

    return {
        ...state,
        retry,
        refresh,
    };
}
