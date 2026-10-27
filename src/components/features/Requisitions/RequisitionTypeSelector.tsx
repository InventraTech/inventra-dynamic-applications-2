import { useId } from "react";
import type { RequisitionType } from "../../../types/requisitions";
import purchaseIcon from "../../../assets/icons/carrinho.svg";
import consumptionIcon from "../../../assets/icons/categoria-vegetal.svg";
import transferIcon from "../../../assets/icons/requisicao.svg";

interface RequisitionTypeSelectorProps {
    value: RequisitionType;
    onChange: (value: RequisitionType) => void;
    disabled?: boolean;
}

const options: Array<{ type: RequisitionType; label: string; description: string; icon: string }> = [
    { type: "PURCHASE", label: "Compra", description: "Reposição com fornecedor sugerido.", icon: purchaseIcon },
    { type: "CONSUMPTION", label: "Consumo", description: "Uso dos produtos nesta cozinha.", icon: consumptionIcon },
    { type: "TRANSFER", label: "Transferência", description: "Destino informado em texto livre.", icon: transferIcon },
];

export default function RequisitionTypeSelector({ value, onChange, disabled = false }: RequisitionTypeSelectorProps) {
    const groupId = useId();

    return (
        <fieldset className="grid min-w-0 gap-3">
            <legend className="font-semibold text-ink mb-4">Tipo da requisição</legend>
            <div className="grid min-w-0 gap-3 md:grid-cols-3">
                {options.map((option) => {
                    const id = groupId + "-" + option.type.toLowerCase();
                    const selected = value === option.type;
                    return (
                        <label key={option.type} htmlFor={id} className={"relative grid min-h-24 min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border p-3 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus sm:p-4 " + (selected ? "border-brand bg-sidebar-active text-heading" : "border-history-border bg-surface text-ink hover:border-brand hover:bg-history-card-header") + (disabled ? " cursor-not-allowed" : "")}>
                            <input id={id} name={groupId} type="radio" value={option.type} checked={selected} disabled={disabled} onChange={() => onChange(option.type)} className="peer sr-only" />
                            <span className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3"><img src={option.icon} alt="" aria-hidden="true" className="size-6 shrink-0" /><span className="grid min-w-0 gap-1"><span className="font-semibold text-brand">{option.label}</span><span className="text-sm leading-relaxed text-history-muted">{option.description}</span></span></span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
