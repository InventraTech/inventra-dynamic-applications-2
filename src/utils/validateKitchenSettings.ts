import type { KitchenFormErrors, KitchenFormValues, UpdateKitchenRequest } from "../types/kitchen";

export interface KitchenSettingsValidationResult {
    request: UpdateKitchenRequest | null;
    errors: KitchenFormErrors;
}

export function validateKitchenSettings(values: KitchenFormValues, currentState?: string | null): KitchenSettingsValidationResult {
    const name = values.name.trim();
    const address = values.address.trim();
    const city = values.city.trim();
    const state = values.state.trim().toLocaleUpperCase("pt-BR");
    const errors: KitchenFormErrors = {};

    if (!name) errors.name = "Informe o nome da cozinha.";
    else if (name.length > 120) errors.name = "O nome deve ter no máximo 120 caracteres.";

    if (address.length > 255) errors.address = "O endereço deve ter no máximo 255 caracteres.";

    if (city.length > 120) errors.city = "A cidade deve ter no máximo 120 caracteres.";

    if (state && !/^[A-Z]{2}$/.test(state)) errors.state = "Informe a sigla do estado com duas letras.";
    else if (!state && currentState) errors.state = "A UF já cadastrada não pode ser removida pela API.";

    if (Object.keys(errors).length > 0) return { request: null, errors };

    return {
        request: { name, address, city, ...(state ? { state } : {}) },
        errors,
    };
}
