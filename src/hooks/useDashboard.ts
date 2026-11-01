import { useCallback, useEffect, useMemo, useState } from "react";
import { getSession } from "../services/authSession";
import { getKitchenStock } from "../services/stock";
import { getKitchenRequisitions, getRequisitionItems } from "../services/requisitions";
import { getProductKitchenParameters, getProductSuppliers } from "../services/products";
import { getDashboardAlerts, getDashboardBatches, getDashboardCounts, getDashboardInventories, getDashboardProducts, getDashboardSuppliers, getRelatedRecords } from "../services/dashboard";
import type { DashboardResource, DashboardTab } from "../types/dashboard";

function useResource<T>(key: string | null, revision: number, loader: (signal: AbortSignal) => Promise<T>): DashboardResource<T> {
    const [state, setState] = useState<DashboardResource<T> & { key: string | null; revision: number; loader: typeof loader | null }>({ key: null, revision: -1, loader: null, data: null, loading: false, error: null, updatedAt: null });
    useEffect(() => {
        if (!key) return;
        const controller = new AbortController();
        loader(controller.signal).then(data => {
            if (!controller.signal.aborted) setState({ key, revision, loader, data, loading: false, error: null, updatedAt: Date.now() });
        }).catch(error => {
            if (!controller.signal.aborted) setState({ key, revision, loader, data: null, loading: false, error: error instanceof Error ? error.message : "Não foi possível carregar estes dados.", updatedAt: null });
        });
        return () => controller.abort();
    }, [key, revision, loader]);
    return state.key === key && state.revision === revision && state.loader === loader ? state : { data: null, loading: key !== null, error: null, updatedAt: null };
}

export default function useDashboard(tab: DashboardTab, productFilterActive: boolean) {
    const session = getSession();
    const kitchenId = session?.user.kitchen?.id ?? null;
    // A new authenticated session never reuses another user's data.
    const scope = session && kitchenId !== null ? `${session.user.id}:${kitchenId}:${session.token}` : null;
    const [revision, setRevision] = useState(0);
    const [visited, setVisited] = useState<Set<DashboardTab>>(() => new Set([tab]));
    const [itemsRequested, setItemsRequested] = useState(false);

    const stockLoader = useCallback((signal: AbortSignal) => getKitchenStock(kitchenId!, {}, signal), [kitchenId]);
    const batchLoader = useCallback((signal: AbortSignal) => getDashboardBatches(kitchenId!, signal), [kitchenId]);
    const requisitionLoader = useCallback((signal: AbortSignal) => getKitchenRequisitions(kitchenId!, signal), [kitchenId]);
    const alertLoader = useCallback((signal: AbortSignal) => getDashboardAlerts(kitchenId!, signal), [kitchenId]);
    const stock = useResource(scope, revision, stockLoader);
    const batches = useResource(scope, revision, batchLoader);
    const requisitions = useResource(scope, revision, requisitionLoader);
    const alerts = useResource(scope, revision, alertLoader);
    const itemLoader = useCallback((signal: AbortSignal) => getRelatedRecords((requisitions.data ?? []).filter(row => row.kitchen.id === kitchenId).map(row => row.id), getRequisitionItems, signal), [requisitions.data, kitchenId]);
    const items = useResource(scope && requisitions.data && (visited.has("purchases") || itemsRequested || productFilterActive) ? scope : null, revision, itemLoader);
    const referencedIds = useMemo(() => [...new Set([
        ...(alerts.data ?? []).flatMap(row => row.product ? [row.product.id] : []),
        ...Object.values(items.data?.records ?? {}).flat().map(row => row.product.id),
    ])], [alerts.data, items.data]);
    const productLoader = useCallback((signal: AbortSignal) => getDashboardProducts(stock.data ?? [], batches.data ?? [], signal, referencedIds), [stock.data, batches.data, referencedIds]);
    const products = useResource(scope && stock.data && batches.data ? scope : null, revision, productLoader);
    const productIds = useMemo(() => products.data ? Object.keys(products.data.records).map(Number) : [], [products.data]);
    const parameterLoader = useCallback((signal: AbortSignal) => getRelatedRecords(productIds, getProductKitchenParameters, signal), [productIds]);
    const parameters = useResource(scope && products.data && visited.has("stock") ? scope : null, revision, parameterLoader);
    const supplierLoader = useCallback((signal: AbortSignal) => getDashboardSuppliers(kitchenId!, signal), [kitchenId]);
    const suppliers = useResource(scope && visited.has("purchases") ? scope : null, revision, supplierLoader);
    const linkLoader = useCallback((signal: AbortSignal) => getRelatedRecords(productIds, getProductSuppliers, signal), [productIds]);
    const links = useResource(scope && products.data && visited.has("purchases") ? scope : null, revision, linkLoader);
    const inventoryLoader = useCallback((signal: AbortSignal) => getDashboardInventories(kitchenId!, signal), [kitchenId]);
    const inventories = useResource(scope && visited.has("control") ? scope : null, revision, inventoryLoader);
    const countLoader = useCallback((signal: AbortSignal) => getRelatedRecords((inventories.data ?? []).map(row => row.id), getDashboardCounts, signal), [inventories.data]);
    const counts = useResource(scope && inventories.data ? scope : null, revision, countLoader);

    return { stock, batches, products, requisitions, alerts, parameters, items, suppliers, links, inventories, counts,
        refresh: () => setRevision(value => value + 1),
        visitTab: (value: DashboardTab) => setVisited(previous => previous.has(value) ? previous : new Set([...previous, value])),
        requestItems: () => setItemsRequested(true),
    };
}

export type DashboardData = ReturnType<typeof useDashboard>;
