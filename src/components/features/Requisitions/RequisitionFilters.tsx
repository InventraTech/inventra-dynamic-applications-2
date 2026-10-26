import SearchField from "../../ui/SearchField";
import type { RequisitionListFilters } from "../../../types/requisitions";

interface RequisitionFiltersProps {
    value: RequisitionListFilters;
    onChange: (value: RequisitionListFilters) => void;
    resultCount: number;
}

const selectClassName = "min-h-12 min-w-0 w-full rounded-xl border border-history-border bg-surface px-4 text-sm font-medium text-ink shadow-history-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export default function RequisitionFilters({ value, onChange, resultCount }: RequisitionFiltersProps) {
    return (
        <form className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-[minmax(20rem,1fr)_15rem_14rem_auto]" role="search" aria-label="Filtrar requisições" onSubmit={(event) => event.preventDefault()}>
            <SearchField
                label="Buscar por número, solicitante ou produto"
                placeholder="Buscar por número, solicitante ou produto"
                value={value.search}
                onChange={(event) => onChange({ ...value, search: event.target.value })}
                className="col-span-2 min-h-12 rounded-xl border border-history-border bg-surface shadow-history-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus xl:col-span-1"
            />
            <label className="min-w-0">
                <span className="sr-only">Filtrar por status</span>
                <select
                    aria-label="Filtrar por status"
                    className={selectClassName}
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
            <label className="min-w-0">
                <span className="sr-only">Filtrar por tipo</span>
                <select
                    aria-label="Filtrar por tipo"
                    className={selectClassName}
                    value={value.type}
                    onChange={(event) => onChange({ ...value, type: event.target.value as RequisitionListFilters["type"] })}
                >
                    <option value="ALL">Todos os tipos</option>
                    <option value="PURCHASE">Compra</option>
                    <option value="CONSUMPTION">Consumo</option>
                    <option value="TRANSFER">Transferência</option>
                </select>
            </label>
            <p className="col-span-2 self-center text-right text-xs text-history-muted xl:col-span-1">{resultCount} {resultCount === 1 ? "requisição" : "requisições"}</p>
        </form>
    );
}
