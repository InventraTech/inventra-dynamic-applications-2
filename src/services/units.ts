import type { ProductUnit } from "../types/products";
import { apiRequest } from "./api";

export function getProductUnits(signal?: AbortSignal): Promise<ProductUnit[]> {
    return apiRequest<ProductUnit[]>("/units", { signal });
}

export function createUnit(
    input: Pick<ProductUnit, "symbol" | "description">,
): Promise<ProductUnit> {
    return apiRequest<ProductUnit>("/units", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function updateUnit(
    id: number,
    input: Partial<Pick<ProductUnit, "symbol" | "description">>,
): Promise<ProductUnit> {
    return apiRequest<ProductUnit>(`/units/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
    });
}

export function deleteUnit(id: number): Promise<void> {
    return apiRequest<void>(`/units/${id}`, { method: "DELETE" });
}
