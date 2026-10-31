import { useId } from "react";
import type { KitchenStockItem } from "../../../types/stock";
import Button from "../../ui/Button";
import SearchField from "../../ui/SearchField";

export type StockProductStatusFilter = "ALL" | "LOW" | "AVAILABLE" | "EMPTY";

interface StockProductFiltersProps {
    products: KitchenStockItem[];
    query: string;
    categoryId: number | null;
    status: StockProductStatusFilter;
    onQueryChange: (query: string) => void;
    onCategoryChange: (categoryId: number | null) => void;
    onStatusChange: (status: StockProductStatusFilter) => void;
}

export default function StockProductFilters({ products, query, categoryId, status, onQueryChange, onCategoryChange, onStatusChange }: StockProductFiltersProps) {
    const categorySelectId = useId();
    const categories = [...new Map(products.flatMap(({ category }) => category ? [[category.id, category.name] as const] : []).map(([id, name]) => [id, { id, name }])).values()]
        .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
    const counts: Record<StockProductStatusFilter, number> = {
        ALL: products.length,
        LOW: products.filter((product) => product.lowStock).length,
        AVAILABLE: products.filter((product) => !product.lowStock && product.totalQuantity > 0).length,
        EMPTY: products.filter((product) => !product.lowStock && product.totalQuantity <= 0).length,
    };
    const options: { value: StockProductStatusFilter; label: string }[] = [
        { value: "ALL", label: "Todos" },
        { value: "LOW", label: "Abaixo do mínimo" },
        { value: "AVAILABLE", label: "Com saldo" },
        { value: "EMPTY", label: "Sem saldo" },
    ];

    return (
        <div className="grid min-w-0 gap-3">
            <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <SearchField className="w-full" variant="subtle" label="Buscar produto por nome" placeholder="Buscar produto por nome" value={query} onChange={(event) => onQueryChange(event.target.value)} />
                <label className="flex min-h-11 min-w-0 items-center gap-2 rounded-2xl border border-history-border bg-surface px-3 text-sm text-history-muted" htmlFor={categorySelectId}>
                    <span className="shrink-0">Categoria:</span>
                    <select id={categorySelectId} className="min-h-9 min-w-0 flex-1 bg-transparent font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:flex-none" value={categoryId ?? "ALL"} onChange={(event) => onCategoryChange(event.target.value === "ALL" ? null : Number(event.target.value))}>
                        <option value="ALL">Todas</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                </label>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2" role="group" aria-label="Filtrar produtos por situação">
                <span className="mr-1 text-sm font-semibold text-history-muted">Situação:</span>
                {options.map((option) => (
                    <Button key={option.value} variant="ghost" type="button" aria-pressed={status === option.value} onClick={() => onStatusChange(option.value)} className={`min-h-9 min-w-0 rounded-full border px-3 py-1.5 text-xs sm:text-sm ${status === option.value ? "border-brand bg-sidebar-active text-brand hover:bg-sidebar-active" : "border-history-border bg-surface text-ink hover:bg-history-card-header"}`}>
                        {option.label} · {counts[option.value]}
                    </Button>
                ))}
                <span className="text-xs leading-normal text-history-muted">Filtro aplicado só aos dados já carregados.</span>
            </div>
        </div>
    );
}
