import type { CreateKitchenRequest, KitchenResponse } from "../types/kitchen";
import { apiRequest } from "./api";

export async function createKitchen(request: CreateKitchenRequest): Promise<KitchenResponse> {
    return apiRequest<KitchenResponse>("/kitchens", {
        method: "POST",
        body: JSON.stringify(request),
    });
}
