export interface LoginFormValues {
    email: string;
    password: string;
}

export type LoginField = keyof LoginFormValues;
export type LoginFormErrors = Partial<Record<LoginField, string>>;

export interface LoginValidationResult {
    values: LoginFormValues | null;
    errors: LoginFormErrors;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginFormValues): LoginValidationResult {
    const email = values.email.trim();
    const errors: LoginFormErrors = {};

    if (!email) errors.email = "Informe seu e-mail.";
    else if (email.length > 150) errors.email = "O e-mail deve ter no máximo 150 caracteres.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Informe um e-mail válido.";

    if (!values.password) errors.password = "Informe sua senha.";
    else if (values.password.length > 100) errors.password = "A senha deve ter no máximo 100 caracteres.";

    return Object.keys(errors).length > 0
        ? { values: null, errors }
        : { values: { email, password: values.password }, errors };
}
