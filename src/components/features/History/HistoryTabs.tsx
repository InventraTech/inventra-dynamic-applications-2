import { NavLink } from "react-router-dom";

import type { HistoryProps } from "../../../types/history";
import withdrawalTabIcon from "../../../assets/icons/retirada.svg";
import purchaseTabIcon from "../../../assets/icons/solicitacao.svg";

function HistoryTabs({ mode }: HistoryProps) {
    return (
        <div className="flex w-fit max-w-full shrink-0 items-start gap-1 overflow-x-auto rounded-[22px] bg-white p-1.5 shadow-history-card">
            <NavLink
                className={({ isActive }) => `flex items-center gap-2 rounded-2xl px-5 py-[11px] font-k2d text-[15px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5700bb] ${isActive ? "bg-sidebar-purple font-bold text-white shadow-history-tab" : "text-history-muted hover:bg-history-card-header"}`}
                to="/historico/solicitacoes"
            >
                <img className={mode === "purchase" ? "brightness-0 invert" : ""} src={purchaseTabIcon} alt="" aria-hidden="true" width={18} height={18} />
                Solicitações de compra
            </NavLink>
            <NavLink
                className={({ isActive }) => `flex items-center gap-2 rounded-2xl px-5 py-[11px] font-k2d text-[15px] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5700bb] ${isActive ? "bg-sidebar-purple font-bold text-white shadow-history-tab" : "font-semibold text-history-muted hover:bg-history-card-header"}`}
                to="/historico/retiradas"
            >
                <img className={mode === "withdrawal" ? "brightness-0 invert" : ""} src={withdrawalTabIcon} alt="" aria-hidden="true" width={18} height={18} />
                Retirada do estoque
            </NavLink>
        </div>
    );
}

export default HistoryTabs;
