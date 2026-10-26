export type RequisitionType = "PURCHASE" | "TRANSFER" | "CONSUMPTION";

export type RequisitionStatus =
    | "DRAFT"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";

export interface RequisitionPerson {
    id: string;
    name: string;
    photoUrl: string | null;
}

export interface RequisitionKitchen {
    id: number;
    name: string;
}

export interface Requisition {
    id: number;
    type: RequisitionType;
    origin: string;
    status: RequisitionStatus;
    reason: string | null;
    kitchen: RequisitionKitchen;
    requester: RequisitionPerson;
    approver: RequisitionPerson | null;
    createdAt: string;
    approvedAt: string | null;
    itemCount: number;
    estimatedTotal: number;
    itemNames: string[];
}

export interface RequisitionItem {
    id: number;
    product: { id: number; name: string };
    quantity: number;
    estimatedPrice: number | null;
    suggestedSupplier: { id: number; legalName: string } | null;
    note: string | null;
}

export interface CreateRequisitionInput {
    type: RequisitionType;
    origin: string;
    kitchenId: number;
}

export interface AddRequisitionItemInput {
    productId: number;
    quantity: number;
    suggestedSupplierId?: number;
    estimatedPrice?: number;
    note?: string;
}

export interface RequisitionListFilters {
    status: RequisitionStatus | "ALL";
    type: RequisitionType | "ALL";
    search: string;
}

export type RequisitionOperation = "idle" | "loading" | "success" | "error";
