import { NavLink } from "react-router-dom";

import type { HistoryProps } from "../../../types/history";
import withdrawalTabIcon from "../../../assets/icons/history-1-tab-withdrawal.svg";
import purchaseTabIcon from "../../../assets/icons/history-1-tab-purchase.svg";
import purchaseTabInactiveIcon from "../../../assets/icons/history-2-tab-withdrawal.svg";
import purchaseTabActiveIcon from "../../../assets/icons/history-2-tab-purchase.svg";

function HistoryTabs({ mode }: HistoryProps) {
    return (
        <div className="flex w-fit max-w-full shrink-0 items-start gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-history-card">
            <NavLink
                className={({ isActive }) => `flex items-center gap-1.5 rounded-xl px-3.5 py-1.75 font-k2d text-history-tab font-semibold whitespace-nowrap transition-colors ${isActive ? "bg-sidebar-purple font-bold text-white shadow-history-tab" : "text-history-muted hover:bg-history-card-header"}`}
                to="/historico/solicitacoes"
            >
                <img src={mode === "purchase" ? purchaseTabActiveIcon : purchaseTabIcon} alt="" aria-hidden="true" />
                Solicitações de compra
            </NavLink>
            <NavLink
                className={({ isActive }) => `flex items-center gap-1.5 rounded-xl px-3.5 py-1.75 font-k2d text-history-tab whitespace-nowrap transition-colors ${isActive ? "bg-sidebar-purple font-bold text-white shadow-history-tab" : "font-semibold text-history-muted hover:bg-history-card-header"}`}
                to="/historico/retiradas"
            >
                <img src={mode === "withdrawal" ? withdrawalTabIcon : purchaseTabInactiveIcon} alt="" aria-hidden="true" />
                Retirada do estoque
            </NavLink>
        </div>
    );
}

export default HistoryTabs;
