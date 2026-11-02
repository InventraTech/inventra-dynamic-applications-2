import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_ACCESSIBILITY_SETTINGS, readAccessibilitySettings } from "../src/utils/accessibilitySettings.ts";

test("preferências ausentes ou inválidas usam os valores padrão", () => {
    for (const value of [null, false, "invalid", {}, { _versao: 99 }]) assert.deepEqual(readAccessibilitySettings(value), DEFAULT_ACCESSIBILITY_SETTINGS);
});
test("migração da versão 1 mantém somente a integração disponível", () => {
    assert.deepEqual(readAccessibilitySettings({ _versao: 1, libras: true, voiceControl: true }), { ...DEFAULT_ACCESSIBILITY_SETTINGS, libras: true });
});
test("migração da versão 2 preserva as preferências compatíveis", () => {
    const settings = readAccessibilitySettings({ _versao: 2, fontScale: 200, contrastMode: "dark", dyslexiaFont: true });
    assert.equal(settings._versao, 3); assert.equal(settings.fontScale, 200); assert.equal(settings.contrastMode, "dark"); assert.equal(settings.dyslexiaFont, true);
});
test("valores fora das opções e integrações inexistentes são descartados", () => {
    const settings = readAccessibilitySettings({ _versao: 3, fontScale: 900, lineSpacing: -1, contrastMode: "invalid", eyeTracking: true, voiceControl: true });
    assert.equal(settings.fontScale, 100); assert.equal(settings.lineSpacing, 1.5); assert.equal(settings.contrastMode, "normal"); assert.equal("eyeTracking" in settings, false); assert.equal("voiceControl" in settings, false);
});
test("preferências máximas e movimento reduzido sobrevivem à serialização", () => {
    const saved = { ...DEFAULT_ACCESSIBILITY_SETTINGS, fontScale: 200, letterSpacing: 0.15, lineSpacing: 2, dyslexiaFont: true, reduceMotion: true, keyboardFocus: "reinforced", visualAlerts: "icon-color" };
    assert.deepEqual(readAccessibilitySettings(JSON.parse(JSON.stringify(saved))), saved);
});
