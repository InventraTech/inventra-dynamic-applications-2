export interface ProductKitchenFormValues {
    minStock: string;
    maxStock: string;
    averageDailyConsumption: string;
}

export type ProductKitchenField = keyof ProductKitchenFormValues;
export type ProductKitchenErrors = Partial<Record<ProductKitchenField, string>>;

export interface ProductKitchenValidationResult {
    values: {
        minStock: number;
        maxStock: number | null;
        averageDailyConsumption: number | null;
    } | null;
    errors: ProductKitchenErrors;
}

function parseAmount(value: string): number | null {
    if (!value.trim()) return null;
    return Number(value.trim().replace(",", "."));
}

function isValidAmount(value: string): boolean {
    return !value.trim() || /^\d{1,9}(?:[.,]\d{1,3})?$/.test(value.trim());
}

export function validateProductKitchenParameters(values: ProductKitchenFormValues): ProductKitchenValidationResult {
    const errors: ProductKitchenErrors = {};
    const minStock = parseAmount(values.minStock) ?? 0;
    const maxStock = parseAmount(values.maxStock);
    const averageDailyConsumption = parseAmount(values.averageDailyConsumption);

    if (!isValidAmount(values.minStock)) errors.minStock = "Use até 9 algarismos inteiros e 3 casas decimais.";
    if (!isValidAmount(values.maxStock)) errors.maxStock = "Use até 9 algarismos inteiros e 3 casas decimais.";
    if (!isValidAmount(values.averageDailyConsumption)) errors.averageDailyConsumption = "Use até 9 algarismos inteiros e 3 casas decimais.";
    if (maxStock !== null && maxStock < minStock) errors.maxStock = "O estoque máximo não pode ser menor que o estoque mínimo.";

    return Object.keys(errors).length > 0
        ? { values: null, errors }
        : { values: { minStock, maxStock, averageDailyConsumption }, errors };
}
