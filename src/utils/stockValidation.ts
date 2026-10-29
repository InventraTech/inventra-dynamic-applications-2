import type { BatchWriteOffRequest, StockEntryRequest } from "../types/stock";

export interface StockEntryFormValues {
    productId: string;
    supplierId: string;
    batchNumber: string;
    invoiceNumber: string;
    initialQuantity: string;
    entryDate: string;
    expirationDate: string;
    unitPrice: string;
}

export type StockEntryField = keyof StockEntryFormValues;
export type StockEntryErrors = Partial<Record<StockEntryField, string>>;

export interface StockEntryValidation {
    value: StockEntryRequest | null;
    errors: StockEntryErrors;
}

export interface StockWriteOffFormValues {
    quantity: string;
    reason: "LOSS" | "EXPIRED";
}

export interface StockWriteOffValidation {
    value: BatchWriteOffRequest | null;
    error: string | null;
}

function parseDecimal(value: string): number | null {
    const normalized = value.trim().replace(",", ".");
    if (!/^\d{1,9}(?:\.\d{1,3})?$/.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

export function validateStockEntry(values: StockEntryFormValues, kitchenId: number): StockEntryValidation {
    const errors: StockEntryErrors = {};
    const quantity = parseDecimal(values.initialQuantity);
    const price = values.unitPrice.trim() ? values.unitPrice.trim().replace(",", ".") : null;
    const supplierId = values.supplierId ? Number(values.supplierId) : undefined;
    const productId = Number(values.productId);

    if (!Number.isInteger(productId) || productId <= 0) errors.productId = "Selecione um produto da cozinha.";
    if (!values.batchNumber.trim()) errors.batchNumber = "Informe o número do lote.";
    else if (values.batchNumber.trim().length > 50) errors.batchNumber = "Use até 50 caracteres.";
    if (quantity === null || quantity <= 0) errors.initialQuantity = "Informe uma quantidade positiva com até 3 casas decimais.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.entryDate) || Number.isNaN(Date.parse(`${values.entryDate}T00:00:00`))) {
        errors.entryDate = "Informe uma data de entrada válida.";
    }
    if (values.expirationDate && (!/^\d{4}-\d{2}-\d{2}$/.test(values.expirationDate) || Number.isNaN(Date.parse(`${values.expirationDate}T00:00:00`)))) {
        errors.expirationDate = "Informe uma data de validade válida.";
    } else if (values.expirationDate && values.entryDate && values.expirationDate < values.entryDate) {
        errors.expirationDate = "A validade não pode ser anterior à entrada.";
    }
    if (supplierId !== undefined && (!Number.isInteger(supplierId) || supplierId <= 0)) errors.supplierId = "Selecione um fornecedor válido.";
    if (price !== null && (!/^\d{1,9}(?:\.\d{1,2})?$/.test(price) || Number(price) < 0)) {
        errors.unitPrice = "Use um valor não negativo com até 2 casas decimais.";
    }

    if (Object.keys(errors).length > 0 || quantity === null) return { value: null, errors };

    const unitPrice = price === null ? undefined : Number(price);
    return {
        errors,
        value: {
            productId,
            kitchenId,
            ...(supplierId !== undefined ? { supplierId } : {}),
            batchNumber: values.batchNumber.trim(),
            ...(values.invoiceNumber.trim() ? { invoiceNumber: values.invoiceNumber.trim() } : {}),
            initialQuantity: quantity,
            entryDate: values.entryDate,
            ...(values.expirationDate ? { expirationDate: values.expirationDate } : {}),
            ...(unitPrice !== undefined ? { unitPrice } : {}),
        },
    };
}

export function validateStockWriteOff(values: StockWriteOffFormValues): StockWriteOffValidation {
    const quantity = parseDecimal(values.quantity);
    if (quantity === null || quantity <= 0) {
        return { value: null, error: "Informe uma quantidade positiva com até 3 casas decimais." };
    }
    return { value: { quantity, reason: values.reason }, error: null };
}

export function validateStockConsumption(quantityValue: string): { quantity: number | null; error: string | null } {
    const quantity = parseDecimal(quantityValue);
    if (quantity === null || quantity <= 0) return { quantity: null, error: "Informe uma quantidade positiva com até 3 casas decimais." };
    return { quantity, error: null };
}
