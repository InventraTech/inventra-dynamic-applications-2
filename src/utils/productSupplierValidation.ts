import type { ProductSupplierInput } from "../types/products";

export interface ProductSupplierFormValues {
    supplierId: string;
    supplierCode: string;
    referencePrice: string;
    leadTimeDays: string;
}

export type ProductSupplierField = keyof ProductSupplierFormValues;
export type ProductSupplierErrors = Partial<Record<ProductSupplierField, string>>;

export interface ProductSupplierValidationResult {
    value: ProductSupplierInput | null;
    errors: ProductSupplierErrors;
}

export function validateProductSupplier(
    values: ProductSupplierFormValues,
    availableSupplierIds: ReadonlySet<number>,
): ProductSupplierValidationResult {
    const errors: ProductSupplierErrors = {};
    const supplierId = Number(values.supplierId);
    const supplierCode = values.supplierCode.trim();
    const priceText = values.referencePrice.trim().replace(",", ".");
    const leadTimeText = values.leadTimeDays.trim();

    if (!Number.isSafeInteger(supplierId) || !availableSupplierIds.has(supplierId)) {
        errors.supplierId = "Selecione um fornecedor ativo que ainda não esteja associado.";
    }
    if (supplierCode.length > 50) errors.supplierCode = "O código pode ter até 50 caracteres.";
    if (priceText && (!/^\d{1,10}(?:\.\d{1,2})?$/.test(priceText) || !Number.isFinite(Number(priceText)))) {
        errors.referencePrice = "Informe um valor não negativo com até 10 algarismos inteiros e 2 casas decimais.";
    }
    if (leadTimeText && (!/^\d{1,9}$/.test(leadTimeText) || !Number.isSafeInteger(Number(leadTimeText)))) {
        errors.leadTimeDays = "Informe um prazo inteiro de dias, entre zero e 9 algarismos.";
    }

    if (Object.keys(errors).length > 0) return { value: null, errors };

    return {
        errors,
        value: {
            supplierId,
            supplierCode,
            referencePrice: priceText ? Number(priceText) : null,
            leadTimeDays: leadTimeText ? Number(leadTimeText) : null,
        },
    };
}
