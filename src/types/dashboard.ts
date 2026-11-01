import type { ProductKitchenParameters, ProductSupplier } from "./products";
import type { RequisitionItem } from "./requisitions";
import type { KitchenStockItem } from "./stock";

export type DashboardTab = "overview" | "stock" | "purchases" | "control";

export interface DashboardFilters {
    search: string;
    category: string;
    product: string;
    unit: string;
    year: string;
    month: string;
    batchStatus: string;
    requisitionStatus: string;
    requisitionType: string;
    inventoryStatus: string;
    severity: string;
    alertType: string;
}

export interface DashboardProduct {
    id: number;
    name: string;
    category: KitchenStockItem["category"];
    unit: KitchenStockItem["unit"];
}

export interface DashboardAlert {
    id: number;
    type: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    batch: { id: number; batchNumber: string } | null;
    product: { id: number; name: string; photoUrl: string | null } | null;
    kitchen: { id: number; name: string };
    message: string;
    read: boolean;
    refKey: string | null;
    createdAt: string;
}

export interface DashboardInventory {
    id: number;
    kitchen: { id: number; name: string };
    responsible: { id: string; name: string; photoUrl: string | null };
    startedAt: string;
    closedAt: string | null;
    status: "OPEN" | "CLOSED" | "CANCELLED";
    note: string | null;
}

export interface DashboardCount {
    id: number;
    inventoryId: number;
    batch: { id: number; batchNumber: string };
    registeredQuantity: number;
    physicalQuantity: number;
    divergence: number | null;
    note: string | null;
}

export interface RelatedRecords<T> {
    records: Record<number, T[]>;
    failed: number[];
}

export interface DashboardResource<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    updatedAt: number | null;
}

export type DashboardParameters = RelatedRecords<ProductKitchenParameters>;
export type DashboardSuppliers = RelatedRecords<ProductSupplier>;
export type DashboardItems = RelatedRecords<RequisitionItem>;
export type DashboardCounts = RelatedRecords<DashboardCount>;

export interface ChartDatum {
    key: string;
    label: string;
    value: number;
}
