import { useCallback, useEffect, useState } from "react";
import { getRequisition, getRequisitionItems } from "../services/requisitions";
import type { Requisition, RequisitionItem } from "../types/requisitions";

export interface RequisitionDetailState {
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    requisition: Requisition | null;
    items: RequisitionItem[];
}

function parseRequestId(value: string | undefined): number | null {
    if (!value || !/^\d+$/.test(value)) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function loadRequisition(id: number, signal?: AbortSignal): Promise<{ requisition: Requisition; items: RequisitionItem[] }> {
    const [requisition, items] = await Promise.all([
        getRequisition(id, signal),
        getRequisitionItems(id, signal),
    ]);
    return { requisition, items };
}

export default function useRequisitionDetail(requestId: string | undefined, enabled = true) {
    const id = parseRequestId(requestId);
    const [state, setState] = useState<RequisitionDetailState>({ loading: true, refreshing: false, error: null, requisition: null, items: [] });

    useEffect(() => {
        if (!enabled) {
            setState({ loading: false, refreshing: false, error: "Sua conta ainda não está vinculada a uma cozinha.", requisition: null, items: [] });
            return;
        }
        if (id === null) {
            setState({ loading: false, refreshing: false, error: "O número da requisição informado é inválido.", requisition: null, items: [] });
            return;
        }

        const controller = new AbortController();
        setState({ loading: true, refreshing: false, error: null, requisition: null, items: [] });
        loadRequisition(id, controller.signal)
            .then((result) => { if (!controller.signal.aborted) setState({ loading: false, refreshing: false, error: null, ...result }); })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                setState({ loading: false, refreshing: false, error: error instanceof Error ? error.message : "Não foi possível carregar esta requisição.", requisition: null, items: [] });
            });
        return () => controller.abort();
    }, [enabled, id]);

    const refresh = useCallback(async () => {
        if (id === null || !enabled) return;
        setState((current) => ({ ...current, refreshing: true, error: null }));
        try {
            const result = await loadRequisition(id);
            setState({ loading: false, refreshing: false, error: null, ...result });
        } catch (error: unknown) {
            setState((current) => ({ ...current, loading: false, refreshing: false, error: error instanceof Error ? error.message : "A ação foi concluída, mas não foi possível atualizar o detalhe." }));
        }
    }, [enabled, id]);

    return { state, refresh, requestId: id };
}
