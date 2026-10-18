export interface TeamUser {
    id: string;
    name: string;
    email: string;
    kitchen: { id: number; name: string } | null;
    profile: { id: number; accessType: string };
    active: boolean;
    lastLogin: string | null;
    createdAt: string;
}

export interface TeamProfile {
    id: number;
    accessType: string;
    description: string | null;
}

export type AccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface KitchenAccessRequest {
    id: string;
    status: AccessRequestStatus;
    kitchen: { id: number; name: string };
    user: { id: string; name: string; email: string };
    createdAt: string;
    expiresAt: string | null;
    decidedAt: string | null;
    decidedBy: string | null;
    reason: string | null;
}

export interface CreateTeamUserRequest {
    name: string;
    email: string;
    password: string;
    kitchenId: number;
    profileId: number;
}

export interface UpdateTeamUserRequest {
    name: string;
    profileId: number;
}

export interface TeamUserFormValues {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    profileId: string;
}

export type TeamUserFormErrors = Partial<Record<keyof TeamUserFormValues, string>>;
