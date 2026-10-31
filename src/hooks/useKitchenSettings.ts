import { useCallback, useEffect, useState } from "react";

import { activateKitchen, deactivateKitchen, getKitchen, updateKitchen } from "../services/kitchenService";
import { updateSessionKitchen } from "../services/authSession";
import { getKitchenAccessRequests, getTeamUsers } from "../services/teamAccess";
import type { KitchenAccessRequest, TeamUser } from "../types/teamAccess";
import type { KitchenResponse, UpdateKitchenRequest } from "../types/kitchen";

export interface KitchenSettingsState {
    kitchen: KitchenResponse | null;
    users: TeamUser[];
    accessRequests: KitchenAccessRequest[];
    loading: boolean;
    error: string | null;
    teamLoading: boolean;
    teamError: string | null;
    detailsSaving: boolean;
    detailsError: string | null;
    detailsSuccess: string | null;
    discoverySaving: boolean;
    discoveryError: string | null;
    discoverySuccess: string | null;
    statusSaving: boolean;
    statusError: string | null;
    statusSuccess: string | null;
}

export interface KitchenSettingsActions {
    retryKitchen: () => void;
    retryTeam: () => void;
    saveDetails: (request: UpdateKitchenRequest) => Promise<boolean>;
    setDiscovery: (enabled: boolean) => Promise<boolean>;
    setKitchenActive: (active: boolean) => Promise<boolean>;
    clearDetailsFeedback: () => void;
    clearDiscoveryFeedback: () => void;
}

const initialState: KitchenSettingsState = {
    kitchen: null,
    users: [],
    accessRequests: [],
    loading: true,
    error: null,
    teamLoading: false,
    teamError: null,
    detailsSaving: false,
    detailsError: null,
    detailsSuccess: null,
    discoverySaving: false,
    discoveryError: null,
    discoverySuccess: null,
    statusSaving: false,
    statusError: null,
    statusSuccess: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message.trim() ? error.message : fallback;
}

export default function useKitchenSettings(kitchenId: number | null, canManage: boolean): [KitchenSettingsState, KitchenSettingsActions] {
    const [state, setState] = useState<KitchenSettingsState>(initialState);
    const [kitchenRetryKey, setKitchenRetryKey] = useState(0);
    const [teamRetryKey, setTeamRetryKey] = useState(0);

    useEffect(() => {
        if (kitchenId === null) {
            setState((current) => ({ ...current, kitchen: null, loading: false, error: null }));
            return;
        }

        const controller = new AbortController();
        setState((current) => ({ ...current, loading: true, error: null }));

        void getKitchen(kitchenId, controller.signal)
            .then((kitchen) => {
                if (controller.signal.aborted) return;
                setState((current) => ({ ...current, kitchen, loading: false, error: null }));
                updateSessionKitchen({ id: kitchen.id, name: kitchen.name });
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                setState((current) => ({ ...current, kitchen: null, loading: false, error: getErrorMessage(error, "Não foi possível carregar os dados da cozinha.") }));
            });

        return () => controller.abort();
    }, [kitchenId, kitchenRetryKey]);

    useEffect(() => {
        if (!canManage || kitchenId === null) {
            setState((current) => ({ ...current, users: [], accessRequests: [], teamLoading: false, teamError: null }));
            return;
        }

        const controller = new AbortController();
        setState((current) => ({ ...current, teamLoading: true, teamError: null }));
        void Promise.all([
            getTeamUsers(controller.signal),
            getKitchenAccessRequests(controller.signal),
        ])
            .then(([users, accessRequests]) => {
                if (controller.signal.aborted) return;
                setState((current) => ({ ...current, users, accessRequests, teamLoading: false, teamError: null }));
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                setState((current) => ({ ...current, teamLoading: false, teamError: getErrorMessage(error, "Não foi possível carregar os dados da equipe.") }));
            });

        return () => controller.abort();
    }, [canManage, kitchenId, teamRetryKey]);

    const retryKitchen = useCallback(() => setKitchenRetryKey((current) => current + 1), []);
    const retryTeam = useCallback(() => setTeamRetryKey((current) => current + 1), []);

    const saveDetails = useCallback(async (request: UpdateKitchenRequest): Promise<boolean> => {
        if (kitchenId === null) return false;
        setState((current) => ({ ...current, detailsSaving: true, detailsError: null, detailsSuccess: null }));
        try {
            const kitchen = await updateKitchen(kitchenId, request);
            setState((current) => ({ ...current, kitchen, detailsSaving: false, detailsSuccess: "Dados da cozinha atualizados." }));
            updateSessionKitchen({ id: kitchen.id, name: kitchen.name });
            return true;
        } catch (error: unknown) {
            setState((current) => ({ ...current, detailsSaving: false, detailsError: getErrorMessage(error, "Não foi possível salvar os dados da cozinha.") }));
            return false;
        }
    }, [kitchenId]);

    const setDiscovery = useCallback(async (enabled: boolean): Promise<boolean> => {
        if (kitchenId === null) return false;
        setState((current) => ({ ...current, discoverySaving: true, discoveryError: null, discoverySuccess: null }));
        try {
            const kitchen = await updateKitchen(kitchenId, { acceptingRequests: enabled });
            setState((current) => ({ ...current, kitchen, discoverySaving: false, discoverySuccess: enabled ? "A cozinha voltou a aparecer na descoberta." : "A cozinha foi removida da descoberta. O código de convite continua válido." }));
            return true;
        } catch (error: unknown) {
            setState((current) => ({ ...current, discoverySaving: false, discoveryError: getErrorMessage(error, "Não foi possível atualizar a descoberta da cozinha.") }));
            return false;
        }
    }, [kitchenId]);

    const setKitchenActive = useCallback(async (active: boolean): Promise<boolean> => {
        if (kitchenId === null) return false;
        setState((current) => ({ ...current, statusSaving: true, statusError: null, statusSuccess: null }));
        try {
            if (active) await activateKitchen(kitchenId);
            else await deactivateKitchen(kitchenId);
            setState((current) => current.kitchen
                ? { ...current, kitchen: { ...current.kitchen, active }, statusSaving: false, statusError: null, statusSuccess: active ? "Cozinha reativada." : "Cozinha desativada." }
                : { ...current, statusSaving: false, statusSuccess: active ? "Cozinha reativada." : "Cozinha desativada." });
            return true;
        } catch (error: unknown) {
            setState((current) => ({ ...current, statusSaving: false, statusError: getErrorMessage(error, "Não foi possível atualizar a situação da cozinha.") }));
            return false;
        }
    }, [kitchenId]);

    const clearDetailsFeedback = useCallback(() => setState((current) => ({ ...current, detailsError: null, detailsSuccess: null })), []);
    const clearDiscoveryFeedback = useCallback(() => setState((current) => ({ ...current, discoveryError: null, discoverySuccess: null })), []);

    const actions: KitchenSettingsActions = {
        retryKitchen,
        retryTeam,
        saveDetails,
        setDiscovery,
        setKitchenActive,
        clearDetailsFeedback,
        clearDiscoveryFeedback,
    };

    return [state, actions];
}
