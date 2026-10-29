import type {
    BatchConsumption,
    BatchWriteOffRequest,
    KitchenStockItem,
    StockBatch,
    StockBatchProductReference,
    StockConsumptionRequest,
    StockEntryRequest,
    StockMovement,
    StockMovementType,
    StockSupplier,
} from "../types/stock";
import { apiRequest } from "./api";

export interface KitchenStockFilters {
    name?: string;
    categoryId?: number;
}

export function getKitchenStock(kitchenId: number, filters: KitchenStockFilters = {}, signal?: AbortSignal): Promise<KitchenStockItem[]> {
    const params = new URLSearchParams();
    if (filters.name?.trim()) params.set("name", filters.name.trim());
    if (filters.categoryId !== undefined) params.set("categoryId", String(filters.categoryId));
    const query = params.size ? `?${params.toString()}` : "";
    return apiRequest<KitchenStockItem[]>(`/kitchens/${kitchenId}/stock${query}`, { signal });
}

export function getKitchenStockBatches(kitchenId: number, productId: number, signal?: AbortSignal): Promise<StockBatch[]> {
    const params = new URLSearchParams({ kitchenId: String(kitchenId), productId: String(productId) });
    return apiRequest<StockBatch[]>(`/stock-batches?${params.toString()}`, { signal });
}

export function getExpiringStockBatches(kitchenId: number, days: number, signal?: AbortSignal): Promise<StockBatch[]> {
    const params = new URLSearchParams({ kitchenId: String(kitchenId), days: String(days) });
    return apiRequest<StockBatch[]>(`/stock-batches/expiring-soon?${params.toString()}`, { signal });
}

export function getStockMovements(
    kitchenId: number,
    limit = 50,
    type?: StockMovementType,
    productId?: number,
    signal?: AbortSignal,
): Promise<StockMovement[]> {
    const params = new URLSearchParams({ kitchenId: String(kitchenId), limit: String(Math.min(Math.max(limit, 1), 500)) });
    if (type) params.set("type", type);
    if (productId !== undefined) params.set("productId", String(productId));
    return apiRequest<StockMovement[]>(`/stock-movements?${params.toString()}`, { signal });
}

export function getKitchenStockSuppliers(kitchenId: number, signal?: AbortSignal): Promise<StockSupplier[]> {
    const params = new URLSearchParams({ kitchenId: String(kitchenId) });
    return apiRequest<StockSupplier[]>(`/suppliers?${params.toString()}`, { signal });
}

export function registerStockEntry(request: StockEntryRequest): Promise<StockBatch> {
    return apiRequest<StockBatch>("/stock-batches", { method: "POST", body: JSON.stringify(request) });
}

export function consumeKitchenStock(request: StockConsumptionRequest): Promise<BatchConsumption[]> {
    return apiRequest<BatchConsumption[]>("/stock-batches/consume", { method: "POST", body: JSON.stringify(request) });
}

export function writeOffStockBatch(batchId: number, request: BatchWriteOffRequest): Promise<StockBatch> {
    return apiRequest<StockBatch>(`/stock-batches/${batchId}/consume`, { method: "PATCH", body: JSON.stringify(request) });
}

export function getStockBatchProductsByKitchen(kitchenId: number, signal?: AbortSignal): Promise<StockBatchProductReference[]> {
    const params = new URLSearchParams({ kitchenId: String(kitchenId) });
    return apiRequest<StockBatchProductReference[]>(`/stock-batches?${params.toString()}`, { signal });
}
