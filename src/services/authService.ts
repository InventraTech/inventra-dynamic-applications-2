import { apiRequest } from "./api";
import type { LoginResponse, RegisterRequest } from "../types/auth";

export async function login(email: string, password: string): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        authenticated: false,
        body: JSON.stringify({ email: email.trim(), password }),
    });
}

export async function register(request: RegisterRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/auth/register", {
        method: "POST",
        authenticated: false,
        body: JSON.stringify(request),
    });
}
