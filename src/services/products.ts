import type {
    ProductBarcodeLookup,
    ProductCategory,
    ProductInput,
    ProductKitchenParameters,
    ProductKitchenParametersInput,
    ProductPage,
    ProductRecord,
    ProductSearch,
    ProductSupplier,
    ProductSupplierInput,
    ProductSupplierOption,
    ProductUnit,
} from "../types/products";
import { apiRequest } from "./api";

export function searchProducts(filters: ProductSearch, signal?: AbortSignal): Promise<ProductPage> {
    const params = new URLSearchParams({ page: String(filters.page), size: String(filters.size), sort: "name,asc" });
    if (filters.name?.trim()) params.set("name", filters.name.trim());
    if (filters.categoryId !== undefined) params.set("categoryId", String(filters.categoryId));
    if (filters.active !== undefined) params.set("active", String(filters.active));
    return apiRequest<ProductPage>(`/products?${params.toString()}`, { signal });
}

export function getProduct(id: number, signal?: AbortSignal): Promise<ProductRecord> {
    return apiRequest<ProductRecord>(`/products/${id}`, { signal });
}

export function getProductCategories(signal?: AbortSignal): Promise<ProductCategory[]> {
    return apiRequest<ProductCategory[]>("/categories", { signal });
}

export function getProductUnits(signal?: AbortSignal): Promise<ProductUnit[]> {
    return apiRequest<ProductUnit[]>("/units", { signal });
}

export function getActiveSuppliers(signal?: AbortSignal): Promise<ProductSupplierOption[]> {
    return apiRequest<ProductSupplierOption[]>("/suppliers", { signal });
}

export function getProductSuppliers(productId: number, signal?: AbortSignal): Promise<ProductSupplier[]> {
    return apiRequest<ProductSupplier[]>(`/products/${productId}/suppliers`, { signal });
}

export function getProductKitchenParameters(productId: number, signal?: AbortSignal): Promise<ProductKitchenParameters[]> {
    return apiRequest<ProductKitchenParameters[]>(`/products/${productId}/kitchen-parameters`, { signal });
}

export function lookupProductBarcode(barcode: string, signal?: AbortSignal): Promise<ProductBarcodeLookup> {
    const params = new URLSearchParams({ barcode });
    return apiRequest<ProductBarcodeLookup>(`/products/barcode-lookup?${params.toString()}`, { signal });
}

export function createProduct(input: ProductInput): Promise<ProductRecord> {
    return apiRequest<ProductRecord>("/products", {
        method: "POST",
        body: JSON.stringify({
            name: input.name,
            brand: input.brand || null,
            categoryId: input.categoryId,
            unitId: input.unitId,
            barcode: input.barcode || null,
        }),
    });
}

export function updateProduct(id: number, input: ProductInput): Promise<ProductRecord> {
    return apiRequest<ProductRecord>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            name: input.name,
            brand: input.brand || null,
            categoryId: input.categoryId,
            unitId: input.unitId,
            barcode: input.barcode || null,
        }),
    });
}

export function uploadProductPhoto(id: number, file: File): Promise<ProductRecord> {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<ProductRecord>(`/products/${id}/photo`, { method: "PUT", body: formData });
}

export function deleteProductPhoto(id: number): Promise<ProductRecord> {
    return apiRequest<ProductRecord>(`/products/${id}/photo`, { method: "DELETE" });
}

export function setProductActive(id: number, active: boolean): Promise<void> {
    return apiRequest<void>(`/products/${id}/${active ? "activate" : "deactivate"}`, { method: "PATCH" });
}

export function linkProductSupplier(productId: number, input: ProductSupplierInput): Promise<void> {
    return apiRequest<void>(`/products/${productId}/suppliers`, { method: "POST", body: JSON.stringify(input) });
}

export function setKitchenParameters(productId: number, input: ProductKitchenParametersInput): Promise<void> {
    return apiRequest<void>(`/products/${productId}/kitchen-parameters`, { method: "PUT", body: JSON.stringify(input) });
}

export function createCategory(input: Pick<ProductCategory, "name" | "description">): Promise<ProductCategory> {
    return apiRequest<ProductCategory>("/categories", { method: "POST", body: JSON.stringify(input) });
}

export function updateCategory(id: number, input: Partial<Pick<ProductCategory, "name" | "description">>): Promise<ProductCategory> {
    return apiRequest<ProductCategory>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteCategory(id: number): Promise<void> {
    return apiRequest<void>(`/categories/${id}`, { method: "DELETE" });
}

export function createUnit(input: Pick<ProductUnit, "symbol" | "description">): Promise<ProductUnit> {
    return apiRequest<ProductUnit>("/units", { method: "POST", body: JSON.stringify(input) });
}

export function updateUnit(id: number, input: Partial<Pick<ProductUnit, "symbol" | "description">>): Promise<ProductUnit> {
    return apiRequest<ProductUnit>(`/units/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteUnit(id: number): Promise<void> {
    return apiRequest<void>(`/units/${id}`, { method: "DELETE" });
}
