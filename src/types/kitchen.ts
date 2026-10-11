export interface CreateKitchenRequest {
    name: string;
    address: string | null;
}

export interface KitchenResponse {
    id: number;
    name: string;
    code: string;
    address: string | null;
    active: boolean;
    createdAt: string;
}
