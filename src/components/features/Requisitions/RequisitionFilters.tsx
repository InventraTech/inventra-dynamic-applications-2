import SearchField from "../../ui/SearchField";
import type { RequisitionListFilters } from "../../../types/requisitions";

interface RequisitionFiltersProps {
    value: RequisitionListFilters;
    onChange: (value: RequisitionListFilters) => void;
    resultCount: number;
}

const selectClassName = "min-h-10 min-w-0 w-full rounded-full border border-history-border bg-surface px-3 font-k2d text-sm text-sidebar-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export default function RequisitionFilters({ value, onChange, resultCount }: RequisitionFiltersProps) {
    return (
        <form className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12" role="search" aria-label="Filtrar requisições" onSubmit={(event) => event.preventDefault()}>
            <SearchField
                label="Buscar por número, solicitante ou produto"
                placeholder="Buscar por número, solicitante ou produto"
                value={value.search}
                onChange={(event) => onChange({ ...value, search: event.target.value })}
                className="w-full shadow-history-card sm:col-span-2 xl:col-span-6"
            />
            <label className="min-w-0 xl:col-span-2">
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
            <label className="min-w-0 xl:col-span-2">
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
            <p className="m-0 self-center text-right font-k2d text-sm text-history-muted sm:col-span-2 xl:col-span-2">{resultCount} {resultCount === 1 ? "requisição" : "requisições"}</p>
        </form>
    );
}
