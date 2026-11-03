import type { UserAccount } from "../types/auth";
import { normalizeUserAccount } from "../utils/user";
import { apiRequest } from "./api";

export async function updateUserName(id: string, name: string): Promise<UserAccount> {
    const user = await apiRequest<UserAccount>(`/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
    });
    return normalizeUserAccount(user);
}

export function changeUserPassword(
    id: string,
    request: { currentPassword?: string; newPassword: string },
): Promise<void> {
    return apiRequest<void>(`/users/${encodeURIComponent(id)}/password`, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
}

export async function uploadCurrentUserPhoto(file: File): Promise<UserAccount> {
    const body = new FormData();
    body.append("file", file);
    const user = await apiRequest<UserAccount>("/users/me/photo", { method: "PUT", body });
    return normalizeUserAccount(user);
}

export async function removeCurrentUserPhoto(): Promise<UserAccount> {
    const user = await apiRequest<UserAccount>("/users/me/photo", { method: "DELETE" });
    return normalizeUserAccount(user);
}
