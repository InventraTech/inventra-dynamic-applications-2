import type { HistoryMode, HistoryRow, StatusTone } from "../../../types/history";
import withdrawalCompleteDot from "../../../assets/icons/history-1-status-complete.svg";
import purchasePendingDot from "../../../assets/icons/history-2-status-pending.svg";
import purchaseObservationDot from "../../../assets/icons/history-2-status-observation.svg";
import purchaseCompleteDot from "../../../assets/icons/history-2-status-complete.svg";

const statusStyles: Record<StatusTone, string> = {
    complete: "bg-history-status-complete-bg text-history-status-complete-text",
    pending: "bg-history-status-pending-bg text-history-status-pending-text",
    observation: "bg-history-status-observation-bg text-history-status-observation-text",
};

interface HistoryStatusBadgeProps {
    mode: HistoryMode;
    row: HistoryRow;
}

function HistoryStatusBadge({ row, mode }: HistoryStatusBadgeProps) {
    const dot = mode === "withdrawal"
        ? withdrawalCompleteDot
        : row.statusTone === "pending"
            ? purchasePendingDot
            : row.statusTone === "observation"
                ? purchaseObservationDot
                : purchaseCompleteDot;

    return (
        <div
            className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-k2d text-history-header font-bold whitespace-nowrap ${statusStyles[row.statusTone]}`}
            title={row.reason || undefined}
        >
            <img src={dot} alt="" aria-hidden="true" />
            {row.status}
        </div>
    );
}

export default HistoryStatusBadge;
