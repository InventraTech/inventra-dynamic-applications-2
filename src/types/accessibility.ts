import type { ReactNode } from "react";

export type FontScale = 100 | 125 | 150 | 200;
export type LetterSpacing = 0 | 0.05 | 0.1 | 0.15;
export type LineSpacing = 1.25 | 1.5 | 1.75 | 2;
export type ReadingRulerColor = "gold" | "purple" | "gray";
export type ReadingRulerSize = "small" | "medium" | "large";
export type ContrastMode = "normal" | "dark" | "reinforced" | "yellow-black";
export type ColorVisionMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";
export type SpeechTrigger = "focus" | "hover" | "manual";
export type CursorSize = "medium" | "large" | "extra-large";
export type CursorColor = "default" | "black" | "yellow" | "white";
export type KeyboardFocus = "standard" | "reinforced";
export type VisualAlerts = "banner" | "icon-color" | "banner-icon";

export interface AccessibilitySettings {
    _versao: 3;
    fontScale: FontScale;
    dyslexiaFont: boolean;
    letterSpacing: LetterSpacing;
    lineSpacing: LineSpacing;
    readingRuler: boolean;
    readingRulerColor: ReadingRulerColor;
    readingRulerSize: ReadingRulerSize;
    contrastMode: ContrastMode;
    colorVisionMode: ColorVisionMode;
    libras: boolean;
    readAloud: boolean;
    speechRate: 0.75 | 1 | 1.25;
    speechTrigger: SpeechTrigger;
    reduceMotion: boolean;
    removeMotion: boolean;
    largeCursor: boolean;
    cursorSize: CursorSize;
    cursorColor: CursorColor;
    keyboardFocus: KeyboardFocus;
    shortcutsEnabled: boolean;
    visualAlerts: VisualAlerts;
}

export interface AccessibilityContextType {
    settings: AccessibilitySettings;
    storageAvailable: boolean;
    librasStatus: "off" | "loading" | "ready" | "error";
    retryLibras: () => void;
    updateSettings: (updates: Partial<AccessibilitySettings>) => void;
    resetSettings: () => void;
}

export interface AccessibilityProviderProps {
    children: ReactNode;
}

export interface ChoiceOption<T extends string | number> {
    value: T;
    label: string;
    description?: string;
}

export interface AccessibilityCardProps {
    icon: string;
    title: string;
    description: string;
    children: ReactNode;
    className?: string;
}

export interface ReadAloudControls {
    supported: boolean;
    state: "idle" | "reading" | "paused" | "error";
    speak: (text: string) => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
}
