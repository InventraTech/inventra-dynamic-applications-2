export interface Supplier {
    id: number;
    legalName: string;
    cnpj: string;
    email: string | null;
    whatsapp: string | null;
    rating: number | null;
    photoUrl: string | null;
    active: boolean;
    createdAt: string;
}

export interface CreateSupplierInput {
    legalName: string;
    cnpj: string;
    email: string | null;
    whatsapp: string | null;
}

export interface UpdateSupplierInput {
    legalName: string;
    email?: string;
    whatsapp?: string;
}

export type SupplierStatusFilter = "all" | "active" | "inactive";

export type SupplierDialogMode = "create" | "edit";
