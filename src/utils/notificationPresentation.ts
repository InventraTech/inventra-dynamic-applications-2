import type { KitchenNotification } from "../types/notifications";
export type NotificationCategory = "all" | "expiry" | "stock" | "requests";
export function notificationCategory(type: string): NotificationCategory {
 if (/EXPIR|VALID/.test(type)) return "expiry";
 if (/STOCK|UNREGISTERED_PRODUCT/.test(type)) return "stock";
 if (/REQUISITION|ACCESS|MEMBER|JOIN/.test(type)) return "requests";
 return "all";
}
export function notificationDateLabel(value: string): string {
 const date = new Date(value); if (!Number.isFinite(date.getTime())) return "Data não informada";
 const today = new Date(); const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
 if (date.getTime() >= midnight) return "Hoje";
 if (date.getTime() >= midnight - 6 * 86400000) return "Últimos 7 dias";
 return "Anteriores";
}
export function notificationDestination(item: KitchenNotification, role: string): { label: string; path: string } | null {
 if (item.type.startsWith("REQUISITION") && ["SUPERVISOR", "COMPRADOR"].includes(role)) {
  const id = item.refKey?.match(/^(?:requisition:)?(\d+)$/)?.[1];
  return { label: "Ver requisição", path: id ? `/requisicoes/${id}` : "/requisicoes" };
 }
 if (notificationCategory(item.type) === "expiry" || notificationCategory(item.type) === "stock") return ["SUPERVISOR", "ESTOQUISTA"].includes(role) ? { label: "Ver estoque", path: "/estoque" } : null;
 if (/ACCESS|MEMBER|JOIN/.test(item.type) && role === "SUPERVISOR") return { label: "Ver equipe e acessos", path: "/equipe-acessos" };
 return null;
}
