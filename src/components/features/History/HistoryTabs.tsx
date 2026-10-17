import { NavLink } from "react-router-dom";

import type { HistoryProps } from "../../../types/history";
import withdrawalTabIcon from "../../../assets/icons/retirada.svg";
import purchaseTabIcon from "../../../assets/icons/solicitacao.svg";

function HistoryTabs({ mode }: HistoryProps) {
    return (
        <nav aria-label="Tipos de histórico" className="flex w-fit max-w-full shrink-0 flex-wrap items-stretch gap-1 rounded-history-tabs bg-surface p-1.5 shadow-history-card large-text:w-full large-text:flex-col">
            <NavLink
                className={({ isActive }) => `flex min-h-11 min-w-0 items-center gap-2 rounded-2xl px-5 py-3 font-k2d text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-indicator ${isActive ? "bg-brand-strong font-bold text-on-brand shadow-history-tab" : "text-history-muted hover:bg-history-card-header"}`}
                to="/historico/solicitacoes"
            >
                <img className={mode === "purchase" ? "brightness-0 invert" : ""} src={purchaseTabIcon} alt="" aria-hidden="true" width={18} height={18} />
                Solicitações de compra
            </NavLink>
            <NavLink
                className={({ isActive }) => `flex min-h-11 min-w-0 items-center gap-2 rounded-2xl px-5 py-3 font-k2d text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-indicator ${isActive ? "bg-brand-strong font-bold text-on-brand shadow-history-tab" : "font-semibold text-history-muted hover:bg-history-card-header"}`}
                to="/historico/retiradas"
            >
                <img className={mode === "withdrawal" ? "brightness-0 invert" : ""} src={withdrawalTabIcon} alt="" aria-hidden="true" width={18} height={18} />
                Retirada do estoque
            </NavLink>
        </nav>
    );
}

export default HistoryTabs;
