import type { CreateKitchenRequest, KitchenResponse, UpdateKitchenRequest } from "../types/kitchen";
import type { KitchenStockProductReference } from "../types/stock";
import { apiRequest } from "./api";

export async function createKitchen(request: CreateKitchenRequest): Promise<KitchenResponse> {
    return apiRequest<KitchenResponse>("/kitchens", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export function getKitchen(id: number, signal?: AbortSignal): Promise<KitchenResponse> {
    return apiRequest<KitchenResponse>(`/kitchens/${id}`, { signal });
}

export function updateKitchen(id: number, request: UpdateKitchenRequest): Promise<KitchenResponse> {
    return apiRequest<KitchenResponse>(`/kitchens/${id}`, {
        method: "PUT",
        body: JSON.stringify(request),
    });
}

export function activateKitchen(id: number): Promise<void> {
    return apiRequest<void>(`/kitchens/${id}/activate`, { method: "PATCH" });
}

export function deactivateKitchen(id: number): Promise<void> {
    return apiRequest<void>(`/kitchens/${id}/deactivate`, { method: "PATCH" });
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
