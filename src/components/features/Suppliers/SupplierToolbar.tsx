import type { SupplierStatusFilter } from "../../../types/suppliers";
import Button from "../../ui/Button";
import SearchField from "../../ui/SearchField";

interface SupplierToolbarProps {
    query: string;
    onQueryChange: (value: string) => void;
    filter: SupplierStatusFilter;
    onFilterChange: (filter: SupplierStatusFilter) => void;
    activeCount: number;
    inactiveCount: number;
    canSeeInactive: boolean;
}

function SupplierToolbar({ query, onQueryChange, filter, onFilterChange, activeCount, inactiveCount, canSeeInactive }: SupplierToolbarProps) {
    const filters: { id: SupplierStatusFilter; label: string; count: number }[] = [
        { id: "all", label: "Todos", count: activeCount + inactiveCount },
        { id: "active", label: "Ativos", count: activeCount },
        ...(canSeeInactive ? [{ id: "inactive" as const, label: "Inativos", count: inactiveCount }] : []),
    ];

    return (
        <div className="grid min-w-0 gap-3">
            <SearchField
                label="Buscar fornecedor por razão social, CNPJ ou contato"
                variant="subtle"
                className="min-h-12 w-full rounded-2xl bg-surface px-4"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Buscar por razão social, CNPJ ou contato"
                autoComplete="off"
            />
            <div className="flex min-w-0 flex-wrap items-center gap-2">
                {canSeeInactive && <span className="mr-1 text-sm font-semibold text-history-muted">Situação:</span>}
                {filters.map((item) => (
                    <Button
                        key={item.id}
                        variant="outline"
                        type="button"
                        aria-pressed={filter === item.id}
                        onClick={() => onFilterChange(item.id)}
                        className={`min-h-9 rounded-full px-3 py-1.5 text-xs ${filter === item.id ? "border-brand bg-sidebar-active text-sidebar-purple" : "border-history-border bg-surface text-sidebar-text"}`}
                    >
                        {item.label} · {item.count}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default SupplierToolbar;
