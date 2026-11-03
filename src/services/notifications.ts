import { apiRequest } from "./api";
import type { KitchenNotification } from "../types/notifications";
export async function getNotifications(kitchenId: number, signal?: AbortSignal): Promise<KitchenNotification[]> {
 try { return await apiRequest<KitchenNotification[]>(`/alerts?kitchenId=${kitchenId}`, { signal }); }
 catch (error) { throw error instanceof Error ? error : new Error("Não foi possível carregar as notificações."); }
}
export async function readNotification(id: number): Promise<KitchenNotification> {
 try { return await apiRequest<KitchenNotification>(`/alerts/${id}/read`, { method: "PATCH" }); }
 catch (error) { throw error instanceof Error ? error : new Error("Não foi possível marcar a notificação."); }
}
export async function readAllNotifications(kitchenId: number): Promise<void> {
 try { await apiRequest<void>(`/alerts/read-all?kitchenId=${kitchenId}`, { method: "PATCH" }); }
 catch (error) { throw error instanceof Error ? error : new Error("Não foi possível marcar as notificações."); }
}
