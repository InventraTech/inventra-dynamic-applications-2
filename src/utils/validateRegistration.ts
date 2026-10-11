import type { AuthAccessType, RegisterRequest } from "../types/auth";

export interface RegistrationFormValues {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    accessType: AuthAccessType | "";
}

export type RegistrationField = keyof RegistrationFormValues;
export type RegistrationErrors = Partial<Record<RegistrationField, string>>;

export interface RegistrationValidationResult {
    request: RegisterRequest | null;
    errors: RegistrationErrors;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration(values: RegistrationFormValues): RegistrationValidationResult {
    const name = values.name.trim();
    const email = values.email.trim();
    const errors: RegistrationErrors = {};

    if (!name) errors.name = "Informe seu nome.";
    else if (name.length > 120) errors.name = "O nome deve ter no máximo 120 caracteres.";

    if (!email) errors.email = "Informe seu e-mail.";
    else if (email.length > 150) errors.email = "O e-mail deve ter no máximo 150 caracteres.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Informe um e-mail válido.";

    if (values.password.length < 8) errors.password = "A senha deve ter pelo menos 8 caracteres.";
    else if (values.password.length > 100) errors.password = "A senha deve ter no máximo 100 caracteres.";

    if (values.confirmPassword !== values.password) {
        errors.confirmPassword = "As senhas não coincidem.";
    }

    if (!values.accessType) errors.accessType = "Selecione um tipo de acesso.";

    if (Object.keys(errors).length > 0 || !values.accessType) {
        return { request: null, errors };
    }

    return {
        request: {
            name,
            email,
            password: values.password,
            accessType: values.accessType,
        },
        errors,
    };
}
