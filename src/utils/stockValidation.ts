import type { BatchWriteOffRequest, KitchenStockItem, StockEntryRequest, StockSupplier } from "../types/stock";

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

function isValidDate(value: string): boolean {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime())
        && date.getUTCFullYear() === Number(match[1])
        && date.getUTCMonth() + 1 === Number(match[2])
        && date.getUTCDate() === Number(match[3]);
}

export function validateStockEntry(
    values: StockEntryFormValues,
    kitchenId: number,
    products: readonly KitchenStockItem[],
    suppliers: readonly StockSupplier[],
): StockEntryValidation {
    const errors: StockEntryErrors = {};
    const quantity = parseDecimal(values.initialQuantity);
    const price = values.unitPrice.trim() ? values.unitPrice.trim().replace(",", ".") : null;
    const supplierId = values.supplierId.trim() ? Number(values.supplierId) : undefined;
    const productId = Number(values.productId);
    const availableProductIds = new Set(products.map((product) => product.product.id));
    const availableSupplierIds = new Set(suppliers.map((supplier) => supplier.id));

    if (!Number.isSafeInteger(productId) || !availableProductIds.has(productId)) errors.productId = "Selecione um produto vinculado à cozinha.";
    if (!values.batchNumber.trim()) errors.batchNumber = "Informe o número do lote.";
    else if (values.batchNumber.trim().length > 50) errors.batchNumber = "Use até 50 caracteres.";
    if (quantity === null || quantity <= 0) errors.initialQuantity = "Informe uma quantidade positiva com até 3 casas decimais.";
    if (!isValidDate(values.entryDate)) {
        errors.entryDate = "Informe uma data de entrada válida.";
    }
    if (values.expirationDate && !isValidDate(values.expirationDate)) {
        errors.expirationDate = "Informe uma data de validade válida.";
    } else if (values.expirationDate && values.entryDate && values.expirationDate < values.entryDate) {
        errors.expirationDate = "A validade não pode ser anterior à entrada.";
    }
    if (supplierId !== undefined && (!Number.isSafeInteger(supplierId) || !availableSupplierIds.has(supplierId))) errors.supplierId = "Selecione um fornecedor disponível.";
    if (values.invoiceNumber.trim().length > 50) errors.invoiceNumber = "A nota fiscal pode ter até 50 caracteres.";
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

export interface StockConsumptionFormValues {
    productId: string;
    quantity: string;
}

export type StockConsumptionErrors = Partial<Record<keyof StockConsumptionFormValues, string>>;

export interface StockConsumptionValidation {
    value: { productId: number; quantity: number } | null;
    errors: StockConsumptionErrors;
}

export function validateStockConsumption(
    values: StockConsumptionFormValues,
    products: readonly KitchenStockItem[],
): StockConsumptionValidation {
    const errors: StockConsumptionErrors = {};
    const productId = Number(values.productId);
    const selectedProduct = products.find((product) => product.product.id === productId);
    const quantity = parseDecimal(values.quantity);

    if (!Number.isSafeInteger(productId) || !selectedProduct) errors.productId = "Selecione um produto vinculado à cozinha.";
    if (quantity === null || quantity <= 0) errors.quantity = "Informe uma quantidade positiva com até 3 casas decimais.";
    else if (selectedProduct && quantity > selectedProduct.totalQuantity) {
        errors.quantity = `A quantidade excede o saldo utilizável de ${selectedProduct.totalQuantity} ${selectedProduct.unit.symbol}.`;
    }

    return Object.keys(errors).length > 0 || quantity === null
        ? { value: null, errors }
        : { value: { productId, quantity }, errors };
}
