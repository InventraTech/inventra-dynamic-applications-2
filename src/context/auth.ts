import { createContext, useContext } from "react";

import type { AuthAction, AuthContextType, AuthState } from "../types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function authReducer(_state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "session/synced":
            return { session: action.session };
        case "session/signed-out":
            return { session: null };
        default: {
            const exhaustiveAction: never = action;
            return exhaustiveAction;
        }
    }
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
    return context;
}
