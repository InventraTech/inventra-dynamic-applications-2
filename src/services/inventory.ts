import type {
    Inventory,
    InventoryCount,
    OpenInventoryRequest,
    RegisterInventoryCountRequest,
} from "../types/inventory";
import { apiRequest } from "./api";

export function listInventories(kitchenId: number, signal?: AbortSignal): Promise<Inventory[]> {
    const params = new URLSearchParams({ kitchenId: String(kitchenId) });
    return apiRequest<Inventory[]>(`/inventories?${params.toString()}`, { signal });
}

export function getInventory(inventoryId: number, signal?: AbortSignal): Promise<Inventory> {
    return apiRequest<Inventory>(`/inventories/${inventoryId}`, { signal });
}

export function openInventory(request: OpenInventoryRequest): Promise<Inventory> {
    return apiRequest<Inventory>("/inventories", { method: "POST", body: JSON.stringify(request) });
}

export function listInventoryCounts(inventoryId: number, signal?: AbortSignal): Promise<InventoryCount[]> {
    return apiRequest<InventoryCount[]>(`/inventories/${inventoryId}/counts`, { signal });
}

export function registerInventoryCount(
    inventoryId: number,
    request: RegisterInventoryCountRequest,
): Promise<InventoryCount> {
    return apiRequest<InventoryCount>(`/inventories/${inventoryId}/counts`, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export function removeInventoryCount(inventoryId: number, countId: number): Promise<Inventory> {
    return apiRequest<Inventory>(`/inventories/${inventoryId}/counts/${countId}`, { method: "DELETE" });
}

export function closeInventory(inventoryId: number): Promise<Inventory> {
    return apiRequest<Inventory>(`/inventories/${inventoryId}/close`, { method: "PATCH" });
}

export function cancelInventory(inventoryId: number): Promise<Inventory> {
    return apiRequest<Inventory>(`/inventories/${inventoryId}/cancel`, { method: "PATCH" });
}
