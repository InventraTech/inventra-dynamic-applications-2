import type { StockBatch } from "./stock";

export type InventoryStatus = "OPEN" | "CLOSED" | "CANCELLED";

export interface Inventory {
    id: number;
    kitchen: { id: number; name: string };
    responsible: { id: string; name: string; photoUrl: string | null };
    startedAt: string;
    closedAt: string | null;
    status: InventoryStatus;
    note: string | null;
}

export interface InventoryCount {
    id: number;
    inventoryId: number;
    batch: { id: number; batchNumber: string };
    registeredQuantity: number;
    physicalQuantity: number;
    divergence: number;
    note: string | null;
}

export interface OpenInventoryRequest {
    kitchenId: number;
    note?: string;
}

export interface RegisterInventoryCountRequest {
    batchId: number;
    physicalQuantity: number;
    note?: string;
}

export type InventoryBatch = StockBatch;

export interface InventoryCountFormValues {
    batchId: string;
    physicalQuantity: string;
    note: string;
}
