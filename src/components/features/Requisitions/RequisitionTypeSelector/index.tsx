import { useId } from "react";
import type { RequisitionType } from "../../../../types/requisitions";

interface RequisitionTypeSelectorProps {
    value: RequisitionType;
    onChange: (value: RequisitionType) => void;
}

const options: Array<{ type: RequisitionType; label: string; description: string }> = [
    { type: "PURCHASE", label: "Compra", description: "Reposição com fornecedor sugerido." },
    { type: "CONSUMPTION", label: "Consumo", description: "Uso dos produtos da cozinha." },
    { type: "TRANSFER", label: "Transferência", description: "Envio para outro local informado." },
];

export default function RequisitionTypeSelector({ value, onChange }: RequisitionTypeSelectorProps) {
    const groupId = useId();

    return (
        <fieldset className="grid min-w-0 gap-3">
            <legend className="font-semibold text-ink">Tipo da requisição</legend>
            <div className="grid min-w-0 gap-3 md:grid-cols-3">
                {options.map((option) => {
                    const id = `${groupId}-${option.type.toLowerCase()}`;
                    const selected = value === option.type;
                    return (
                        <label key={option.type} htmlFor={id} className={`grid min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-2xl border p-4 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus ${selected ? "border-brand bg-sidebar-active text-heading" : "border-history-border bg-surface text-ink hover:border-brand"}`}>
                            <input id={id} name={groupId} type="radio" value={option.type} checked={selected} onChange={() => onChange(option.type)} className="mt-1 size-4 accent-brand" />
                            <span className="grid min-w-0 gap-1"><span className="font-semibold">{option.label}</span><span className="text-sm leading-relaxed text-history-muted">{option.description}</span></span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
