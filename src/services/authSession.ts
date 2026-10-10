import type { AuthSession, LoginResponse } from "../types/auth";

const SESSION_KEY = "inventra.auth-session";
export const SESSION_EXPIRED_EVENT = "inventra:session-expired";

export function saveSession(response: LoginResponse, rememberMe = false): AuthSession {
    const session: AuthSession = {
        token: response.token,
        expiresAt: Date.now() + (response.expiresIn ?? 86_400) * 1_000,
        user: response.user,
    };

    clearSession();
    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

export function getSession(): AuthSession | null {
    try {
        for (const storage of [window.sessionStorage, window.localStorage]) {
            const rawSession = storage.getItem(SESSION_KEY);
            if (!rawSession) continue;

            const session = JSON.parse(rawSession) as AuthSession;
            if (!session.token || !session.user || session.expiresAt <= Date.now()) {
                clearSession();
                return null;
            }

            return session;
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
}
