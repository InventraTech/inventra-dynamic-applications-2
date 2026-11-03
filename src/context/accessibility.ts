import { createContext, useContext } from "react";
import type { AccessibilityContextType } from "../types/accessibility";

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility(): AccessibilityContextType {
    const context = useContext(AccessibilityContext);
    if (!context) throw new Error("useAccessibility precisa ser usado dentro de AccessibilityProvider.");
    return context;
}
