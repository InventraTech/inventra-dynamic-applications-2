import { useCallback, useEffect, useMemo, useReducer } from "react";

import type { AuthProviderProps, AuthState } from "../types/auth";
import { clearSession, getSession, SESSION_CHANGED_EVENT, SESSION_EXPIRED_EVENT } from "../services/authSession";
import { AuthContext, authReducer } from "./auth";

function readInitialState(): AuthState {
    return { session: getSession() };
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, undefined, readInitialState);

    useEffect(() => {
        const synchronize = () => dispatch({ type: "session/synced", session: getSession() });
        window.addEventListener(SESSION_CHANGED_EVENT, synchronize);
        window.addEventListener(SESSION_EXPIRED_EVENT, synchronize);
        window.addEventListener("storage", synchronize);
        return () => {
            window.removeEventListener(SESSION_CHANGED_EVENT, synchronize);
            window.removeEventListener(SESSION_EXPIRED_EVENT, synchronize);
            window.removeEventListener("storage", synchronize);
        };
    }, []);

    const refreshSession = useCallback(() => {
        dispatch({ type: "session/synced", session: getSession() });
    }, []);

    const signOut = useCallback(() => {
        clearSession();
        dispatch({ type: "session/signed-out" });
    }, []);

    // Keeps consumers stable while unrelated provider renders occur.
    const value = useMemo(() => ({
        ...state,
        isAuthenticated: state.session !== null,
        refreshSession,
        signOut,
    }), [state, refreshSession, signOut]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
