import { useEffect, useState } from "react";
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

    useEffect(() => {
        if (inventoryId === null || kitchenId === null) {
            setState({ ...initialState, loading: false, error: inventoryId === null ? "O identificador do inventário é inválido." : null });
            return;
        }

        const controller = new AbortController();
        setState((current) => ({ ...current, loading: true, error: null }));

        async function load() {
            try {
                const inventory = await getInventory(inventoryId, controller.signal);
                if (inventory.kitchen.id !== kitchenId) throw new Error("Este inventário não pertence à cozinha vinculada à sua conta.");

                const [countsResult, batchesResult, productsResult] = await Promise.allSettled([
                    listInventoryCounts(inventoryId, controller.signal),
                    getStockBatchesByKitchen(kitchenId, controller.signal),
                    getKitchenStock(kitchenId, {}, controller.signal),
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
        retry: () => setRetryVersion((version) => version + 1),
        refresh: () => setRefreshVersion((version) => version + 1),
    };
}
