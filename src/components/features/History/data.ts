import type { RequisitionDto, RequisitionItemDto } from "../../../types/api";
import type { HistoryMode, HistoryRow, StatusTone } from "../../../types/history";

function formatDate(isoDate: string | null | undefined): string {
    if (!isoDate) return "—";
    const date = new Date(isoDate);
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(date);
}

function formatTime(isoDate: string | null | undefined): string {
    if (!isoDate) return "—";
    const date = new Date(isoDate);
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatQuantity(quantity: number): string {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(quantity);
}

function getStatus(mode: HistoryMode, status: RequisitionDto["status"]): { label: string; tone: StatusTone } {
    if (mode === "withdrawal") return { label: "Concluída", tone: "complete" };

    switch (status) {
        case "APPROVED": return { label: "Aprovada", tone: "complete" };
        case "UNDER_REVIEW": return { label: "Pendente", tone: "pending" };
        case "REJECTED": return { label: "Recusada", tone: "observation" };
        case "CANCELLED": return { label: "Cancelada", tone: "observation" };
    }
}

export function mapRequisitionItems(
    requisition: RequisitionDto,
    items: RequisitionItemDto[],
    brands: Map<string, string>,
    mode: HistoryMode,
): HistoryRow[] {
    const dateTime = mode === "withdrawal"
        ? requisition.approvedAt ?? requisition.createdAt
        : requisition.createdAt;
    const status = getStatus(mode, requisition.status);

    return items.map((item) => ({
        key: `${requisition.id}-${item.id}`,
        status: status.label,
        statusTone: status.tone,
        reason: requisition.reason ?? undefined,
        initial: [...item.product.name.trim()][0]?.toLocaleUpperCase("pt-BR") ?? "?",
        product: item.product.name,
        id: String(requisition.id),
        date: formatDate(dateTime),
        time: formatTime(dateTime),
        quantity: formatQuantity(item.quantity),
        brand: brands.get(String(item.product.id)) || "—",
    }));
}
