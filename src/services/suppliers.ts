import type { ProductSupplierOption } from "../types/products";
import type { CreateSupplierInput, Supplier, UpdateSupplierInput } from "../types/suppliers";
import { apiRequest } from "./api";

export function listSuppliers(active: boolean, signal?: AbortSignal): Promise<Supplier[]> {
    const params = new URLSearchParams({ active: String(active) });
    return apiRequest<Supplier[]>(`/suppliers?${params.toString()}`, { signal });
}

export function getActiveSuppliers(signal?: AbortSignal): Promise<ProductSupplierOption[]> {
    return apiRequest<ProductSupplierOption[]>("/suppliers", { signal });
}

export function getSupplier(id: number, signal?: AbortSignal): Promise<Supplier> {
    return apiRequest<Supplier>(`/suppliers/${id}`, { signal });
}

export function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
    return apiRequest<Supplier>("/suppliers", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function updateSupplier(id: number, input: UpdateSupplierInput): Promise<Supplier> {
    return apiRequest<Supplier>(`/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
    });
}

export function uploadSupplierPhoto(id: number, file: File): Promise<Supplier> {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<Supplier>(`/suppliers/${id}/photo`, { method: "PUT", body: formData });
}

export function removeSupplierPhoto(id: number): Promise<Supplier> {
    return apiRequest<Supplier>(`/suppliers/${id}/photo`, { method: "DELETE" });
}

export function setSupplierActive(id: number, active: boolean): Promise<void> {
    return apiRequest<void>(`/suppliers/${id}/${active ? "activate" : "deactivate"}`, { method: "PATCH" });
}
