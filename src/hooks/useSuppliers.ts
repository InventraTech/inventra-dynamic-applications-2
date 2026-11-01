import { useEffect, useRef, useState } from "react";
import { ApiError } from "../services/api";
import { listSuppliers } from "../services/suppliers";
import type { Supplier } from "../types/suppliers";

function getLoadError(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e tente novamente.";
    return "Não foi possível carregar os fornecedores. Tente novamente.";
}

export interface UseSuppliersResult {
    activeSuppliers: Supplier[];
    inactiveSuppliers: Supplier[];
    allSuppliers: Supplier[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    reload: () => void;
}

export function useSuppliers(canSeeInactive: boolean): UseSuppliersResult {
    const [activeSuppliers, setActiveSuppliers] = useState<Supplier[]>([]);
    const [inactiveSuppliers, setInactiveSuppliers] = useState<Supplier[]>([]);
    const loaded = useRef(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requestKey, setRequestKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setError(null);
        setLoading(!loaded.current);
        setRefreshing(loaded.current);

        Promise.all([
            listSuppliers(true, controller.signal),
            canSeeInactive ? listSuppliers(false, controller.signal) : Promise.resolve([]),
        ]).then(([active, inactive]) => {
            if (controller.signal.aborted) return;
            setActiveSuppliers(active);
            setInactiveSuppliers(inactive);
            loaded.current = true;
            setLoading(false);
            setRefreshing(false);
        }).catch((requestError: unknown) => {
            if (controller.signal.aborted) return;
            setError(getLoadError(requestError));
            setLoading(false);
            setRefreshing(false);
        });

        return () => controller.abort();
    }, [canSeeInactive, requestKey]);

    function reload() {
        setRequestKey((current) => current + 1);
    }

    const allSuppliers = [...activeSuppliers, ...inactiveSuppliers]
        .sort((left, right) => left.legalName.localeCompare(right.legalName, "pt-BR", { sensitivity: "base" }));

    return { activeSuppliers, inactiveSuppliers, allSuppliers, loading, refreshing, error, reload };
}
