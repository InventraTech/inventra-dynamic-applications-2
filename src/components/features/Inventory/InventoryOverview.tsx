import type { Inventory } from "../../../types/inventory";
import approvalIcon from "../../../assets/icons/aprovado.svg";
import cancelIcon from "../../../assets/icons/erro.svg";
import inventoryIcon from "../../../assets/icons/pre-lista.svg";
import openIcon from "../../../assets/icons/marcador-data.svg";

interface InventoryOverviewProps {
    inventories: Inventory[];
}

export default function InventoryOverview({ inventories }: InventoryOverviewProps) {
    const summaries = [
        { key: "all", value: inventories.length, label: "Inventários", detail: "Na cozinha atual", icon: inventoryIcon, tone: "bg-sidebar-active" },
        { key: "open", value: inventories.filter((item) => item.status === "OPEN").length, label: "Abertos", detail: "Só um por vez", icon: openIcon, tone: "bg-history-status-observation-bg" },
        { key: "closed", value: inventories.filter((item) => item.status === "CLOSED").length, label: "Fechados", detail: "Divergência aplicada", icon: approvalIcon, tone: "bg-feedback-success-bg" },
        { key: "cancelled", value: inventories.filter((item) => item.status === "CANCELLED").length, label: "Cancelados", detail: "Nada foi aplicado", icon: cancelIcon, tone: "bg-history-card-header" },
    ];

    return (
        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4 large-text:grid-cols-1" aria-label="Resumo dos inventários">
            {summaries.map((summary) => (
                <li key={summary.key} className="flex min-h-20 min-w-0 items-center gap-3 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5">
                    <span className={`grid size-10 shrink-0 place-items-center rounded-2xl sm:size-12 ${summary.tone}`} aria-hidden="true">
                        <img className="size-5 sm:size-6" src={summary.icon} alt="" />
                    </span>
                    <span className="grid min-w-0 gap-1">
                        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                            <strong className="font-k2d text-xl leading-none text-ink sm:text-2xl">{summary.value}</strong>
                            <span className="text-sm font-semibold leading-tight text-ink">{summary.label}</span>
                        </span>
                        <span className="text-xs leading-normal text-history-muted">{summary.detail}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}
