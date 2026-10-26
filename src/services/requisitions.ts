import type { Requisition } from "../types/requisitions";
import { apiRequest } from "./api";

export function getKitchenRequisitions(kitchenId: number, signal?: AbortSignal): Promise<Requisition[]> {
    const params = new URLSearchParams({ kitchenId: String(kitchenId) });
    return apiRequest<Requisition[]>(`/requisitions?${params.toString()}`, { signal });
}
