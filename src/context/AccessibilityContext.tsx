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
        { _version: 1, libras: false}
    )

    useEffect(() => {
        if (accessibilityStorage.libras) {
            const openLibrasButton = document.createElement("script");
            openLibrasButton.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
            openLibrasButton.onload = () => {
                // @ts-ignore
                new window.VLibras.Widget("https://vlibras.gov.br/app");
            };
            document.body.appendChild(openLibrasButton);
      
            return () => {
                document.body.removeChild(openLibrasButton);
      
                const widget = document.getElementById("vlibras-access-wrapper");
                const librasApp = document.getElementById("vlibras-app-root");
                
                if (widget) {
                    widget.remove();
                }

                if (librasApp) {
                    librasApp.remove();
                } 
            };
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