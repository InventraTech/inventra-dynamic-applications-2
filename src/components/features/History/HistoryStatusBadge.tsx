import type { RequisitionStatus } from "../../../types/api";
import type { HistoryStatusBadgeProps } from "../../../types/history";
import approvedIcon from "../../../assets/icons/aprovado.svg";

const statusLabels: Record<RequisitionStatus, string> = {
    APPROVED: "Aprovada",
    UNDER_REVIEW: "Em análise",
    REJECTED: "Recusada",
    CANCELLED: "Cancelada",
};

const statusStyles: Record<RequisitionStatus, string> = {
    APPROVED: "bg-[#e7f5ec] text-history-status-complete-text",
    UNDER_REVIEW: "bg-[#fff3d4] text-[#8a6200]",
    REJECTED: "bg-history-status-pending-bg text-history-status-pending-text",
    CANCELLED: "bg-[#f0edf5] text-history-muted",
};

const statusIndicatorStyles: Record<RequisitionStatus, string> = {
    APPROVED: "",
    UNDER_REVIEW: "bg-[#d9ae00]",
    REJECTED: "bg-history-status-pending-text",
    CANCELLED: "bg-[#d9ae00]",
};

function HistoryStatusBadge({ status }: HistoryStatusBadgeProps) {
    return (
        <span className={`inline-flex shrink-0 items-center gap-1.75 rounded-full px-3 py-1.5 font-k2d text-sm font-bold whitespace-nowrap ${statusStyles[status]}`}>
            {status === "APPROVED" ? (
                <img src={approvedIcon} alt="" aria-hidden="true" width={16} height={16} />
            ) : (
                <span className={`size-4 rounded-full ${statusIndicatorStyles[status]}`} aria-hidden="true" />
            )}
            {statusLabels[status]}
        </span>
    );
}

export default HistoryStatusBadge;
