import type { StockBatchProductReference } from "../types/stock";
import { apiRequest } from "./api";

export function getStockBatchProductsByKitchen(kitchenId: number, signal?: AbortSignal): Promise<StockBatchProductReference[]> {
    const params = new URLSearchParams({ kitchenId: String(kitchenId) });
    return apiRequest<StockBatchProductReference[]>(`/stock-batches?${params.toString()}`, { signal });
}
