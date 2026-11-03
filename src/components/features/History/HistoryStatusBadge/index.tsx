import type { RequisitionStatus } from "../../../../types/api";
import type { HistoryStatusBadgeProps } from "../../../../types/history";
import Icon from "../../../ui/Icon";

const statusLabels: Record<RequisitionStatus, string> = {
    APPROVED: "Aprovada",
    UNDER_REVIEW: "Em análise",
    REJECTED: "Recusada",
    CANCELLED: "Cancelada",
};

const statusStyles: Record<RequisitionStatus, string> = {
    APPROVED: "bg-history-status-complete-bg text-history-status-complete-text",
    UNDER_REVIEW: "bg-history-status-observation-bg text-history-status-observation-text",
    REJECTED: "bg-history-status-pending-bg text-history-status-pending-text",
    CANCELLED: "bg-history-status-pending-bg text-history-status-pending-text",
};

function HistoryStatusBadge({ status }: HistoryStatusBadgeProps) {
    return (
        <span className={`inline-flex max-w-full items-center gap-2 rounded-full border border-current px-3 py-1.5 font-k2d text-sm font-bold ${statusStyles[status]}`}>
            <Icon name={status === "APPROVED" ? "check" : status === "UNDER_REVIEW" ? "clock" : status === "CANCELLED" ? "minus" : "close"} className="size-4 shrink-0" />
            {statusLabels[status]}
        </span>
    );
}

export default HistoryStatusBadge;
