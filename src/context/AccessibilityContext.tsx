import { useEffect, useLayoutEffect, useState } from "react";

import type { AccessibilityProviderProps, AccessibilitySettings } from "../types/accessibility";
import { AccessibilityContext } from "./accessibility";
import { DEFAULT_ACCESSIBILITY_SETTINGS, readAccessibilitySettings } from "../utils/accessibilitySettings";
import { createAccessibilityCursor } from "../utils/accessibilityCursor";
import { loadLibrasWidget } from "../services/libras";

const ACCESSIBILITY_STORAGE_KEY = "acessibilidade";

function readSettings(): { settings: AccessibilitySettings; storageAvailable: boolean } {
    let saved: string | null;
    try {
        saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    } catch {
        return { settings: DEFAULT_ACCESSIBILITY_SETTINGS, storageAvailable: false };
    }
    try { return { settings: readAccessibilitySettings(JSON.parse(saved ?? "null")), storageAvailable: true }; }
    catch { return { settings: DEFAULT_ACCESSIBILITY_SETTINGS, storageAvailable: true }; }
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
    const [{ settings, storageAvailable }, setState] = useState(readSettings);
    const [widgetStatus, setWidgetStatus] = useState<"loading" | "ready" | "error">("loading");
    const [widgetRetry, setWidgetRetry] = useState(0);
    const librasStatus = settings.libras ? widgetStatus : "off";

    useEffect(() => {
        if (!settings.libras) return;
        let cancelled = false;
        loadLibrasWidget().then(() => { if (!cancelled) setWidgetStatus("ready"); })
            .catch(() => { if (!cancelled) setWidgetStatus("error"); });
        return () => { cancelled = true; };
    }, [settings.libras, widgetRetry]);

    useLayoutEffect(() => {
        const root = document.documentElement;
        root.style.fontSize = `${settings.fontScale}%`;
        root.style.setProperty("--accessibility-scale", String(settings.fontScale / 100));
        root.style.setProperty("--accessibility-letter-spacing", `${settings.letterSpacing}em`);
        root.style.setProperty("--accessibility-line-height", String(settings.lineSpacing));
        root.dataset.accessibilityContrast = settings.contrastMode;
        root.dataset.accessibilityColorVision = settings.colorVisionMode;
        root.dataset.accessibilityFont = settings.dyslexiaFont ? "readable" : "default";
        root.dataset.accessibilityLargeText = String(settings.fontScale >= 150 || settings.lineSpacing >= 1.75 || settings.letterSpacing >= 0.1);
        root.dataset.accessibilityLetterSpacing = settings.letterSpacing > 0 ? "custom" : "default";
        root.dataset.accessibilityLineSpacing = settings.lineSpacing !== 1.5 ? "custom" : "default";
        root.dataset.accessibilityMotion = settings.reduceMotion ? (settings.removeMotion ? "remove" : "reduce") : "full";
        root.dataset.accessibilityFocus = settings.keyboardFocus;
        root.dataset.accessibilityCursor = String(settings.largeCursor);
        if (settings.largeCursor) {
            for (const shape of ["arrow", "pointer", "text"] as const) {
                root.style.setProperty(`--accessibility-cursor-${shape}`, createAccessibilityCursor(settings.cursorSize, settings.cursorColor, shape));
            }
        }
        root.dataset.accessibilityLibras = String(settings.libras);
    }, [settings]);

    useEffect(() => {
        let observedShadow: ShadowRoot | null = null;
        let retry: ReturnType<typeof setTimeout> | undefined;
        let attempts = 0;
        const observer = new MutationObserver(applyLibrasPreference);
        function applyLibrasPreference() {
            const button = document.getElementById("vlibras-access-wrapper");
            if (!button) return;
            button.style.display = settings.libras ? "block" : "none";
            const shadow = button.shadowRoot;
            if (shadow) {
                if (observedShadow !== shadow) { observer.observe(shadow, { childList: true, subtree: true }); observedShadow = shadow; }
                let style = shadow.querySelector<HTMLStyleElement>("#inventra-vlibras-style");
                if (!style) { style = document.createElement("style"); style.id = "inventra-vlibras-style"; shadow.append(style); }
                // Preserva a posição e as dimensões padrão do widget oficial.
                const content = `
                    #vlibras-button { cursor: ${settings.largeCursor ? "var(--accessibility-cursor-pointer)" : "pointer"}; }
                    #vlibras-button:focus-visible { outline: 3px solid ${settings.keyboardFocus === "reinforced" ? "var(--color-login-gold)" : "var(--color-focus)"}; outline-offset: 3px; box-shadow: 0 0 0 3px var(--color-surface); }
                    ${settings.reduceMotion ? "* { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }" : ""}
                    @media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }
                    @media (forced-colors: active) { #vlibras-button:focus-visible { outline: 3px solid Highlight; } }
                `;
                if (style.textContent !== content) style.textContent = content;
            } else if (settings.libras && !retry && attempts < 40) {
                retry = setTimeout(() => { retry = undefined; attempts += 1; applyLibrasPreference(); }, 250);
            }
        }
        applyLibrasPreference();
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["id"] });
        return () => { observer.disconnect(); clearTimeout(retry); };
    }, [settings.libras, settings.largeCursor, settings.reduceMotion, settings.keyboardFocus, widgetStatus]);

    function updateSettings(updates: Partial<AccessibilitySettings>) {
        const next = readAccessibilitySettings({ ...settings, ...updates, _versao: 3 });
        if (next.libras && !settings.libras) setWidgetStatus("loading");
        let saved = true;
        try { localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(next)); }
        catch { saved = false; }
        setState({ settings: next, storageAvailable: saved });
    }

    function resetSettings() {
        updateSettings(DEFAULT_ACCESSIBILITY_SETTINGS);
    }

    function retryLibras() { setWidgetStatus("loading"); setWidgetRetry((current) => current + 1); }

    return (
        <AccessibilityContext.Provider value={{ settings, storageAvailable, librasStatus, retryLibras, updateSettings, resetSettings }}>
            {children}
        </AccessibilityContext.Provider>
    );
}
