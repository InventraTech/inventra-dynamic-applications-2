export type StockBatchStatus = "ACTIVE" | "WRITTEN_OFF" | "EXPIRED" | "CANCELLED";
export type StockMovementType = "ENTRY" | "WRITE_OFF" | "ADJUSTMENT";
export type StockMovementReason = "USAGE" | "LOSS" | "EXPIRED" | "REQUISITION";

export interface KitchenStockItem {
    product: { id: number; name: string; brand: string | null; photoUrl: string | null };
    category: { id: number; name: string } | null;
    unit: { id: number; symbol: string };
    totalQuantity: number;
    activeBatches: number;
    nextExpirationDate: string | null;
    minStock: number | null;
    lowStock: boolean;
}

export interface StockBatch {
    id: number;
    product: { id: number; name: string; photoUrl: string | null };
    kitchen: { id: number; name: string };
    supplier: { id: number; legalName: string } | null;
    batchNumber: string;
    invoiceNumber: string | null;
    initialQuantity: number;
    currentQuantity: number;
    entryDate: string;
    expirationDate: string | null;
    unitPrice: number | null;
    status: StockBatchStatus;
}

export interface StockMovement {
    id: number;
    type: StockMovementType;
    reason: StockMovementReason | null;
    quantity: number;
    balanceAfter: number;
    batch: { id: number; batchNumber: string };
    product: { id: number; name: string; photoUrl: string | null };
    user: { id: string; name: string; photoUrl: string | null } | null;
    requisitionId: number | null;
    createdAt: string;
}

export interface BatchConsumption {
    batch: { id: number; batchNumber: string; expirationDate: string | null };
    consumedQuantity: number;
    remainingQuantity: number;
    status: StockBatchStatus;
}

export interface StockEntryRequest {
    productId: number;
    kitchenId: number;
    supplierId?: number;
    batchNumber: string;
    invoiceNumber?: string;
    initialQuantity: number;
    entryDate: string;
    expirationDate?: string;
    unitPrice?: number;
}

export interface StockConsumptionRequest {
    kitchenId: number;
    productId: number;
    quantity: number;
    reason: StockMovementReason;
}

export interface BatchWriteOffRequest {
    quantity: number;
    reason: Exclude<StockMovementReason, "REQUISITION">;
}

export interface StockSupplier {
    id: number;
    legalName: string;
    cnpj: string | null;
    email: string | null;
    whatsapp: string | null;
    rating: number | null;
    active: boolean;
    createdAt: string;
}

export interface KitchenStockProductReference {
    product: { id: number };
}

export interface StockBatchProductReference {
    product: { id: number };
}
