import type { AddRequisitionItemInput, CreateRequisitionInput, Requisition, RequisitionItem } from "../types/requisitions";
import { apiRequest } from "./api";

export function getKitchenRequisitions(kitchenId: number, signal?: AbortSignal): Promise<Requisition[]> {
    const params = new URLSearchParams({ kitchenId: String(kitchenId) });
    return apiRequest<Requisition[]>(`/requisitions?${params.toString()}`, { signal });
}

export function getRequisition(id: number, signal?: AbortSignal): Promise<Requisition> {
    return apiRequest<Requisition>(`/requisitions/${id}`, { signal });
}

export function getRequisitionItems(id: number, signal?: AbortSignal): Promise<RequisitionItem[]> {
    return apiRequest<RequisitionItem[]>(`/requisitions/${id}/items`, { signal });
}

export function createRequisition(input: CreateRequisitionInput): Promise<Requisition> {
    return apiRequest<Requisition>("/requisitions", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function addRequisitionItem(id: number, input: AddRequisitionItemInput): Promise<Requisition> {
    return apiRequest<Requisition>(`/requisitions/${id}/items`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function removeRequisitionItem(id: number, itemId: number): Promise<Requisition> {
    return apiRequest<Requisition>(`/requisitions/${id}/items/${itemId}`, { method: "DELETE" });
}
