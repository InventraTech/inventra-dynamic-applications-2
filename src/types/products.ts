export interface ProductCategory {
    id: number;
    name: string;
    description: string | null;
}

export interface ProductUnit {
    id: number;
    symbol: string;
    description: string;
}

export interface ProductRecord {
    id: number;
    name: string;
    brand: string | null;
    category: Pick<ProductCategory, "id" | "name"> | null;
    unit: Pick<ProductUnit, "id" | "symbol">;
    barcode: string | null;
    photoUrl: string | null;
    active: boolean;
    createdAt: string;
}

export interface ProductPage {
    content: ProductRecord[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

export interface ProductSearch {
    name?: string;
    categoryId?: number;
    active?: boolean;
    page: number;
    size: number;
}

export interface ProductInput {
    name: string;
    brand: string;
    categoryId: number | null;
    unitId: number;
    barcode: string;
}

export interface ProductSupplier {
    supplier: { id: number; legalName: string };
    supplierCode: string | null;
    referencePrice: number | null;
    leadTimeDays: number | null;
}

export interface ProductKitchenParameters {
    kitchen: { id: number; name: string };
    minStock: number | null;
    maxStock: number | null;
    averageDailyConsumption: number | null;
    currentQuantity: number;
    estimatedDaysUntilStockout: number | null;
    lowStock: boolean;
    overStock: boolean;
}

export interface ProductSupplierInput {
    supplierId: number;
    supplierCode: string;
    referencePrice: number | null;
    leadTimeDays: number | null;
}

export interface ProductKitchenParametersInput {
    kitchenId: number;
    minStock: number | null;
    maxStock: number | null;
    averageDailyConsumption: number | null;
}

export interface ProductSupplierOption {
    id: number;
    legalName: string;
    active: boolean;
}

export interface ProductBarcodeLookup {
    name: string | null;
    brand: string | null;
    imageUrl: string | null;
    quantity: string | null;
}

export interface ProductFormErrors {
    name?: string;
    brand?: string;
    categoryId?: string;
    unitId?: string;
    barcode?: string;
}

export interface ProductValidationResult {
    values: ProductInput;
    errors: ProductFormErrors;
}

export type ProductStatusFilter = "all" | "active" | "inactive";
export type ProductDialogKind = "deactivate" | "activate" | null;
