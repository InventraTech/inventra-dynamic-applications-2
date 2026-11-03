import type { InventoryStatus } from "../types/inventory";

export const inventoryStatusPresentation: Record<InventoryStatus, { label: string; tone: "brand" | "success" | "neutral" }> = {
    OPEN: { label: "Aberto", tone: "brand" },
    CLOSED: { label: "Fechado", tone: "success" },
    CANCELLED: { label: "Cancelado", tone: "neutral" },
};

export function formatInventoryDate(value: string | null, options: Intl.DateTimeFormatOptions = {}): string {
    if (!value) return "—";
    const date = new Date(value.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...options,
    }).format(date);
}

export function formatInventoryQuantity(value: number): string {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value);
}

export function getInitials(name: string): string {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
        .map((part) => [...part][0]?.toLocaleUpperCase("pt-BR") ?? "").join("") || "IN";
}
