import SearchField from "../../../ui/SearchField";
import type { RequisitionListFilters } from "../../../../types/requisitions";

interface RequisitionFiltersProps {
    value: RequisitionListFilters;
    onChange: (value: RequisitionListFilters) => void;
}

export default function RequisitionFilters({ value, onChange }: RequisitionFiltersProps) {
    return (
        <form className="grid min-w-0 gap-3 rounded-2xl border border-history-border bg-surface p-3 shadow-history-card sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]" role="search" onSubmit={(event) => event.preventDefault()}>
            <SearchField
                label="Buscar por número, solicitante ou produto"
                placeholder="Buscar por número, solicitante ou produto"
                value={value.search}
                onChange={(event) => onChange({ ...value, search: event.target.value })}
            />
            <label className="grid min-w-0 gap-1 text-sm font-semibold text-ink">
                <span>Status</span>
                <select
                    className="min-h-11 min-w-0 rounded-xl border border-history-border bg-surface px-3 text-sm font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    value={value.status}
                    onChange={(event) => onChange({ ...value, status: event.target.value as RequisitionListFilters["status"] })}
                >
                    <option value="ALL">Todos os status</option>
                    <option value="DRAFT">Rascunho</option>
                    <option value="UNDER_REVIEW">Em análise</option>
                    <option value="APPROVED">Aprovada</option>
                    <option value="REJECTED">Rejeitada</option>
                    <option value="CANCELLED">Cancelada</option>
                </select>
            </label>
            <label className="grid min-w-0 gap-1 text-sm font-semibold text-ink">
                <span>Tipo</span>
                <select
                    className="min-h-11 min-w-0 rounded-xl border border-history-border bg-surface px-3 text-sm font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    value={value.type}
                    onChange={(event) => onChange({ ...value, type: event.target.value as RequisitionListFilters["type"] })}
                >
                    <option value="ALL">Todos os tipos</option>
                    <option value="PURCHASE">Compra</option>
                    <option value="CONSUMPTION">Consumo</option>
                    <option value="TRANSFER">Transferência</option>
                </select>
            </label>
        </form>
    );
}
