import type { DashboardData } from "../hooks/useDashboard";
import type { ChartDatum, DashboardFilters, DashboardResource, DashboardTab } from "../types/dashboard";
import { getDaysUntilDate } from "./stockPresentation.ts";
import { average, domainLabel, groupMonths, groupValues, hasProductFilter, matchesPeriod, matchesProduct, quantityByUnit, stockValue } from "./dashboardAggregations.ts";

export function availability(...resources: DashboardResource<unknown>[]) {
    const failures = resources.flatMap(resource => resource.error ? [resource.error] : []);
    const incomplete = resources.some(resource => resource.data && typeof resource.data === "object" && "failed" in resource.data && Array.isArray(resource.data.failed) && resource.data.failed.length > 0);
    return {
        ready: resources.every(resource => resource.data !== null) && !incomplete,
        loading: resources.some(resource => resource.loading),
        error: failures.join(" ") || (incomplete ? "Alguns detalhes não puderam ser carregados. Tente novamente para obter a análise completa." : null),
    };
}

export function analyzeDashboard(data: DashboardData, filters: DashboardFilters, tab: DashboardTab, kitchenId: number, today = new Date()) {
    const products = Object.values(data.products.data?.records ?? {}).flat().sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    const productMap = new Map(products.map(product => [product.id, product]));
    const selectedProducts = products.filter(product => matchesProduct(product, filters));
    const allowed = new Set(selectedProducts.map(product => product.id));
    const productFiltered = hasProductFilter(filters);
    const productMatches = (id: number | undefined) => !productFiltered || (id !== undefined && allowed.has(id));
    const batches = (data.batches.data ?? []).filter(row => row.kitchen.id === kitchenId && productMatches(row.product.id) && matchesPeriod(row.entryDate, filters) && (tab !== "stock" || !filters.batchStatus || row.status === filters.batchStatus));
    const scopedBatchIds = new Set(batches.map(row => row.id));
    const scopedProductIds = new Set(batches.map(row => row.product.id));
    const stockPeriod = Boolean(filters.year || filters.month || (tab === "stock" && filters.batchStatus));
    const stock = (data.stock.data ?? []).filter(row => productMatches(row.product.id) && (!stockPeriod || scopedProductIds.has(row.product.id)));
    const registeredIds = new Set([...(data.stock.data ?? []).map(row => row.product.id), ...(data.batches.data ?? []).filter(row => row.kitchen.id === kitchenId).map(row => row.product.id)]);
    // Missing metadata for an alert-only product must not hide complete stock analyses.
    const stockMetadata = { ...data.products, data: data.products.data ? { ...data.products.data, failed: data.products.data.failed.filter(id => registeredIds.has(id)) } : null };
    const requisitions = (data.requisitions.data ?? []).filter(row => row.kitchen.id === kitchenId && matchesPeriod(row.createdAt, filters)
        && (tab !== "purchases" || ((!filters.requisitionStatus || row.status === filters.requisitionStatus) && (!filters.requisitionType || row.type === filters.requisitionType)))
        && (!productFiltered || (data.items.data?.records[row.id] ?? []).some(item => allowed.has(item.product.id))));
    const items = requisitions.flatMap(row => (data.items.data?.records[row.id] ?? []).filter(item => productMatches(item.product.id)));
    const alerts = (data.alerts.data ?? []).filter(row => row.kitchen.id === kitchenId && productMatches(row.product?.id) && matchesPeriod(row.createdAt, filters)
        && (tab !== "control" || ((!filters.severity || row.severity === filters.severity) && (!filters.alertType || row.type === filters.alertType))))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const allBatches = new Map((data.batches.data ?? []).filter(row => row.kitchen.id === kitchenId).map(row => [row.id, row]));
    const countMatches = (batchId: number) => productMatches(allBatches.get(batchId)?.product.id);
    const inventories = (data.inventories.data ?? []).filter(row => row.kitchen.id === kitchenId && matchesPeriod(row.startedAt, filters) && (!filters.inventoryStatus || row.status === filters.inventoryStatus)
        && (!productFiltered || (data.counts.data?.records[row.id] ?? []).some(count => countMatches(count.batch.id))));
    const counts = inventories.flatMap(row => (data.counts.data?.records[row.id] ?? []).filter(count => count.inventoryId === row.id && countMatches(count.batch.id)));
    const divergences = counts.filter(row => row.divergence !== null && row.divergence !== 0).sort((a, b) => Math.abs(b.divergence!) - Math.abs(a.divergence!));
    const links = Object.entries(data.links.data?.records ?? {}).flatMap(([id, rows]) => productMatches(Number(id)) ? rows.map(row => ({ ...row, productId: Number(id), productName: productMap.get(Number(id))?.name ?? "Produto não identificado" })) : []);
    const linkedSuppliers = new Set(links.map(row => row.supplier.id));
    const suppliers = (data.suppliers.data ?? []).filter(row => !productFiltered || linkedSuppliers.has(row.id));
    const parameters = Object.entries(data.parameters.data?.records ?? {}).flatMap(([id, rows]) => productMatches(Number(id)) && (!stockPeriod || scopedProductIds.has(Number(id))) ? rows.filter(row => row.kitchen.id === kitchenId).map(row => ({ ...row, productId: Number(id) })) : []);
    const consumption = parameters.filter(row => row.averageDailyConsumption !== null);
    const unitFor = (id: number) => productMap.get(id)?.unit.symbol ?? "unidade não informada";
    const value = stockValue(batches);
    const pricedBatches = batches.filter(row => row.unitPrice !== null);
    const sumBy = (field: "status" | "severity" | "type", rows: { status?: string; severity?: string; type?: string }[]) => groupValues(rows, row => row[field]!, row => domainLabel(row[field]!));
    const requisitionStatuses = ["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"];
    const requisitionsByType = ["PURCHASE", "CONSUMPTION", "TRANSFER"].map(type => ({
        key: type,
        label: domainLabel(type),
        segments: requisitionStatuses.map(status => ({
            key: status,
            label: domainLabel(status),
            value: requisitions.filter(row => row.type === type && row.status === status).length,
        })),
    })).filter(row => row.segments.some(segment => segment.value > 0));
    const stockCoverage = stock.filter(row => row.minStock !== null && row.minStock > 0).map(row => ({
        key: String(row.product.id),
        label: row.product.name,
        quantity: row.totalQuantity,
        minimum: row.minStock!,
        unit: row.unit.symbol,
        percent: row.totalQuantity / row.minStock! * 100,
    })).sort((left, right) => left.percent - right.percent);
    const stockTreemapGroups = new Map<string, { key: string; label: string; value: number; items: Map<string, ChartDatum> }>();
    for (const batch of pricedBatches) {
        if (batch.currentQuantity <= 0 || batch.unitPrice! <= 0) continue;
        const value = batch.currentQuantity * batch.unitPrice!;
        if (!Number.isFinite(value) || value <= 0) continue;
        const product = productMap.get(batch.product.id);
        const categoryId = String(product?.category?.id ?? "uncategorized");
        const categoryName = product?.category?.name ?? "Sem categoria";
        const group = stockTreemapGroups.get(categoryId) ?? { key: categoryId, label: categoryName, value: 0, items: new Map<string, ChartDatum>() };
        const productKey = String(batch.product.id);
        const item = group.items.get(productKey) ?? { key: productKey, label: product?.name ?? batch.product.name, value: 0 };
        item.value += value;
        group.value += value;
        group.items.set(productKey, item);
        stockTreemapGroups.set(categoryId, group);
    }
    const stockTreemap = [...stockTreemapGroups.values()].map(group => ({
        key: group.key,
        label: group.label,
        value: group.value,
        items: [...group.items.values()].sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, "pt-BR")),
    })).sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, "pt-BR"));
    const inventoryDivergenceGroups = new Map<string, { key: string; label: string; unit: string; shortage: number; surplus: number }>();
    for (const row of divergences) {
        const unit = unitFor(allBatches.get(row.batch.id)?.product.id ?? -1);
        const key = `${row.inventoryId}:${unit}`;
        const current = inventoryDivergenceGroups.get(key) ?? {
            key,
            label: `Inventário #${row.inventoryId}`,
            unit,
            shortage: 0,
            surplus: 0,
        };
        if (row.divergence! < 0) current.shortage += Math.abs(row.divergence!);
        else current.surplus += row.divergence!;
        inventoryDivergenceGroups.set(key, current);
    }
    const inventoryDivergences = [...inventoryDivergenceGroups.values()].sort((left, right) =>
        right.shortage + right.surplus - left.shortage - left.surplus,
    );

    return {
        products, selectedProducts: selectedProducts.filter(row => registeredIds.has(row.id) && (!stockPeriod || scopedProductIds.has(row.id))), productMap, batches, stock, requisitions, items, alerts, inventories, counts, divergences, allBatches, links, suppliers,
        value, quantity: quantityByUnit(batches, row => unitFor(row.product.id), row => row.currentQuantity),
        lowStock: stock.filter(row => row.lowStock).length,
        expired: batches.filter(row => row.status === "EXPIRED" || (row.status === "ACTIVE" && row.expirationDate !== null && getDaysUntilDate(row.expirationDate, today) < 0)).length,
        expiringSoon: batches.filter(row => row.status === "ACTIVE" && row.expirationDate !== null && getDaysUntilDate(row.expirationDate, today) >= 0 && getDaysUntilDate(row.expirationDate, today) <= 30).length,
        monthlyEntries: batches.filter(row => row.entryDate.slice(0, 7) === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`).length,
        consumption: groupValues(consumption, row => unitFor(row.productId), unit => unit, row => row.averageDailyConsumption!),
        missingConsumption: parameters.filter(row => row.averageDailyConsumption === null).length,
        pending: requisitions.filter(row => row.status === "UNDER_REVIEW").length,
        estimatedTotal: requisitions.reduce((sum, row) => sum + row.estimatedTotal, 0),
        leadTime: average(links.map(row => row.leadTimeDays)),
        categoryValue: groupValues(pricedBatches, row => String(productMap.get(row.product.id)?.category?.id ?? "uncategorized"), row => productMap.get(row.product.id)?.category?.name ?? "Sem categoria", row => row.currentQuantity * row.unitPrice!),
        topProducts: groupValues(pricedBatches, row => String(row.product.id), row => row.product.name, row => row.currentQuantity * row.unitPrice!).slice(0, 10),
        alertSeverities: sumBy("severity", alerts), requestStatuses: sumBy("status", requisitions), batchStatuses: sumBy("status", batches),
        requisitionsByType, stockCoverage, inventoryDivergences, stockTreemap,
        requestTypes: sumBy("type", requisitions), inventoryStatuses: sumBy("status", inventories), alertTypes: sumBy("type", alerts),
        entryMonths: groupMonths(batches, row => row.entryDate), alertMonths: groupMonths(alerts, row => row.createdAt),
        // Count occurrences in distinct requests, avoiding a sum of kg, litres and units in a ranking.
        topRequested: groupValues(requisitions.flatMap(request => [...new Map((data.items.data?.records[request.id] ?? []).filter(item => productMatches(item.product.id)).map(item => [item.product.id, item])).values()]), row => String(row.product.id), row => row.product.name).slice(0, 10),
        ratings: groupValues(suppliers, row => row.rating === null ? "missing" : String(row.rating), row => row.rating === null ? "Sem avaliação" : `Nota ${row.rating}`),
        // Divergent quantities remain separated by unit; shortages and surpluses are not netted.
        sortedBatches: [...batches].sort((a, b) => (a.expirationDate ?? "9999").localeCompare(b.expirationDate ?? "9999") || a.id - b.id),
        scopedBatchIds,
        states: {
            batches: availability(data.batches, ...(productFiltered ? [data.products] : [])),
            categories: availability(data.batches, data.stock, stockMetadata),
            stock: availability(data.stock, ...(stockPeriod ? [data.batches] : []), ...(productFiltered ? [data.products] : [])),
            products: availability(stockMetadata, data.stock, data.batches),
            requisitions: availability(data.requisitions, ...(productFiltered ? [data.items, data.products] : [])),
            alerts: availability(data.alerts, ...(productFiltered ? [data.products] : [])),
            parameters: availability(data.parameters, productFiltered ? data.products : stockMetadata, data.stock, data.batches),
            items: availability(data.items, data.requisitions, ...(productFiltered ? [data.products] : [])),
            suppliers: availability(data.suppliers, ...(productFiltered ? [data.links, data.products] : [])),
            links: availability(data.links, data.products, data.stock, data.batches),
            inventories: availability(data.inventories, ...(productFiltered ? [data.counts, data.batches, data.products] : [])),
            counts: availability(data.counts, data.inventories, data.batches, productFiltered ? data.products : stockMetadata),
        },
    };
}

export type DashboardAnalysis = ReturnType<typeof analyzeDashboard>;
