import { apiRequest, ApiError } from "./api";
import { getProduct } from "./products";
import type { DashboardAlert, DashboardCount, DashboardInventory, DashboardProduct, RelatedRecords } from "../types/dashboard";
import type { KitchenStockItem, StockBatch } from "../types/stock";
import type { Supplier } from "../types/suppliers";

export async function getDashboardBatches(kitchenId: number, signal?: AbortSignal): Promise<StockBatch[]> {
    const rows = await apiRequest<StockBatch[]>(`/stock-batches?kitchenId=${kitchenId}`, { signal });
    return rows.filter(row => row.kitchen.id === kitchenId);
}

export async function getDashboardAlerts(kitchenId: number, signal?: AbortSignal): Promise<DashboardAlert[]> {
    const rows = await apiRequest<DashboardAlert[]>(`/alerts?kitchenId=${kitchenId}`, { signal });
    return rows.filter(row => row.kitchen.id === kitchenId);
}

export async function getDashboardInventories(kitchenId: number, signal?: AbortSignal): Promise<DashboardInventory[]> {
    const rows = await apiRequest<DashboardInventory[]>(`/inventories?kitchenId=${kitchenId}`, { signal });
    return rows.filter(row => row.kitchen.id === kitchenId);
}

export function getDashboardCounts(id: number, signal?: AbortSignal): Promise<DashboardCount[]> {
    return apiRequest<DashboardCount[]>(`/inventories/${id}/counts`, { signal });
}

export async function getDashboardSuppliers(kitchenId: number, includeInactive: boolean, signal?: AbortSignal): Promise<Supplier[]> {
    const activeStatuses = includeInactive ? [true, false] : [true];
    const results = await Promise.all(activeStatuses.map(active =>
        apiRequest<Supplier[]>(`/suppliers?kitchenId=${kitchenId}&active=${active}`, { signal }),
    ));
    return results.flat();
}

// Details are requested only for entities already linked to the authenticated kitchen.
// One failing entity does not discard successful responses, and concurrency stays bounded.
export async function getRelatedRecords<T>(
    ids: number[],
    fetchRows: (id: number, signal?: AbortSignal) => Promise<T[]>,
    signal: AbortSignal,
): Promise<RelatedRecords<T>> {
    const queue = [...new Set(ids)];
    const records: Record<number, T[]> = {};
    const failed: number[] = [];
    let cursor = 0;
    await Promise.all(Array.from({ length: Math.min(6, queue.length) }, async () => {
        while (cursor < queue.length) {
            signal.throwIfAborted();
            const id = queue[cursor++];
            try { records[id] = await fetchRows(id, signal); }
            catch (error) {
                if (signal.aborted || (error instanceof ApiError && error.status === 401)) throw error;
                failed.push(id);
            }
        }
    }));
    return { records, failed };
}

export async function getDashboardProducts(stock: KitchenStockItem[], batches: StockBatch[], signal: AbortSignal, referencedProductIds: number[] = []): Promise<RelatedRecords<DashboardProduct>> {
    const records: Record<number, DashboardProduct[]> = Object.fromEntries(stock.map(row => [row.product.id, [{
        id: row.product.id, name: row.product.name, category: row.category, unit: row.unit,
    }]]));
    const missingIds = [...batches.map(row => row.product.id), ...referencedProductIds].filter(id => !records[id]);
    const extra = await getRelatedRecords(missingIds, async (id, requestSignal) => [await getProduct(id, requestSignal)], signal);
    return { records: { ...records, ...extra.records }, failed: extra.failed };
}
