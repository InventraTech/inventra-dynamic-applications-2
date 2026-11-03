import type { SidebarPreferences } from "../types/sidebar";

const SIDEBAR_PREFERENCES_KEY = "preferencias-sidebar";

export function readSidebarFixedPreference(): boolean {
    try {
        const saved = localStorage.getItem(SIDEBAR_PREFERENCES_KEY);
        if (!saved) return false;

        const preferences: unknown = JSON.parse(saved);
        if (!preferences || typeof preferences !== "object") return false;

        const stored = preferences as Partial<SidebarPreferences>;
        return stored._versao === 1 && typeof stored.fixa === "boolean" ? stored.fixa : false;
    } catch {
        return false;
    }
}

export function saveSidebarFixedPreference(fixa: boolean): void {
    const preferences: SidebarPreferences = { _versao: 1, fixa };
    try {
        localStorage.setItem(SIDEBAR_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {
        // A sidebar continua utilizável nesta sessão mesmo se o armazenamento estiver indisponível.
    }
}
