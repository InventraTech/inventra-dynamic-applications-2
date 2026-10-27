import type { RequisitionStatus, RequisitionType } from "../types/requisitions";
import type { StatusTone } from "../components/ui/StatusBadge";

const statusPresentation: Record<RequisitionStatus, { label: string; tone: StatusTone }> = {
    DRAFT: { label: "Rascunho", tone: "neutral" },
    UNDER_REVIEW: { label: "Em análise", tone: "warning" },
    APPROVED: { label: "Aprovada", tone: "success" },
    REJECTED: { label: "Rejeitada", tone: "danger" },
    CANCELLED: { label: "Cancelada", tone: "danger" },
};

const typeLabels: Record<RequisitionType, string> = {
    PURCHASE: "Compra",
    CONSUMPTION: "Consumo",
    TRANSFER: "Transferência",
};

export function getRequisitionStatusPresentation(status: RequisitionStatus) {
    return statusPresentation[status];
}

export function getRequisitionTypeLabel(type: RequisitionType): string {
    return typeLabels[type];
}

export function formatRequisitionDate(date: string): string {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Data indisponível";
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsedDate).replace(" de ", " ");
}

export function formatRequisitionCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || !Number.isFinite(value)) return "Não informado";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
