export type ProductReferenceKind = "category" | "unit";

export interface ProductReferenceFormValues {
    primary: string;
    description: string;
}

export type ProductReferenceField = keyof ProductReferenceFormValues;
export type ProductReferenceErrors = Partial<Record<ProductReferenceField, string>>;

export interface ProductReferenceValidationResult {
    values: ProductReferenceFormValues | null;
    errors: ProductReferenceErrors;
}

export function validateProductReference(
    kind: ProductReferenceKind,
    values: ProductReferenceFormValues,
): ProductReferenceValidationResult {
    const normalized = {
        primary: values.primary.trim(),
        description: values.description.trim(),
    };
    const maxPrimaryLength = kind === "category" ? 80 : 10;
    const maxDescriptionLength = kind === "category" ? 255 : 60;
    const errors: ProductReferenceErrors = {};

    if (!normalized.primary) {
        errors.primary = kind === "category" ? "Informe o nome da categoria." : "Informe o símbolo da unidade.";
    } else if (normalized.primary.length > maxPrimaryLength) {
        errors.primary = `Use até ${maxPrimaryLength} caracteres.`;
    }
    if (kind === "unit" && !normalized.description) errors.description = "Informe a descrição da unidade.";
    else if (normalized.description.length > maxDescriptionLength) {
        errors.description = `A descrição pode ter até ${maxDescriptionLength} caracteres.`;
    }

    return Object.keys(errors).length > 0
        ? { values: null, errors }
        : { values: normalized, errors };
}
