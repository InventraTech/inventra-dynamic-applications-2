export type RequisitionType = "PURCHASE" | "TRANSFER" | "CONSUMPTION";
export type RequisitionStatus = "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface RequisitionDto {
    id: number;
    type: RequisitionType;
    status: RequisitionStatus;
    reason?: string | null;
    createdAt: string;
    approvedAt?: string | null;
}

export interface RequisitionItemDto {
    id: number;
    product: {
        id: number;
        name: string;
    };
    quantity: number;
    estimatedPrice?: number | null;
    suggestedSupplier?: {
        id: number;
        legalName: string;
    } | null;
    note?: string | null;
}

export interface ProductDto {
    id: number;
    brand?: string | null;
}
