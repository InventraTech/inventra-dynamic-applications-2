import { createContext, useState, useContext } from "react";

import type { AccessibilityContextType, AccessibilityProviderProps } from "../types/accessibility";

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
    const context = useContext(AccessibilityContext)

    if (context === undefined) {
        throw new Error("A função useAccessibility() precisa ser utilizada dentro de um AccessibilityProvider.")
    }

    return context;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
    const [libras, setLibras] = useState<boolean>(false);
    
    function toggleLibras() {
        setLibras(!libras)
    }

    return (
        <AccessibilityContext.Provider value={{libras, toggleLibras}}>
            {children}
        </AccessibilityContext.Provider>
    )
}