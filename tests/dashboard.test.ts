import test from "node:test";
import assert from "node:assert/strict";
import { analyzeDashboard, availability } from "../src/utils/dashboardAnalysis.ts";
import { dashboardDate, EMPTY_DASHBOARD_FILTERS, groupMonths, stockValue } from "../src/utils/dashboardAggregations.ts";
import { fixtureData, ready } from "./dashboard/fixtures.ts";

test("o painel começa sem filtros e inclui anos e status distintos", () => {
    const data = fixtureData();
    const a = analyzeDashboard(data, EMPTY_DASHBOARD_FILTERS, "overview", 7);
    assert.equal(a.batches.length, 13);
    assert.equal(a.requisitions.length, 3);
    assert.equal(a.alerts.length, 4);
    assert.equal(a.value.total, 600);
    assert.equal(a.value.missing, 1);
    assert.match(a.quantity, /kg/); assert.match(a.quantity, /L/); assert.match(a.quantity, /un/);
});

test("categoria filtra lotes, alertas e requisições através de seus itens", () => {
    const a = analyzeDashboard(fixtureData(), { ...EMPTY_DASHBOARD_FILTERS, category: "1" }, "overview", 7);
    assert.equal(a.batches.length, 5);
    assert.equal(a.requisitions.length, 2);
    assert.equal(a.alerts.length, 1);
    assert.equal(a.estimatedTotal, 200);
});

test("período é aplicado a cada domínio e não vira filtro padrão", () => {
    const a = analyzeDashboard(fixtureData(), { ...EMPTY_DASHBOARD_FILTERS, year: "2025", month: "12" }, "overview", 7);
    assert.equal(a.batches.length, 1); assert.equal(a.requisitions.length, 1); assert.equal(a.alerts.length, 1);
});

test("não soma quantidades de divergência em unidades diferentes", () => {
    const a = analyzeDashboard(fixtureData(), EMPTY_DASHBOARD_FILTERS, "control", 7);
    assert.equal(a.divergences.length, 2);
    assert.deepEqual(a.divergenceByInventory.map(row => row.value).sort(), [2, 3]);
    assert.equal(a.divergenceByInventory.length, 2);
});

test("dados de outra cozinha são descartados antes das agregações", () => {
    const data = fixtureData();
    data.batches = ready([...(data.batches.data ?? []), { ...data.batches.data![0], id: 999, kitchen: { id: 999, name: "Outra cozinha" }, currentQuantity: 1_000_000 }]);
    const a = analyzeDashboard(data, EMPTY_DASHBOARD_FILTERS, "overview", 7);
    assert.equal(a.value.total, 600);
    assert.equal(a.batches.length, 13);
});

test("preços ausentes não são transformados em zero", () => {
    const row = fixtureData().batches.data![0];
    assert.deepEqual(stockValue([{ ...row, unitPrice: null }]), { total: null, missing: 1 });
    assert.deepEqual(stockValue([{ ...row, unitPrice: 0 }]), { total: 0, missing: 0 });
});

test("falhas parciais deixam indicadores dependentes indisponíveis", () => {
    assert.equal(availability(ready({ records: {}, failed: [1] })).ready, false);
    assert.equal(availability(ready([])).ready, true);
    const data = fixtureData();
    data.items = ready({ records: {}, failed: [1] });
    const a = analyzeDashboard(data, { ...EMPTY_DASHBOARD_FILTERS, product: "1" }, "overview", 7);
    assert.equal(a.states.requisitions.ready, false);
    assert.equal(a.states.batches.ready, true);
});

test("meses são ordenados por ano e mês e datas civis não mudam de dia", () => {
    const months = groupMonths(["2026-01-01", "2025-12-01", "2026-02-01"], value => value);
    assert.deepEqual(months.map(row => row.key), ["2025-12", "2026-01", "2026-02"]);
    assert.equal(dashboardDate("2026-11-01"), "01/11/2026");
});

test("ranking agrega antes de limitar e totais de requisições não são multiplicados", () => {
    const data = fixtureData();
    data.items.data!.records[1] = [...data.items.data!.records[1], { ...data.items.data!.records[1][0], id: 88 }];
    const a = analyzeDashboard(data, EMPTY_DASHBOARD_FILTERS, "purchases", 7);
    assert.equal(a.topRequested[0].value, 2);
    assert.equal(a.estimatedTotal, 300);
});

test("falha em metadados de produto sem vínculo com o estoque preserva as análises de estoque", () => {
    const data = fixtureData();
    data.products = ready({ ...data.products.data!, failed: [999] });
    const a = analyzeDashboard(data, EMPTY_DASHBOARD_FILTERS, "overview", 7);
    assert.equal(a.states.categories.ready, true);
    assert.equal(a.states.products.ready, true);
    assert.equal(a.value.total, 600);
});

test("indicadores dependentes aguardam suas fontes em vez de declarar indisponibilidade durante a carga", () => {
    const data = fixtureData();
    data.stock = { data: null, loading: true, error: null, updatedAt: null };
    data.batches = { data: null, loading: true, error: null, updatedAt: null };
    data.products = { data: null, loading: false, error: null, updatedAt: null };
    const a = analyzeDashboard(data, EMPTY_DASHBOARD_FILTERS, "overview", 7);
    assert.equal(a.states.products.loading, true);
    assert.equal(a.states.categories.loading, true);
    assert.equal(a.states.products.error, null);
});
