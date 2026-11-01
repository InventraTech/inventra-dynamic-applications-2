import { useCallback, useState } from "react";
import {
    cancelInventory,
    closeInventory,
    registerInventoryCount,
    removeInventoryCount,
} from "../services/inventory";
import type { RegisterInventoryCountRequest } from "../types/inventory";

export type InventoryActionKind = "count" | "remove-count" | "close" | "cancel";

export default function useInventoryActions(inventoryId: number, onChanged: () => void) {
    const [saving, setSaving] = useState(false);
    const [action, setAction] = useState<InventoryActionKind | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const run = useCallback(async (kind: InventoryActionKind, operation: () => Promise<unknown>, successMessage: string) => {
        if (saving) return false;
        setSaving(true);
        setAction(kind);
        setError(null);
        setSuccess(null);
        try {
            await operation();
            setSuccess(successMessage);
            onChanged();
            return true;
        } catch (caught: unknown) {
            setError(caught instanceof Error && caught.message ? caught.message : "Não foi possível concluir a operação no inventário.");
            return false;
        } finally {
            setSaving(false);
            setAction(null);
        }
    }, [onChanged, saving]);

    const addCount = useCallback((request: RegisterInventoryCountRequest) =>
        run("count", () => registerInventoryCount(inventoryId, request), "Contagem registrada."), [inventoryId, run]);
    const removeCount = useCallback((countId: number) =>
        run("remove-count", () => removeInventoryCount(inventoryId, countId), "Contagem removida. O lote pode ser contado novamente."), [inventoryId, run]);
    const close = useCallback(() =>
        run("close", () => closeInventory(inventoryId), "Inventário fechado. As divergências foram aplicadas ao saldo atual."), [inventoryId, run]);
    const cancel = useCallback(() =>
        run("cancel", () => cancelInventory(inventoryId), "Inventário cancelado. Nenhuma divergência foi aplicada ao estoque."), [inventoryId, run]);
    const clearFeedback = useCallback(() => { setError(null); setSuccess(null); }, []);

    return { saving, action, error, success, addCount, removeCount, close, cancel, clearFeedback };
}
