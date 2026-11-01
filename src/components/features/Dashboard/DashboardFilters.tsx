import { useId, type ReactNode } from "react";
import type { DashboardFilters as Filters, DashboardProduct, DashboardTab } from "../../../types/dashboard";
import { domainLabel } from "../../../utils/dashboardAggregations";
import Button from "../../ui/Button";

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function DashboardSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
    const id = useId();
    return <div className="min-w-0"><label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-heading">{label}</label><select id={id} className="min-h-11 w-full min-w-0 max-w-full rounded-xl border border-history-border bg-history-card-header px-3 py-2 text-sm text-ink" value={value} onChange={event => onChange(event.target.value)} aria-describedby="dashboard-filter-help">{children}</select></div>;
}

export default function DashboardFilters({ filters, tab, products, dates, alertTypes, onChange, onClear }: { filters: Filters; tab: DashboardTab; products: DashboardProduct[]; dates: string[]; alertTypes: string[]; onChange: (key: keyof Filters, value: string) => void; onClear: () => void }) {
    const categories = [...new Map(products.map(product => [String(product.category?.id ?? "uncategorized"), { id: String(product.category?.id ?? "uncategorized"), name: product.category?.name ?? "Sem categoria" }])).values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    const units = [...new Map(products.map(product => [product.unit.id, product.unit])).values()];
    const years = [...new Set(dates.map(date => date.slice(0, 4)).filter(year => /^\d{4}$/.test(year)))].sort().reverse();
    const productOptions = products.filter(product => (!filters.category || String(product.category?.id ?? "uncategorized") === filters.category) && (!filters.unit || String(product.unit.id) === filters.unit));
    function domainSelect(label: string, key: keyof Filters, values: string[]) {
        return <DashboardSelect label={label} value={filters[key]} onChange={value => onChange(key, value)}><option value="">Todos</option>{values.map(value => <option key={value} value={value}>{domainLabel(value)}</option>)}</DashboardSelect>;
    }
    const activeCount = Object.values(filters).filter(Boolean).length;
    return <section className="min-w-0 overflow-hidden rounded-3xl border border-history-border bg-surface shadow-history-card" aria-labelledby="dashboard-filter-title">
        <details className="group">
            <summary className="flex min-h-16 cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded-3xl px-4 py-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:px-6">
                <span className="min-w-0">
                    <span id="dashboard-filter-title" className="block text-base font-bold text-heading">Filtros</span>
                    <span className="mt-1 block text-xs leading-relaxed text-history-muted">Categoria, produto, período e situação; filtros ativos permanecem ao trocar de área.</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activeCount ? "bg-sidebar-active text-brand-strong" : "bg-history-card-header text-history-muted"}`}>{activeCount ? `${activeCount} ${activeCount === 1 ? "filtro ativo" : "filtros ativos"}` : "Opcional"}</span>
                    <span className="text-lg leading-none text-brand transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
                </span>
            </summary>
            <div className="grid gap-4 border-t border-history-border px-4 pb-5 pt-4 sm:px-6">
                <p id="dashboard-filter-help" className="text-xs leading-relaxed text-history-muted">O período considera a entrada do lote, a criação da requisição ou do alerta e o início do inventário. Os saldos exibidos são atuais; o filtro não reconstitui saldos passados.</p>
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-5 large-text:grid-cols-1">
                    <DashboardSelect label="Categoria" value={filters.category} onChange={value => onChange("category", value)}><option value="">Todas as categorias</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</DashboardSelect>
                    <DashboardSelect label="Produto" value={filters.product} onChange={value => onChange("product", value)}><option value="">Todos os produtos</option>{productOptions.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</DashboardSelect>
                    <DashboardSelect label="Unidade" value={filters.unit} onChange={value => onChange("unit", value)}><option value="">Todas as unidades</option>{units.map(unit => <option key={unit.id} value={unit.id}>{unit.symbol}</option>)}</DashboardSelect>
                    <DashboardSelect label="Ano" value={filters.year} onChange={value => onChange("year", value)}><option value="">Todos os anos</option>{years.map(year => <option key={year} value={year}>{year}</option>)}</DashboardSelect>
                    <DashboardSelect label="Mês" value={filters.month} onChange={value => onChange("month", value)}><option value="">Todos os meses</option>{monthNames.map((month, index) => <option key={month} value={String(index + 1).padStart(2, "0")}>{month}</option>)}</DashboardSelect>
                    {tab === "stock" && domainSelect("Status do lote", "batchStatus", ["ACTIVE", "WRITTEN_OFF", "EXPIRED", "CANCELLED"])}
                    {tab === "purchases" && <>{domainSelect("Status da requisição", "requisitionStatus", ["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"])}{domainSelect("Tipo da requisição", "requisitionType", ["PURCHASE", "TRANSFER", "CONSUMPTION"])}</>}
                    {tab === "control" && <>{domainSelect("Status do inventário", "inventoryStatus", ["OPEN", "CLOSED", "CANCELLED"])}{domainSelect("Severidade do alerta", "severity", ["CRITICAL", "HIGH", "MEDIUM", "LOW"])}{domainSelect("Tipo do alerta", "alertType", alertTypes)}</>}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-history-border pt-3">
                    <p className="text-xs text-history-muted">A busca da barra superior também filtra os dados do painel.</p>
                    <Button variant="outline" disabled={!activeCount} onClick={onClear}>Limpar filtros</Button>
                </div>
            </div>
        </details>
    </section>;
}
