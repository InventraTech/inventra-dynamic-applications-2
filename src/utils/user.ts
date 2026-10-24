import type { UserAccount } from "../types/auth";

export function normalizeUserAccount(user: UserAccount): UserAccount {
    return { ...user, photoUrl: user.photoUrl ?? null };
}
