import type { KitchenStockItem, StockBatch, StockMovement, StockMovementReason, StockMovementType } from "../types/stock";

const quantityFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function formatStockQuantity(quantity: number, unitSymbol: string): string {
    return `${quantityFormatter.format(quantity)} ${unitSymbol}`;
}

export function formatStockDate(value: string | null): string {
    if (!value) return "Não informada";
    const parsedDate = new Date(`${value.slice(0, 10)}T00:00:00Z`);
    return Number.isNaN(parsedDate.getTime()) ? "Não informada" : dateFormatter.format(parsedDate);
}

export function getDaysUntilDate(value: string, today = new Date()): number {
    const parsed = value.slice(0, 10).split("-").map(Number);
    if (parsed.length !== 3 || parsed.some((part) => !Number.isFinite(part))) return Number.POSITIVE_INFINITY;
    const target = Date.UTC(parsed[0], parsed[1] - 1, parsed[2]);
    const current = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.ceil((target - current) / 86_400_000);
}

export function formatDaysUntil(days: number): string {
    if (days < 0) return `Vencido há ${Math.abs(days)} ${Math.abs(days) === 1 ? "dia" : "dias"}`;
    if (days === 0) return "Vence hoje";
    return `Vence em ${days} ${days === 1 ? "dia" : "dias"}`;
}

export function formatStockDateTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Data não informada" : dateTimeFormatter.format(date);
}

export function getProductStockStatus(item: KitchenStockItem): { key: "low" | "available" | "empty"; label: string; tone: "danger" | "success" | "neutral" } {
    if (item.lowStock) return { key: "low", label: "Abaixo do mínimo", tone: "danger" };
    if (item.totalQuantity <= 0) return { key: "empty", label: "Sem saldo", tone: "neutral" };
    return { key: "available", label: "Com saldo", tone: "success" };
}

export function getBatchStatusPresentation(batch: StockBatch): { label: string; tone: "success" | "warning" | "danger" | "neutral" } {
    if (batch.status === "ACTIVE" && batch.expirationDate && getDaysUntilDate(batch.expirationDate) < 0) {
        return { label: "Vencido · aguarda baixa", tone: "danger" };
    }
    const presentations = {
        ACTIVE: { label: "Ativo", tone: "success" },
        WRITTEN_OFF: { label: "Baixado", tone: "neutral" },
        EXPIRED: { label: "Vencido", tone: "danger" },
        CANCELLED: { label: "Cancelado", tone: "neutral" },
    } as const;
    return presentations[batch.status];
}

export function getStockMovementLabel(type: StockMovementType, reason: StockMovementReason | null): string {
    if (type === "ENTRY") return "Entrada";
    if (type === "ADJUSTMENT") return "Ajuste";
    if (reason === "LOSS") return "Perda";
    if (reason === "EXPIRED") return "Vencimento";
    if (reason === "REQUISITION") return "Requisição";
    return "Consumo";
}

export function getMovementTone(movement: StockMovement): "success" | "warning" | "danger" | "neutral" | "brand" {
    if (movement.type === "ENTRY") return "success";
    if (movement.type === "ADJUSTMENT") return "neutral";
    if (movement.reason === "EXPIRED" || movement.reason === "LOSS") return "danger";
    return "brand";
}
