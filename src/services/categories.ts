import type { ProductCategory } from "../types/products";
import { apiRequest } from "./api";

export function getProductCategories(signal?: AbortSignal): Promise<ProductCategory[]> {
    return apiRequest<ProductCategory[]>("/categories", { signal });
}

export function createCategory(
    input: Pick<ProductCategory, "name" | "description">,
): Promise<ProductCategory> {
    return apiRequest<ProductCategory>("/categories", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function updateCategory(
    id: number,
    input: Partial<Pick<ProductCategory, "name" | "description">>,
): Promise<ProductCategory> {
    return apiRequest<ProductCategory>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
    });
}

export function deleteCategory(id: number): Promise<void> {
    return apiRequest<void>(`/categories/${id}`, { method: "DELETE" });
}
