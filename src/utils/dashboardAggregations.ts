import type { ChartDatum, DashboardFilters, DashboardProduct } from "../types/dashboard";
import type { StockBatch } from "../types/stock";

export const EMPTY_DASHBOARD_FILTERS: DashboardFilters = {
    search: "", category: "", product: "", unit: "", year: "", month: "", batchStatus: "",
    requisitionStatus: "", requisitionType: "", inventoryStatus: "", severity: "", alertType: "",
};

const moneyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numberFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const dayFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" });

export function dashboardMoney(value: number | null): string { return value === null ? "Não informado" : moneyFormatter.format(value); }
export function dashboardNumber(value: number): string { return numberFormatter.format(value); }
export function dashboardDate(value: string | null): string {
    if (!value) return "Não informada";
    // Calendar dates are formatted independently of the browser's time zone.
    const parsed = new Date(`${value.slice(0, 10)}T12:00:00Z`);
    return Number.isNaN(parsed.getTime()) ? "Não informada" : dayFormatter.format(parsed);
}

export function matchesPeriod(value: string, filters: Pick<DashboardFilters, "year" | "month">): boolean {
    return (!filters.year || value.slice(0, 4) === filters.year)
        && (!filters.month || value.slice(5, 7) === filters.month);
}

export function matchesProduct(product: DashboardProduct, filters: DashboardFilters): boolean {
    return (!filters.search.trim() || product.name.toLocaleLowerCase("pt-BR").includes(filters.search.trim().toLocaleLowerCase("pt-BR")))
        && (!filters.category || String(product.category?.id ?? "uncategorized") === filters.category)
        && (!filters.product || String(product.id) === filters.product)
        && (!filters.unit || String(product.unit.id) === filters.unit);
}

export function hasProductFilter(filters: DashboardFilters): boolean {
    return Boolean(filters.search.trim() || filters.category || filters.product || filters.unit);
}

export function groupValues<T>(rows: T[], key: (row: T) => string, label: (row: T) => string, value: (row: T) => number = () => 1): ChartDatum[] {
    const groups = new Map<string, ChartDatum>();
    for (const row of rows) {
        const id = key(row);
        const previous = groups.get(id);
        groups.set(id, { key: id, label: label(row), value: (previous?.value ?? 0) + value(row) });
    }
    return [...groups.values()].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"));
}

export function groupMonths<T>(rows: T[], date: (row: T) => string, value: (row: T) => number = () => 1): ChartDatum[] {
    return groupValues(rows, row => date(row).slice(0, 7), row => {
        const parsed = new Date(`${date(row).slice(0, 7)}-01T12:00:00Z`);
        return Number.isNaN(parsed.getTime()) ? "Data não informada" : monthFormatter.format(parsed);
    }, value).sort((a, b) => a.key.localeCompare(b.key));
}

export function stockValue(batches: StockBatch[]): { total: number | null; missing: number } {
    const missing = batches.filter(row => row.currentQuantity !== 0 && row.unitPrice === null).length;
    const priced = batches.filter(row => row.unitPrice !== null);
    return {
        total: batches.length > 0 && priced.length === 0 && missing > 0 ? null : priced.reduce((sum, row) => sum + row.currentQuantity * row.unitPrice!, 0),
        missing,
    };
}

export function quantityByUnit<T>(rows: T[], unit: (row: T) => string, quantity: (row: T) => number): string {
    const groups = groupValues(rows, unit, unit, quantity);
    return groups.length ? groups.map(row => `${dashboardNumber(row.value)} ${row.label}`).join(" · ") : "0";
}

export function average(values: (number | null)[]): number | null {
    const valid = values.filter((value): value is number => value !== null && Number.isFinite(value));
    return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

export const DOMAIN_LABELS: Record<string, string> = {
    ACTIVE: "Ativo", WRITTEN_OFF: "Baixado", EXPIRED: "Vencido", CANCELLED: "Cancelado",
    DRAFT: "Rascunho", UNDER_REVIEW: "Em análise", APPROVED: "Aprovado", REJECTED: "Rejeitado",
    PURCHASE: "Compra", TRANSFER: "Transferência", CONSUMPTION: "Consumo",
    OPEN: "Aberto", CLOSED: "Fechado", LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta", CRITICAL: "Crítica",
    STOCK: "Estoque", EXPIRATION: "Validade", INVENTORY: "Inventário", SUPPLY: "Abastecimento",
    UNREGISTERED_PRODUCT: "Produto não cadastrado", ACCESS_REQUEST: "Pedido de acesso",
    REQUISITION_NEW: "Nova requisição", REQUISITION_STATUS: "Situação da requisição",
};
export function domainLabel(value: string): string { return DOMAIN_LABELS[value] ?? value; }
