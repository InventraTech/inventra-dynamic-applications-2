import { createContext, useContext, useEffect } from "react";

import type { AccessibilityContextType, AccessibilityProviderProps, AccessibilityStorage } from "../types/accessibility";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
    const context = useContext(AccessibilityContext);

    if (context === undefined) {
        throw new Error("A função useAccessibility() precisa ser utilizada dentro de um AccessibilityProvider.");
    }

    return context;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
    const [accessibilityStorage, setAccessibilityStorage] = useLocalStorage<AccessibilityStorage>(
        "acessibilidade",
        { _versao: 1, libras: false}
    )

    useEffect(() => {
        const vlibrasWrapper = document.getElementById('vlibras-access-wrapper')

        if (vlibrasWrapper) {
            vlibrasWrapper.style.display = accessibilityStorage.libras ? "block" : "none";
        }
    }, [accessibilityStorage.libras]);
    
    function toggleLibras() {
        setAccessibilityStorage({
            ...accessibilityStorage,
            libras: !accessibilityStorage.libras
        });
    }

    return (
        <AccessibilityContext.Provider value={{libras: accessibilityStorage.libras, toggleLibras}}>
            {children}
        </AccessibilityContext.Provider>
    )
}