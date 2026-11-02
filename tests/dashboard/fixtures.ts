// Synthetic data used exclusively by the isolated validation page and unit tests.
// This module is never imported by the production application.
import type { DashboardData } from "../../src/hooks/useDashboard";
import type { DashboardAlert, DashboardCount, DashboardInventory, DashboardResource } from "../../src/types/dashboard";
import type { ProductKitchenParameters, ProductSupplier } from "../../src/types/products";
import type { Requisition, RequisitionItem } from "../../src/types/requisitions";
import type { KitchenStockItem, StockBatch } from "../../src/types/stock";
import type { Supplier } from "../../src/types/suppliers";

export const kitchen = { id: 7, name: "Cozinha de validação" };
export const user = { id: "validation-user", name: "Supervisor de Validação", email: "supervisor@example.invalid", kitchen, profile: { accessType: "SUPERVISOR" } };
export const stock: KitchenStockItem[] = [
    { product: { id: 1, name: "Arroz de validação", brand: null, photoUrl: null }, category: { id: 1, name: "Grãos" }, unit: { id: 1, symbol: "kg" }, totalQuantity: 20, activeBatches: 4, nextExpirationDate: "2026-11-10", minStock: 25, lowStock: true },
    { product: { id: 2, name: "Leite de validação", brand: null, photoUrl: null }, category: { id: 2, name: "Laticínios" }, unit: { id: 2, symbol: "L" }, totalQuantity: 15, activeBatches: 3, nextExpirationDate: "2026-11-09", minStock: 5, lowStock: false },
    { product: { id: 3, name: "Produto de validação com nome longo para verificar quebra de linhas e ampliação de texto", brand: null, photoUrl: null }, category: null, unit: { id: 3, symbol: "un" }, totalQuantity: 10, activeBatches: 2, nextExpirationDate: null, minStock: 0, lowStock: false },
];
export const batches: StockBatch[] = Array.from({ length: 13 }, (_, index) => ({
    id: index + 1, product: stock[index % 3].product, kitchen, supplier: { id: 1, legalName: "Fornecedor de validação" },
    batchNumber: `VALIDACAO-${index + 1}`, invoiceNumber: null, initialQuantity: 10, currentQuantity: 5,
    entryDate: index === 0 ? "2025-12-10" : `2026-${index < 7 ? "10" : "11"}-01`,
    expirationDate: index % 3 === 0 ? "2026-10-31" : "2027-01-01", unitPrice: index === 12 ? null : 10,
    status: index === 0 ? "EXPIRED" : "ACTIVE",
}));
export const requisitions: Requisition[] = [1, 2, 3].map(id => ({ id, kitchen, requester: { id: user.id, name: user.name, photoUrl: null }, approver: null, type: id === 3 ? "CONSUMPTION" : "PURCHASE", status: id === 1 ? "UNDER_REVIEW" : "APPROVED", origin: "WEB", reason: null, createdAt: id === 1 ? "2025-12-01T10:00:00" : "2026-11-01T10:00:00", approvedAt: null, itemCount: 2, estimatedTotal: 100, itemNames: [stock[0].product.name, stock[1].product.name] }));
export const items: Record<number, RequisitionItem[]> = Object.fromEntries(requisitions.map(request => [request.id, [{ id: request.id * 10, product: stock[request.id === 3 ? 2 : 0].product, quantity: 2, estimatedPrice: 20, suggestedSupplier: null, note: null }]]));
export const alerts: DashboardAlert[] = [1, 2, 3, 4].map(id => ({ id, kitchen, product: id === 4 ? null : stock[(id - 1) % 3].product, batch: null, type: id % 2 ? "STOCK" : "EXPIRATION", severity: id === 1 ? "CRITICAL" : "HIGH", read: id % 2 === 0, refKey: null, message: `Alerta de validação ${id}. Confira os dados operacionais da cozinha.`, createdAt: id === 1 ? "2025-12-10T09:00:00" : "2026-11-01T10:00:00" }));
export const inventories: DashboardInventory[] = [1, 2].map(id => ({ id, kitchen, responsible: { id: user.id, name: user.name, photoUrl: null }, startedAt: "2026-11-01T10:00:00", closedAt: null, status: id === 1 ? "CLOSED" : "OPEN", note: null }));
export const counts: Record<number, DashboardCount[]> = {
    1: [{ id: 1, inventoryId: 1, batch: { id: 1, batchNumber: "VALIDACAO-1" }, registeredQuantity: 10, physicalQuantity: 8, divergence: -2, note: "Falta registrada na validação" }, { id: 2, inventoryId: 1, batch: { id: 2, batchNumber: "VALIDACAO-2" }, registeredQuantity: 10, physicalQuantity: 13, divergence: 3, note: null }],
    2: [{ id: 3, inventoryId: 2, batch: { id: 3, batchNumber: "VALIDACAO-3" }, registeredQuantity: 10, physicalQuantity: 10, divergence: null, note: "Ainda não calculada" }],
};
export const suppliers: Supplier[] = [1, 2].map(id => ({ id, legalName: `Fornecedor de validação ${id}`, cnpj: "Somente validação", email: null, whatsapp: null, photoUrl: null, rating: id === 1 ? 4.5 : null, active: id === 1, createdAt: "2026-10-01T10:00:00" }));
export const links: Record<number, ProductSupplier[]> = Object.fromEntries(stock.map((row, index) => [row.product.id, [{ supplier: suppliers[index % 2], supplierCode: null, referencePrice: index === 2 ? null : 20 + index, leadTimeDays: index === 2 ? null : 3 + index }]]));
export const parameters: Record<number, ProductKitchenParameters[]> = Object.fromEntries(stock.map((row, index) => [row.product.id, [{ kitchen, minStock: row.minStock, maxStock: null, currentQuantity: row.totalQuantity, estimatedDaysUntilStockout: index === 2 ? null : 10, lowStock: row.lowStock, overStock: false, averageDailyConsumption: index === 2 ? null : 2 }]]));

export function ready<T>(data: T): DashboardResource<T> { return { data, loading: false, error: null, updatedAt: 1 }; }
export function fixtureData(): DashboardData {
    return {
        stock: ready(stock), batches: ready(batches), requisitions: ready(requisitions), alerts: ready(alerts),
        products: ready({ records: Object.fromEntries(stock.map(row => [row.product.id, [{ id: row.product.id, name: row.product.name, category: row.category, unit: row.unit }]])), failed: [] }),
        parameters: ready({ records: parameters, failed: [] }), items: ready({ records: items, failed: [] }), suppliers: ready(suppliers), links: ready({ records: links, failed: [] }), inventories: ready(inventories), counts: ready({ records: counts, failed: [] }), refresh: () => {}, visitTab: () => {}, requestItems: () => {},
    };
}
