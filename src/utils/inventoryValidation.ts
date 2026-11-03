import type { InventoryCountFormValues } from "../types/inventory";

export type InventoryCountField = keyof InventoryCountFormValues;
export type InventoryCountErrors = Partial<Record<InventoryCountField, string>>;

export interface InventoryCountValidation {
    value: { batchId: number; physicalQuantity: number; note?: string } | null;
    errors: InventoryCountErrors;
}

export function validateInventoryNote(value: string): string | null {
    return value.trim().length > 255 ? "Use até 255 caracteres." : null;
}

export function validateInventoryCount(values: InventoryCountFormValues): InventoryCountValidation {
    const errors: InventoryCountErrors = {};
    const batchId = Number(values.batchId);
    const normalizedQuantity = values.physicalQuantity.trim().replace(",", ".");
    const quantity = /^\d{1,9}(?:\.\d{1,3})?$/.test(normalizedQuantity)
        ? Number(normalizedQuantity)
        : Number.NaN;

    if (!Number.isInteger(batchId) || batchId <= 0) errors.batchId = "Selecione um lote da cozinha.";
    if (!Number.isFinite(quantity) || quantity < 0) {
        errors.physicalQuantity = "Informe uma quantidade igual ou maior que zero, com até 3 casas decimais.";
    }
    const noteError = validateInventoryNote(values.note);
    if (noteError) errors.note = noteError;

    if (Object.keys(errors).length > 0) return { value: null, errors };

    return {
        errors,
        value: {
            batchId,
            physicalQuantity: quantity,
            ...(values.note.trim() ? { note: values.note.trim() } : {}),
        },
    };
}
