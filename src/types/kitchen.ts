export interface CreateKitchenRequest {
    name: string;
    address: string | null;
}

export interface KitchenResponse {
    id: number;
    name: string;
    code: string;
    address: string | null;
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
    acceptingRequests: boolean;
    active: boolean;
    createdAt: string;
}

export interface UpdateKitchenRequest {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    acceptingRequests?: boolean;
}

export interface KitchenFormValues {
    name: string;
    address: string;
    city: string;
    state: string;
}

export type KitchenFormErrors = Partial<Record<keyof KitchenFormValues, string>>;
