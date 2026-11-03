import type { ProductInput, ProductValidationResult } from "../types/products";

export function validateProduct(values: ProductInput): ProductValidationResult {
    const normalized = {
        name: values.name.trim(),
        brand: values.brand.trim(),
        categoryId: values.categoryId,
        unitId: values.unitId,
        barcode: values.barcode.trim(),
    };
    const errors: ProductValidationResult["errors"] = {};

    if (!normalized.name) errors.name = "Informe o nome do produto.";
    else if (normalized.name.length > 150) errors.name = "O nome pode ter até 150 caracteres.";
    if (normalized.brand.length > 80) errors.brand = "A marca pode ter até 80 caracteres.";
    if (!Number.isInteger(normalized.unitId) || normalized.unitId <= 0) errors.unitId = "Selecione uma unidade de medida.";
    if (normalized.barcode.length > 50) errors.barcode = "O código de barras pode ter até 50 caracteres.";

    return { values: normalized, errors };
}

export function validateProductPhoto(file: File): string | null {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) return "Escolha uma imagem JPG, PNG ou WebP.";
    if (file.size === 0) return "O arquivo selecionado está vazio.";
    return null;
}
