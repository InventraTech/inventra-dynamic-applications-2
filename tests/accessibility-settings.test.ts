import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_ACCESSIBILITY_SETTINGS, readAccessibilitySettings } from "../src/utils/accessibilitySettings.ts";

test("mantém Libras ao migrar a primeira versão", () => {
    const migrated = readAccessibilitySettings({ _versao: 1, libras: true });
    assert.equal(migrated._versao, 3);
    assert.equal(migrated.libras, true);
    assert.equal(migrated.fontScale, 100);
});

test("migra preferências válidas e descarta recursos que não existem", () => {
    const old = { _versao: 2, fontScale: 200, contrastMode: "dark", lineSpacing: 2, voiceControl: true, eyeTracking: true, eyeTrackingDwell: 1000 };
    const migrated = readAccessibilitySettings(old);
    assert.equal(migrated.fontScale, 200);
    assert.equal(migrated.contrastMode, "dark");
    assert.equal(migrated.lineSpacing, 2);
    assert.equal("voiceControl" in migrated, false);
    assert.equal("eyeTracking" in migrated, false);
    assert.equal("eyeTrackingDwell" in migrated, false);
    assert.equal(old._versao, 2);
});

test("descarta valores inválidos sem perder os demais ajustes", () => {
    const settings = readAccessibilitySettings({ _versao: 3, fontScale: -10, contrastMode: "inexistente", readingRuler: "true", speechRate: 500, largeCursor: true, shortcutsEnabled: false });
    assert.equal(settings.fontScale, 100);
    assert.equal(settings.contrastMode, "normal");
    assert.equal(settings.readingRuler, false);
    assert.equal(settings.speechRate, 1);
    assert.equal(settings.largeCursor, true);
    assert.equal(settings.shortcutsEnabled, false);
});

test("usa o padrão para dados ausentes ou versões incompatíveis", () => {
    for (const value of [null, false, "arquivo inválido", [], { _versao: 99, fontScale: 200 }]) {
        assert.deepEqual(readAccessibilitySettings(value), DEFAULT_ACCESSIBILITY_SETTINGS);
    }
});

test("conserva todas as preferências atuais após salvar e recarregar", () => {
    const saved = { ...DEFAULT_ACCESSIBILITY_SETTINGS, fontScale: 150, letterSpacing: 0.15, dyslexiaFont: true, colorVisionMode: "tritanopia", visualAlerts: "icon-color", removeMotion: true, reduceMotion: true, cursorColor: "yellow", cursorSize: "extra-large", keyboardFocus: "reinforced", readingRuler: true };
    assert.deepEqual(readAccessibilitySettings(JSON.parse(JSON.stringify(saved))), saved);
});
