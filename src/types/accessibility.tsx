import type { ReactNode } from "react";

export interface AccessibilityContextType {
    libras: boolean, toggleLibras: () => void,
}

export interface AccessibilityProviderProps {
    children: ReactNode;
}