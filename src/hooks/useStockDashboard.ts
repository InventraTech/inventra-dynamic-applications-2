import { useEffect, useState } from "react";
import {
    consumeKitchenStock,
    getExpiringStockBatches,
    getKitchenStock,
    getKitchenStockSuppliers,
    getStockMovements,
    registerStockEntry,
    writeOffStockBatch,
} from "../services/stock";
import type {
    BatchWriteOffRequest,
    KitchenStockItem,
    StockBatch,
    StockConsumptionRequest,
    StockEntryRequest,
    StockMovement,
    StockMovementType,
    StockSupplier,
} from "../types/stock";

export type StockMovementFilter = "ALL" | StockMovementType;
export type StockMutationKind = "entry" | "consumption" | "write-off";

interface ResourceState<T> {
    data: T;
    loading: boolean;
    error: string | null;
}

interface MutationState {
    kind: StockMutationKind | null;
    submitting: boolean;
    error: string | null;
    success: string | null;
}

function emptyResource<T>(data: T): ResourceState<T> {
    return { data, loading: false, error: null };
}

function getError(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

export default function useStockDashboard(kitchenId: number | null) {
    const [products, setProducts] = useState<ResourceState<KitchenStockItem[]>>({ data: [], loading: true, error: null });
    const [expiring, setExpiring] = useState<ResourceState<StockBatch[]>>({ data: [], loading: true, error: null });
    const [movements, setMovements] = useState<ResourceState<StockMovement[]>>({ data: [], loading: true, error: null });
    const [suppliers, setSuppliers] = useState<ResourceState<StockSupplier[]>>({ data: [], loading: false, error: null });
    const [days, setDays] = useState(30);
    const [limit, setLimit] = useState(50);
    const [movementType, setMovementType] = useState<StockMovementFilter>("ALL");
    const [reloadVersion, setReloadVersion] = useState(0);
    const [productsRetry, setProductsRetry] = useState(0);
    const [expiringRetry, setExpiringRetry] = useState(0);
    const [movementsRetry, setMovementsRetry] = useState(0);
    const [suppliersRetry, setSuppliersRetry] = useState(0);
    const [mutation, setMutation] = useState<MutationState>({ kind: null, submitting: false, error: null, success: null });

    useEffect(() => {
        if (kitchenId === null) {
            setProducts(emptyResource([]));
            return;
        }

        const controller = new AbortController();
        setProducts((current) => ({ ...current, loading: true, error: null }));
        getKitchenStock(kitchenId, {}, controller.signal)
            .then((data) => { if (!controller.signal.aborted) setProducts({ data, loading: false, error: null }); })
            .catch((error: unknown) => { if (!controller.signal.aborted) setProducts((current) => ({ data: current.data, loading: false, error: getError(error, "Não foi possível carregar o estoque da cozinha.") })); });
        return () => controller.abort();
    }, [kitchenId, productsRetry, reloadVersion]);

    useEffect(() => {
        if (kitchenId === null) {
            setExpiring(emptyResource([]));
            return;
        }
        const controller = new AbortController();
        setExpiring((current) => ({ ...current, loading: true, error: null }));
        getExpiringStockBatches(kitchenId, days, controller.signal)
            .then((data) => { if (!controller.signal.aborted) setExpiring({ data, loading: false, error: null }); })
            .catch((error: unknown) => { if (!controller.signal.aborted) setExpiring((current) => ({ data: current.data, loading: false, error: getError(error, "Não foi possível carregar os lotes próximos do vencimento.") })); });
        return () => controller.abort();
    }, [days, expiringRetry, kitchenId, reloadVersion]);

    useEffect(() => {
        if (kitchenId === null) {
            setMovements(emptyResource([]));
            return;
        }
        const controller = new AbortController();
        setMovements((current) => ({ ...current, loading: true, error: null }));
        const requestedType = movementType === "ALL" ? undefined : movementType;
        getStockMovements(kitchenId, limit, requestedType, undefined, controller.signal)
            .then((data) => { if (!controller.signal.aborted) setMovements({ data, loading: false, error: null }); })
            .catch((error: unknown) => { if (!controller.signal.aborted) setMovements((current) => ({ data: current.data, loading: false, error: getError(error, "Não foi possível carregar as movimentações.") })); });
        return () => controller.abort();
    }, [kitchenId, limit, movementsRetry, movementType, reloadVersion]);

    useEffect(() => {
        if (kitchenId === null) {
            setSuppliers(emptyResource([]));
            return;
        }
        const controller = new AbortController();
        setSuppliers((current) => ({ ...current, loading: true, error: null }));
        getKitchenStockSuppliers(kitchenId, controller.signal)
            .then((data) => { if (!controller.signal.aborted) setSuppliers({ data, loading: false, error: null }); })
            .catch((error: unknown) => { if (!controller.signal.aborted) setSuppliers((current) => ({ data: current.data, loading: false, error: getError(error, "Não foi possível carregar os fornecedores da cozinha.") })); });
        return () => controller.abort();
    }, [kitchenId, reloadVersion, suppliersRetry]);

    function retryProducts() { setProductsRetry((version) => version + 1); }
    function retryExpiring() { setExpiringRetry((version) => version + 1); }
    function retryMovements() { setMovementsRetry((version) => version + 1); }
    function retrySuppliers() { setSuppliersRetry((version) => version + 1); }

    async function runMutation(kind: StockMutationKind, request: () => Promise<unknown>, success: string): Promise<boolean> {
        setMutation({ kind, submitting: true, error: null, success: null });
        try {
            await request();
            setMutation({ kind, submitting: false, error: null, success });
            setReloadVersion((version) => version + 1);
            return true;
        } catch (error: unknown) {
            setMutation({ kind, submitting: false, error: getError(error, "Não foi possível salvar a movimentação. Tente novamente."), success: null });
            return false;
        }
    }

    function createEntry(request: StockEntryRequest) {
        return runMutation("entry", () => registerStockEntry(request), "Entrada registrada; estoque, alertas e movimentações atualizados.");
    }

    function createConsumption(request: StockConsumptionRequest) {
        return runMutation("consumption", () => consumeKitchenStock(request), "Consumo registrado e saldo da cozinha atualizado.");
    }

    function createWriteOff(batchId: number, request: BatchWriteOffRequest) {
        return runMutation("write-off", () => writeOffStockBatch(batchId, request), "Baixa registrada no lote selecionado.");
    }

    function clearMutationFeedback() {
        setMutation((current) => ({ ...current, error: null, success: null }));
    }

    return {
        products,
        expiring,
        movements,
        suppliers,
        days,
        limit,
        movementType,
        mutation,
        refreshKey: reloadVersion,
        setDays,
        setLimit,
        setMovementType,
        retryProducts,
        retryExpiring,
        retryMovements,
        retrySuppliers,
        createEntry,
        createConsumption,
        createWriteOff,
        clearMutationFeedback,
    };
}
