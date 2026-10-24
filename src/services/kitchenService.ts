import type { CreateKitchenRequest, KitchenResponse } from "../types/kitchen";
import type { KitchenStockProductReference } from "../types/stock";
import { apiRequest } from "./api";

export async function createKitchen(request: CreateKitchenRequest): Promise<KitchenResponse> {
    return apiRequest<KitchenResponse>("/kitchens", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export async function getKitchenStockProducts(
    kitchenId: number,
    filters: { name?: string; categoryId?: number },
    signal?: AbortSignal,
): Promise<KitchenStockProductReference[]> {
    const params = new URLSearchParams();
    if (filters.name?.trim()) params.set("name", filters.name.trim());
    if (filters.categoryId !== undefined) params.set("categoryId", String(filters.categoryId));
    const query = params.size > 0 ? `?${params.toString()}` : "";
    return apiRequest<KitchenStockProductReference[]>(`/kitchens/${kitchenId}/stock${query}`, { signal });
}
