import test from "node:test";
import assert from "node:assert/strict";
import { searchPages } from "../src/utils/pageSearch.ts";
import { notificationCategory, notificationDestination, notificationDateLabel } from "../src/utils/notificationPresentation.ts";
import { readAccessibilitySettings } from "../src/utils/accessibilitySettings.ts";
import type { KitchenNotification } from "../src/types/notifications.ts";
const notification: KitchenNotification = { id: 1, type: "REQUISITION_APPROVED", severity: "LOW", batch: null, product: null, kitchen: { id: 1, name: "Cozinha" }, message: "Pedido aprovado", read: false, refKey: "7", createdAt: "2026-11-03T09:00:00" };
test("busca aceita acentos e palavras em qualquer ordem sem expor páginas de outro perfil", () => {
 assert.equal(searchPages("requisicoes", "COMPRADOR")[0]?.path, "/requisicoes");
 assert.equal(searchPages("acessibilidade", "ESTOQUISTA")[0]?.path, "/acessibilidade");
 assert.equal(searchPages("conta configuracoes", "SUPERVISOR")[0]?.path, "/perfil");
 assert.equal(searchPages("produtos", "COMPRADOR").length, 0);
 assert.equal(searchPages("equipe", "ESTOQUISTA").length, 0);
 assert.equal(searchPages("não existe", "SUPERVISOR").length, 0);
});
test("destinos dos alertas respeitam o refKey e as permissões", () => {
 assert.equal(notificationDestination(notification, "SUPERVISOR")?.path, "/requisicoes/7");
 assert.equal(notificationDestination(notification, "ESTOQUISTA"), null);
 assert.equal(notificationDestination({ ...notification, refKey: "inválido" }, "COMPRADOR")?.path, "/requisicoes");
 assert.equal(notificationDestination({ ...notification, type: "ACCESS_REQUEST" }, "SUPERVISOR")?.path, "/equipe-acessos");
 assert.equal(notificationDestination({ ...notification, type: "MEMBER_LEFT" }, "COMPRADOR"), null);
});
test("categorias usam os tipos reais e datas inválidas não quebram a lista", () => {
 assert.equal(notificationCategory("EXPIRING"), "expiry");
 assert.equal(notificationCategory("STOCK"), "stock");
 assert.equal(notificationCategory("ACCESS_REQUEST"), "requests");
 assert.equal(notificationCategory("FUTURE_TYPE"), "all");
 assert.equal(notificationDateLabel("invalid"), "Data não informada");
});
test("voz permanece opt-in e descarta valores inválidos", () => {
 assert.equal(readAccessibilitySettings({ _versao: 3 }).voiceSearch, false);
 assert.equal(readAccessibilitySettings({ _versao: 3, voiceSearch: true }).voiceSearch, true);
 assert.equal(readAccessibilitySettings({ _versao: 3, voiceSearch: "true" }).voiceSearch, false);
});
