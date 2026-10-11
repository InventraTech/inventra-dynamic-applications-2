import type { RequisitionStatus } from "../../../types/api";
import type { HistoryStatusBadgeProps } from "../../../types/history";
import approvedIcon from "../../../assets/icons/history-v2/status-approved.svg";
import pendingIcon from "../../../assets/icons/history-2-status-observation.svg";
import rejectedIcon from "../../../assets/icons/history-2-status-pending.svg";

const statusLabels: Record<RequisitionStatus, string> = {
    APPROVED: "Aprovada",
    UNDER_REVIEW: "Em análise",
    REJECTED: "Recusada",
    CANCELLED: "Cancelada",
};

const statusStyles: Record<RequisitionStatus, string> = {
    APPROVED: "bg-[#e7f5ec] text-[#0d8302]",
    UNDER_REVIEW: "bg-[#fff3d4] text-[#8a6200]",
    REJECTED: "bg-[#fbe4e4] text-[#b20707]",
    CANCELLED: "bg-[#f0edf5] text-[#68647a]",
};

const statusIcons: Record<RequisitionStatus, string> = {
    APPROVED: approvedIcon,
    UNDER_REVIEW: pendingIcon,
    REJECTED: rejectedIcon,
    CANCELLED: pendingIcon,
};

function HistoryStatusBadge({ status }: HistoryStatusBadgeProps) {
    return (
        <span className={`inline-flex shrink-0 items-center gap-[7px] rounded-full px-3 py-1.5 font-k2d text-sm font-bold whitespace-nowrap ${statusStyles[status]}`}>
            <img src={statusIcons[status]} alt="" aria-hidden="true" width={16} height={16} />
            {statusLabels[status]}
        </span>
    );
}

export default HistoryStatusBadge;
