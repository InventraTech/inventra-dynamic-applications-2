import type { AccessibilitySettings } from "../types/accessibility";

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
    _versao: 3,
    fontScale: 100,
    dyslexiaFont: false,
    letterSpacing: 0,
    lineSpacing: 1.5,
    readingRuler: false,
    readingRulerColor: "gold",
    readingRulerSize: "medium",
    contrastMode: "normal",
    colorVisionMode: "none",
    libras: false,
    readAloud: false,
    speechRate: 1,
    speechTrigger: "manual",
    reduceMotion: false,
    removeMotion: false,
    largeCursor: false,
    cursorSize: "large",
    cursorColor: "default",
    keyboardFocus: "standard",
    shortcutsEnabled: true,
    visualAlerts: "banner-icon",
};

function readOption<T extends string | number>(value: unknown, options: readonly T[], fallback: T): T {
    return options.find((option) => option === value) ?? fallback;
}

export function readAccessibilitySettings(value: unknown): AccessibilitySettings {
    if (typeof value !== "object" || value === null) return DEFAULT_ACCESSIBILITY_SETTINGS;
    const saved = value as Record<string, unknown>;
    if (saved._versao === 1) return { ...DEFAULT_ACCESSIBILITY_SETTINGS, libras: saved.libras === true };
    if (saved._versao !== 2 && saved._versao !== 3) return DEFAULT_ACCESSIBILITY_SETTINGS;

    // A versão 3 migra as preferências existentes e descarta integrações que nunca foram implementadas.
    return {
        _versao: 3,
        fontScale: readOption(saved.fontScale, [100, 125, 150, 200] as const, 100),
        dyslexiaFont: saved.dyslexiaFont === true,
        letterSpacing: readOption(saved.letterSpacing, [0, 0.05, 0.1, 0.15] as const, 0),
        lineSpacing: readOption(saved.lineSpacing, [1.25, 1.5, 1.75, 2] as const, 1.5),
        readingRuler: saved.readingRuler === true,
        readingRulerColor: readOption(saved.readingRulerColor, ["gold", "purple", "gray"] as const, "gold"),
        readingRulerSize: readOption(saved.readingRulerSize, ["small", "medium", "large"] as const, "medium"),
        contrastMode: readOption(saved.contrastMode, ["normal", "dark", "reinforced", "yellow-black"] as const, "normal"),
        colorVisionMode: readOption(saved.colorVisionMode, ["none", "protanopia", "deuteranopia", "tritanopia"] as const, "none"),
        libras: saved.libras === true,
        readAloud: saved.readAloud === true,
        speechRate: readOption(saved.speechRate, [0.75, 1, 1.25] as const, 1),
        speechTrigger: readOption(saved.speechTrigger, ["focus", "hover", "manual"] as const, "manual"),
        reduceMotion: saved.reduceMotion === true,
        removeMotion: saved.removeMotion === true,
        largeCursor: saved.largeCursor === true,
        cursorSize: readOption(saved.cursorSize, ["medium", "large", "extra-large"] as const, "large"),
        cursorColor: readOption(saved.cursorColor, ["default", "black", "yellow", "white"] as const, "default"),
        keyboardFocus: readOption(saved.keyboardFocus, ["standard", "reinforced"] as const, "standard"),
        shortcutsEnabled: saved.shortcutsEnabled !== false,
        visualAlerts: readOption(saved.visualAlerts, ["banner", "icon-color", "banner-icon"] as const, "banner-icon"),
    };
}

