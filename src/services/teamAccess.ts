import type {
    CreateTeamUserRequest,
    KitchenAccessRequest,
    TeamProfile,
    TeamUser,
    UpdateTeamUserRequest,
} from "../types/teamAccess";
import { apiRequest } from "./api";

export function getTeamUsers(signal?: AbortSignal): Promise<TeamUser[]> {
    return apiRequest<TeamUser[]>("/users", { signal });
}

export function getTeamProfiles(signal?: AbortSignal): Promise<TeamProfile[]> {
    return apiRequest<TeamProfile[]>("/profiles", { signal });
}

export function getKitchenAccessRequests(signal?: AbortSignal): Promise<KitchenAccessRequest[]> {
    return apiRequest<KitchenAccessRequest[]>("/kitchen-access-requests", { signal });
}

export function createTeamUser(request: CreateTeamUserRequest): Promise<TeamUser> {
    return apiRequest<TeamUser>("/users", { method: "POST", body: JSON.stringify(request) });
}

export function updateTeamUser(id: string, request: UpdateTeamUserRequest): Promise<TeamUser> {
    return apiRequest<TeamUser>(`/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(request),
    });
}

export function activateTeamUser(id: string): Promise<void> {
    return apiRequest<void>(`/users/${encodeURIComponent(id)}/activate`, { method: "PATCH" });
}

export function deactivateTeamUser(id: string): Promise<void> {
    return apiRequest<void>(`/users/${encodeURIComponent(id)}/deactivate`, { method: "PATCH" });
}

export function approveKitchenAccess(id: string): Promise<KitchenAccessRequest> {
    return apiRequest<KitchenAccessRequest>(`/kitchen-access-requests/${encodeURIComponent(id)}/approve`, {
        method: "POST",
    });
}

export function rejectKitchenAccess(id: string, reason?: string): Promise<KitchenAccessRequest> {
    return apiRequest<KitchenAccessRequest>(`/kitchen-access-requests/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        ...(reason ? { body: JSON.stringify({ reason }) } : {}),
    });
}
