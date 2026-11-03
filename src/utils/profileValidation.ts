export interface ProfileFormValues {
    name: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>;

export function validateProfileName(value: string): string | null {
    const name = value.trim();
    if (!name) return "Informe seu nome.";
    if (name.length > 120) return "O nome deve ter no máximo 120 caracteres.";
    return null;
}

export function validateProfilePassword(
    values: Pick<ProfileFormValues, "currentPassword" | "newPassword" | "confirmPassword">,
    hasPassword: boolean,
): ProfileFormErrors {
    const errors: ProfileFormErrors = {};
    if (hasPassword && !values.currentPassword) errors.currentPassword = "Informe sua senha atual.";
    if (!values.newPassword) errors.newPassword = "Informe uma nova senha.";
    else if (values.newPassword.length < 8 || values.newPassword.length > 100) {
        errors.newPassword = "A nova senha deve ter entre 8 e 100 caracteres.";
    }
    if (!values.confirmPassword) errors.confirmPassword = "Confirme sua nova senha.";
    else if (values.confirmPassword !== values.newPassword) errors.confirmPassword = "As senhas não coincidem.";
    return errors;
}

export function validateProfilePhoto(file: File): string | null {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const allowedExtensions = /\.(jpe?g|png|webp)$/i;
    if (file.size === 0) return "O arquivo selecionado está vazio.";
    if (file.size > 5 * 1024 * 1024) return "A imagem deve ter no máximo 5 MB.";
    if (!allowedTypes.includes(file.type) && !(file.type === "" && allowedExtensions.test(file.name))) {
        return "Use uma imagem JPEG, PNG ou WebP.";
    }
    return null;
}
