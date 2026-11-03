import type { CreateKitchenRequest } from "../types/kitchen";

export interface KitchenSetupValues {
    name: string;
    address: string;
}

export type KitchenSetupErrors = Partial<Record<keyof KitchenSetupValues, string>>;

export interface KitchenSetupValidationResult {
    request: CreateKitchenRequest | null;
    errors: KitchenSetupErrors;
}

export function validateKitchenSetup(values: KitchenSetupValues): KitchenSetupValidationResult {
    const name = values.name.trim();
    const address = values.address.trim();
    const errors: KitchenSetupErrors = {};

    if (!name) errors.name = "Informe o nome da cozinha.";
    else if (name.length > 120) errors.name = "O nome deve ter no máximo 120 caracteres.";

    if (address.length > 255) errors.address = "O endereço deve ter no máximo 255 caracteres.";

    if (Object.keys(errors).length > 0) return { request: null, errors };

    return {
        request: { name, address: address || null },
        errors,
    };
}
