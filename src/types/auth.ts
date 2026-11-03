import type { ReactNode } from "react";

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
    photoUrl?: string | null;
    kitchen: ApiKitchen | null;
    profile?: ApiProfile | string | null;
    active?: boolean;
    hasPassword?: boolean;
    lastLogin?: string | null;
    createdAt?: string;
}

export interface UserAccount extends AuthUser {
    photoUrl: string | null;
    profile: { id: number; accessType: string };
    active: boolean;
    hasPassword: boolean;
    lastLogin: string | null;
    createdAt: string;
}

export interface LoginResponse {
    token: string;
    tokenType?: string;
    expiresIn?: number;
    user: AuthUser;
}

export type AuthAccessType = "SUPERVISOR" | "ESTOQUISTA" | "COMPRADOR";

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    accessType: AuthAccessType;
}

export interface AuthSession {
    _versao: 1;
    token: string;
    expiresAt: number;
    user: AuthUser;
}

export interface AuthState {
    session: AuthSession | null;
}

export type AuthAction =
    | { type: "session/synced"; session: AuthSession | null }
    | { type: "session/signed-out" };

export interface AuthContextType extends AuthState {
    isAuthenticated: boolean;
    refreshSession: () => void;
    signOut: () => void;
}

export interface AuthProviderProps {
    children: ReactNode;
}
