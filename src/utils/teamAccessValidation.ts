import type { TeamUserFormErrors, TeamUserFormValues } from "../types/teamAccess";

export function validateTeamUser(values: TeamUserFormValues, isEditing: boolean): TeamUserFormErrors {
    const errors: TeamUserFormErrors = {};
    const name = values.name.trim();
    const email = values.email.trim();

    if (!name) errors.name = "Informe o nome completo.";
    else if (name.length > 120) errors.name = "O nome deve ter no máximo 120 caracteres.";

    if (!isEditing) {
        if (!email) errors.email = "Informe o e-mail.";
        else if (email.length > 150) errors.email = "O e-mail deve ter no máximo 150 caracteres.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Informe um e-mail válido.";

        if (values.password.length < 8 || values.password.length > 100) {
            errors.password = "A senha inicial deve ter de 8 a 100 caracteres.";
        }
        if (values.confirmPassword !== values.password) {
            errors.confirmPassword = "As senhas não coincidem.";
        }
    }

    if (!values.profileId || !Number.isInteger(Number(values.profileId))) {
        errors.profileId = "Selecione um perfil de acesso.";
    }

    return errors;
}
