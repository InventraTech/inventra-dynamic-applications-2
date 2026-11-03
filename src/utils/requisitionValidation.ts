import type { AddRequisitionItemInput, CreateRequisitionInput } from "../types/requisitions";

export interface ValidationResult<T> {
    value: T;
    errors: Partial<Record<keyof T, string>>;
}

export function validateRequisitionOrigin(origin: string): string | null {
    const normalizedOrigin = origin.trim();
    if (!normalizedOrigin) return "Informe a origem ou o destino da requisição.";
    if (normalizedOrigin.length > 20) return "Use no máximo 20 caracteres.";
    return null;
}

export function validateCreateRequisition(input: CreateRequisitionInput): ValidationResult<CreateRequisitionInput> {
    const value = { ...input, origin: input.origin.trim() };
    const originError = validateRequisitionOrigin(value.origin);
    return { value, errors: originError ? { origin: originError } : {} };
}

export function validateRequisitionItem(input: AddRequisitionItemInput): ValidationResult<AddRequisitionItemInput> {
    const value = { ...input, note: input.note?.trim() || undefined };
    const errors: ValidationResult<AddRequisitionItemInput>["errors"] = {};

    if (!Number.isFinite(value.quantity) || value.quantity <= 0 || !/^[0-9]{1,9}(?:\.[0-9]{1,3})?$/.test(String(value.quantity))) {
        errors.quantity = "Informe uma quantidade positiva com até 3 casas decimais.";
    }
    if (value.estimatedPrice !== undefined && (!Number.isFinite(value.estimatedPrice) || value.estimatedPrice < 0 || !/^[0-9]{1,10}(?:\.[0-9]{1,2})?$/.test(String(value.estimatedPrice)))) {
        errors.estimatedPrice = "Informe um preço válido com até 2 casas decimais.";
    }
    if ((value.note?.length ?? 0) > 255) errors.note = "A observação deve ter até 255 caracteres.";

    return { value, errors };
}

export function validateDecisionReason(reason: string): string | null {
    const normalizedReason = reason.trim();
    if (!normalizedReason) return "Informe o motivo para continuar.";
    if (normalizedReason.length > 255) return "O motivo deve ter até 255 caracteres.";
    return null;
}
