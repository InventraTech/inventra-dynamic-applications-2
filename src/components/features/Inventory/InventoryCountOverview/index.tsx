import type { InventoryCount } from "../../../../types/inventory";
import countIcon from "../../../../assets/icons/pre-lista.svg";
import varianceIcon from "../../../../assets/icons/adicionar.svg";
import lossIcon from "../../../../assets/icons/erro.svg";
import gainIcon from "../../../../assets/icons/sucesso.svg";

interface InventoryCountOverviewProps {
    counts: InventoryCount[];
}

export default function InventoryCountOverview({ counts }: InventoryCountOverviewProps) {
    const items = [
        { id: "counts", count: counts.length, label: "Contagens", detail: "Lotes contados", icon: countIcon, color: "text-sidebar-purple", surface: "bg-sidebar-active" },
        { id: "variance", count: counts.filter((count) => count.divergence !== 0).length, label: "Com divergência", detail: "Diferente de zero", icon: varianceIcon, color: "text-history-status-observation-text", surface: "bg-history-status-observation-bg" },
        { id: "shortage", count: counts.filter((count) => count.divergence < 0).length, label: "Faltou", detail: "Divergência negativa", icon: lossIcon, color: "text-feedback-error", surface: "bg-feedback-error-bg" },
        { id: "surplus", count: counts.filter((count) => count.divergence > 0).length, label: "Sobrou", detail: "Divergência positiva", icon: gainIcon, color: "text-feedback-success", surface: "bg-feedback-success-bg" },
    ];

    return (
        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4 large-text:grid-cols-1" aria-label="Resumo das contagens">
            {items.map((item) => <li key={item.id} className="flex min-h-20 min-w-0 items-center gap-3 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5">
                <span className={`grid size-10 shrink-0 place-items-center rounded-2xl sm:size-12 ${item.surface}`} aria-hidden="true"><img className="size-5 sm:size-6" src={item.icon} alt="" /></span>
                <span className="grid min-w-0 gap-1">
                    <span className="flex min-w-0 flex-wrap items-baseline gap-x-2"><strong className={`font-k2d text-xl leading-none sm:text-2xl ${item.color}`}>{item.count}</strong><span className="text-sm font-semibold leading-tight text-ink">{item.label}</span></span>
                    <span className="text-xs leading-normal text-history-muted">{item.detail}</span>
                </span>
            </li>)}
        </ul>
    );
}
