import { useCallback, useState } from "react";
import { openInventory } from "../services/inventory";
import type { Inventory } from "../types/inventory";
import { validateInventoryNote } from "../utils/inventoryValidation";

export default function useOpenInventory(kitchenId: number | null, onOpened: (inventory: Inventory) => void) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const submit = useCallback(async (note: string): Promise<boolean> => {
        const noteError = validateInventoryNote(note);
        if (noteError) {
            setError(noteError);
            return false;
        }
        if (kitchenId === null) {
            setError("Associe sua conta a uma cozinha para abrir um inventário.");
            return false;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const inventory = await openInventory({ kitchenId, ...(note.trim() ? { note: note.trim() } : {}) });
            onOpened(inventory);
            setSuccess(`Inventário #${inventory.id} aberto.`);
            return true;
        } catch (caught: unknown) {
            setError(caught instanceof Error ? caught.message : "Não foi possível abrir o inventário.");
            return false;
        } finally {
            setSaving(false);
        }
    }, [kitchenId, onOpened]);

    const clearFeedback = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    return { saving, error, success, submit, clearFeedback };
}
