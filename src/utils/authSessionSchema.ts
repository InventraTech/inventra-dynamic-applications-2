import type { AuthSession, AuthUser } from "../types/auth";

export interface AuthSessionReadResult {
    session: AuthSession | null;
    migrated: boolean;
}

const SESSION_VERSION = 1 as const;

function isAuthUser(value: unknown): value is AuthUser {
    if (typeof value !== "object" || value === null) return false;
    const user = value as Record<string, unknown>;
    const kitchen = user.kitchen;
    const hasValidKitchen = kitchen === null || (
        typeof kitchen === "object"
        && kitchen !== null
        && typeof (kitchen as Record<string, unknown>).id === "number"
        && typeof (kitchen as Record<string, unknown>).name === "string"
    );

    return typeof user.id === "string"
        && Boolean(user.id.trim())
        && typeof user.name === "string"
        && typeof user.email === "string"
        && Object.hasOwn(user, "kitchen")
        && hasValidKitchen;
}

export function readAuthSession(value: unknown, now = Date.now()): AuthSessionReadResult {
    if (typeof value !== "object" || value === null) return { session: null, migrated: false };

    const stored = value as {
        _versao?: unknown;
        token?: unknown;
        expiresAt?: unknown;
        user?: unknown;
    };
    if (stored._versao !== undefined && stored._versao !== SESSION_VERSION) return { session: null, migrated: false };
    if (typeof stored.token !== "string" || !stored.token.trim()) return { session: null, migrated: false };
    if (typeof stored.expiresAt !== "number" || !Number.isFinite(stored.expiresAt) || stored.expiresAt <= now) {
        return { session: null, migrated: false };
    }
    if (!isAuthUser(stored.user)) return { session: null, migrated: false };

    return {
        session: {
            _versao: SESSION_VERSION,
            token: stored.token,
            expiresAt: stored.expiresAt,
            user: stored.user,
        },
        migrated: stored._versao === undefined,
    };
}
