import { ApiError } from "../../../services/api";

export function getProfileErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    return fallback;
}

export function formatProfileDate(value: string | null | undefined): string {
    if (!value) return "Não informado";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Data indisponível";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

export function displayProfileRole(accessType: string | null | undefined): string {
    if (!accessType) return "Usuário";
    const labels: Record<string, string> = {
        SUPERVISOR: "Supervisor",
        ESTOQUISTA: "Estoquista",
        COMPRADOR: "Comprador",
    };
    const normalized = accessType.toLocaleUpperCase("pt-BR");
    return labels[normalized] ?? accessType.replaceAll("_", " ").toLocaleLowerCase("pt-BR").replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

export function getProfileDisplayName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0] ?? "Usuário";
}

export function getProfileInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts)
        .map((part) => [...part][0]?.toLocaleUpperCase("pt-BR") ?? "")
        .join("") || "IN";
}
