import type { ApiKitchen, AuthSession, AuthUser, LoginResponse } from "../types/auth";
import { readAuthSession } from "../utils/authSessionSchema";

const SESSION_KEY = "inventra.auth-session";
const SESSION_VERSION = 1 as const;
export const SESSION_EXPIRED_EVENT = "inventra:session-expired";
export const SESSION_CHANGED_EVENT = "inventra:session-changed";

function notifySessionChanged(): void {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function saveSession(response: LoginResponse, rememberMe = false): AuthSession {
    const session: AuthSession = {
        _versao: SESSION_VERSION,
        token: response.token,
        expiresAt: Date.now() + (response.expiresIn ?? 86_400) * 1_000,
        user: response.user,
    };

    clearSession();
    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(session));
    notifySessionChanged();
    return session;
}

export function updateSessionKitchen(kitchen: ApiKitchen): AuthSession | null {
    const session = getSession();
    if (!session) return null;

    const updatedSession: AuthSession = {
        ...session,
        user: { ...session.user, kitchen },
    };

    try {
        const storage = window.sessionStorage.getItem(SESSION_KEY) ? window.sessionStorage : window.localStorage;
        storage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
        notifySessionChanged();
        return updatedSession;
    } catch {
        return null;
    }
}

export function updateSessionUser(user: Partial<AuthUser>): AuthSession | null {
    const session = getSession();
    if (!session) return null;

    const updatedSession: AuthSession = {
        ...session,
        user: { ...session.user, ...user },
    };

    try {
        const storage = window.sessionStorage.getItem(SESSION_KEY) ? window.sessionStorage : window.localStorage;
        storage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
        notifySessionChanged();
        return updatedSession;
    } catch {
        return null;
    }
}

export function getSession(): AuthSession | null {
    try {
        for (const storage of [window.sessionStorage, window.localStorage]) {
            const rawSession = storage.getItem(SESSION_KEY);
            if (!rawSession) continue;

            const savedValue: unknown = JSON.parse(rawSession);
            const result = readAuthSession(savedValue);
            if (!result.session) {
                storage.removeItem(SESSION_KEY);
                notifySessionChanged();
                continue;
            }

            // Migrates valid sessions saved before schema versioning and discards unknown versions.
            if (result.migrated) {
                try { storage.setItem(SESSION_KEY, JSON.stringify(result.session)); }
                catch { /* The in-memory session remains usable if persistent storage becomes unavailable. */ }
            }

            return result.session;
        }
    } catch {
        // Some browser privacy settings disable persistent storage; treat that as signed out.
    }
    return null;
}

export function clearSession(): void {
    try {
        window.sessionStorage.removeItem(SESSION_KEY);
        window.localStorage.removeItem(SESSION_KEY);
    } catch {
        // Storage can be unavailable in restricted browser contexts.
    }
    notifySessionChanged();
}
