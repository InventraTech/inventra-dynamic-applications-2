export interface ApiKitchen {
    id: number;
    name: string;
}

export interface ApiProfile {
    id?: number | string;
    name?: string;
    accessType?: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    kitchen: ApiKitchen | null;
    profile?: ApiProfile | string | null;
}

export interface LoginResponse {
    token: string;
    tokenType?: string;
    expiresIn?: number;
    user: AuthUser;
}

export interface AuthSession {
    token: string;
    expiresAt: number;
    user: AuthUser;
}
