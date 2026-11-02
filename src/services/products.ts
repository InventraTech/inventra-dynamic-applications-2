import type {
    ProductBarcodeLookup,
    ProductInput,
    ProductKitchenParameters,
    ProductKitchenParametersInput,
    ProductPage,
    ProductRecord,
    ProductSearch,
} from "../types/products";
import { getKitchenStockProducts } from "./kitchenService";
import { getStockBatchProductsByKitchen } from "./stock";
import { apiRequest } from "./api";

export function searchProducts(filters: ProductSearch, signal?: AbortSignal): Promise<ProductPage> {
    const params = new URLSearchParams({ page: String(filters.page), size: String(filters.size), sort: "name,asc" });
    if (filters.name?.trim()) params.set("name", filters.name.trim());
    if (filters.categoryId !== undefined) params.set("categoryId", String(filters.categoryId));
    if (filters.active !== undefined) params.set("active", String(filters.active));
    return apiRequest<ProductPage>(`/products?${params.toString()}`, { signal });
}

async function searchAllProducts(filters: ProductSearch, signal?: AbortSignal): Promise<ProductRecord[]> {
    const size = 100;
    const firstPage = await searchProducts({ ...filters, page: 0, size }, signal);
    const pages = await Promise.all(Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
        searchProducts({ ...filters, page: index + 1, size }, signal),
    ));
    return [firstPage, ...pages].flatMap((page) => page.content);
}

async function getKitchenParameterProductIds(
    products: ProductRecord[],
    kitchenId: number,
    signal?: AbortSignal,
): Promise<Set<number>> {
    const linkedIds = new Set<number>();
    const concurrency = 8;

    for (let index = 0; index < products.length; index += concurrency) {
        const group = products.slice(index, index + concurrency);
        const results = await Promise.all(group.map(async (product) => {
            const parameters = await getProductKitchenParameters(product.id, signal);
            return parameters.some((parameter) => parameter.kitchen.id === kitchenId) ? product.id : null;
        }));
        results.forEach((productId) => { if (productId !== null) linkedIds.add(productId); });
    }

    return linkedIds;
}

export async function searchProductsForKitchen(
    filters: ProductSearch,
    kitchenId: number,
    canReadStock: boolean,
    signal?: AbortSignal,
): Promise<ProductRecord[]> {
    const [products, activeKitchenProducts, kitchenBatches] = await Promise.all([
        searchAllProducts(filters, signal),
        canReadStock && filters.active !== false
            ? getKitchenStockProducts(kitchenId, { name: filters.name, categoryId: filters.categoryId }, signal)
            : Promise.resolve([]),
        canReadStock && filters.active !== true
            ? getStockBatchProductsByKitchen(kitchenId, signal)
            : Promise.resolve([]),
    ]);

    const activeKitchenProductIds = new Set(activeKitchenProducts.map(({ product }) => product.id));
    const batchProductIds = new Set(kitchenBatches.map(({ product }) => product.id));
    const productsNeedingParameterCheck = products.filter((product) =>
        (!canReadStock || !product.active) && !batchProductIds.has(product.id),
    );
    const parameterProductIds = productsNeedingParameterCheck.length > 0
        ? await getKitchenParameterProductIds(productsNeedingParameterCheck, kitchenId, signal)
        : new Set<number>();

    return products.filter((product) => canReadStock
        ? product.active
            ? activeKitchenProductIds.has(product.id)
            : batchProductIds.has(product.id) || parameterProductIds.has(product.id)
        : parameterProductIds.has(product.id));
}

export function getProduct(id: number, signal?: AbortSignal): Promise<ProductRecord> {
    return apiRequest<ProductRecord>(`/products/${id}`, { signal });
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

export function setKitchenParameters(productId: number, input: ProductKitchenParametersInput): Promise<void> {
    return apiRequest<void>(`/products/${productId}/kitchen-parameters`, { method: "PUT", body: JSON.stringify(input) });
}
