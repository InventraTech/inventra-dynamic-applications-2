import { apiRequest } from "./api";
import type { LoginResponse, RegisterRequest, UserAccount } from "../types/auth";
import { normalizeUserAccount } from "../utils/user";

export async function login(email: string, password: string): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        authenticated: false,
        body: JSON.stringify({ email: email.trim(), password }),
    });
}

export async function getCurrentUser(signal?: AbortSignal): Promise<UserAccount> {
    const user = await apiRequest<UserAccount>("/users/me", { signal });
    return normalizeUserAccount(user);
}

export async function register(request: RegisterRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/auth/register", {
        method: "POST",
        authenticated: false,
        body: JSON.stringify(request),
    });
}
