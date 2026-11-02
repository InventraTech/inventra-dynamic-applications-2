import type { ProductSupplier, ProductSupplierInput } from "../types/products";
import { apiRequest } from "./api";

export function getProductSuppliers(
    productId: number,
    signal?: AbortSignal,
): Promise<ProductSupplier[]> {
    return apiRequest<ProductSupplier[]>(`/products/${productId}/suppliers`, { signal });
}

export function linkProductSupplier(
    productId: number,
    input: ProductSupplierInput,
): Promise<void> {
    return apiRequest<void>(`/products/${productId}/suppliers`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}
