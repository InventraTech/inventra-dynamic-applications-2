import { useId, useMemo, useState, type ReactNode } from "react";
import type { ChartDatum, DashboardInventoryDivergence, DashboardResource, DashboardStackedDatum, DashboardStockCoverage } from "../../../types/dashboard";
import { dashboardMoney, dashboardNumber } from "../../../utils/dashboardAggregations";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";

export const panelClass = "min-w-0 rounded-3xl border border-history-border bg-surface p-4 shadow-history-card sm:p-6";

export function Metric({ title, value, note, featured = false, pending = false, tone, icon }: { title: string; value: ReactNode; note: string; featured?: boolean; pending?: boolean; tone?: "brand" | "warning" | "success" | "danger"; icon?: string }) {
    const accent = tone ?? (featured ? "brand" : null);
    const accentClasses = {
        brand: "border-l-4 border-l-brand",
        warning: "border-l-4 border-l-history-status-observation-text",
        success: "border-l-4 border-l-feedback-success",
        danger: "border-l-4 border-l-feedback-error",
    };
    const iconBackground = {
        brand: "bg-sidebar-active",
        warning: "bg-history-status-observation-bg",
        success: "bg-feedback-success-bg",
        danger: "bg-feedback-error-bg",
    };
    return <div className={`${panelClass} flex min-h-36 flex-col text-ink ${accent ? accentClasses[accent] : ""}`}>
        <div className="flex min-w-0 items-start justify-between gap-3">
            <dt className="min-w-0 pt-1 text-sm font-semibold leading-snug text-history-muted">{title}</dt>
            {icon && <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${accent ? iconBackground[accent] : "bg-sidebar-active"}`} aria-hidden="true"><img className="size-5" src={icon} alt="" /></span>}
        </div>
        <dd className="mt-2 text-2xl font-bold leading-tight wrap-anywhere sm:text-3xl">{pending ? <span className="text-base font-normal">Carregando…</span> : value ?? "Indisponível"}</dd>
        <dd className="mt-auto pt-3 text-xs leading-relaxed text-history-muted">{note}</dd>
    </div>;
}

export function ResourceMessage({ resource, onRetry, label }: { resource: Pick<DashboardResource<unknown>, "loading" | "error" | "data">; onRetry: () => void; label: string }) {
    if (resource.error) return <div className="grid gap-3 py-6"><Feedback severity="error">Não foi possível carregar {label}. {resource.error}</Feedback><Button variant="outline" onClick={onRetry}>Tentar novamente</Button></div>;
    return <div className="grid min-h-40 place-content-center gap-3 py-6" aria-busy={resource.loading}>
        <p className="text-sm text-history-muted">{resource.loading ? `Carregando ${label}…` : "Dados indisponíveis no momento."}</p>
        {resource.loading && <div className="h-3 rounded-full bg-sidebar-active motion-safe:animate-pulse" aria-hidden="true" />}
    </div>;
}

export function ChartCard({ title, description, children, ready = true, loading = false, error = null, onRetry }: { title: string; description?: string; children: ReactNode; ready?: boolean; loading?: boolean; error?: string | null; onRetry: () => void }) {
    const id = useId();
    return <section className={panelClass} aria-labelledby={id}>
        <h3 id={id} className="text-base font-bold text-heading sm:text-lg">{title}</h3>
        {description && <p className="mt-1 text-xs leading-relaxed text-history-muted">{description}</p>}
        <div className="mt-5">{ready ? children : <ResourceMessage label={title.toLocaleLowerCase("pt-BR")} resource={{ loading, error, data: null }} onRetry={onRetry} />}</div>
    </section>;
}

export function EmptyChart({ message = "Nenhum registro para esta análise e os filtros selecionados." }: { message?: string } = {}) { return <p className="grid min-h-40 place-content-center text-center text-sm text-history-muted">{message}</p>; }

const palette = ["var(--color-heading)", "var(--color-feedback-success)", "var(--color-feedback-error)", "var(--color-history-muted)", "var(--color-history-status-observation-text)", "var(--color-feedback-info)"];
function chartColor(key: string, index: number) {
    if (["CRITICAL", "EXPIRED", "REJECTED"].includes(key)) return "var(--color-feedback-error)";
    if (key === "HIGH") return "var(--color-history-status-observation-text)";
    if (["ACTIVE", "APPROVED", "CLOSED"].includes(key)) return "var(--color-feedback-success)";
    if (["LOW", "WRITTEN_OFF", "CANCELLED", "DRAFT"].includes(key)) return "var(--color-history-muted)";
    if (["MEDIUM", "UNDER_REVIEW", "OPEN"].includes(key)) return "var(--color-feedback-info)";
    return palette[index % palette.length];
}

export function BarChart({ data, format = dashboardNumber, onSelect, selected }: { data: ChartDatum[]; format?: (value: number) => string; onSelect?: (key: string) => void; selected?: string }) {
    if (!data.length) return <EmptyChart />;
    const max = Math.max(...data.map(row => Math.abs(row.value)), 1);
    return <ul className="grid gap-3" aria-label="Valores do gráfico de barras">{data.map((row, index) => <li key={row.key} className="min-w-0">
        <div className="mb-1 flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
            {onSelect ? <Button variant="link" className="min-h-11 min-w-0 text-left text-heading" aria-pressed={selected === row.key} onClick={() => onSelect(row.key)}>{row.label}</Button> : <span className="min-w-0 text-ink">{row.label}</span>}
            <span className="font-bold text-ink">{format(row.value)}</span>
        </div>
        <svg className="h-2.5 w-full overflow-visible" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="4" rx="2" className="fill-history-card-header" /><rect width={Math.abs(row.value) / max * 100} height="4" rx="2" fill={chartColor(row.key, index)} /></svg>
    </li>)}</ul>;
}

export function StackedBarChart({ data }: { data: DashboardStackedDatum[] }) {
    if (!data.length) return <EmptyChart />;
    const totalFor = (row: DashboardStackedDatum) => row.segments.reduce((sum, segment) => sum + segment.value, 0);
    const statuses = [...new Map<string, ChartDatum>(data.flatMap(row => row.segments.filter(segment => segment.value > 0).map(segment => [segment.key, segment] as const))).values()];
    const paletteIndex = new Map<string, number>(statuses.map((status, index) => [status.key, index] as const));
    return <ul className="grid gap-4" aria-label="Requisições por tipo e situação">
        {data.map(row => {
            const total = totalFor(row);
            return <li key={row.key} className="grid min-w-0 gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm"><span className="font-semibold text-ink">{row.label}</span><span className="text-history-muted">{dashboardNumber(total)} {total === 1 ? "requisição" : "requisições"}</span></div>
                <div className="flex h-5 min-w-0 overflow-hidden rounded-full bg-history-card-header" aria-hidden="true">
                    {row.segments.filter(segment => segment.value > 0).map(segment => <span key={segment.key} className="h-full border-r border-surface last:border-0" style={{ width: `${segment.value / total * 100}%`, backgroundColor: chartColor(segment.key, paletteIndex.get(segment.key) ?? 0) }} />)}
                </div>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-history-muted" aria-label={`Situações em ${row.label}`}>
                    {row.segments.filter(segment => segment.value > 0).map(segment => <li key={segment.key} className="inline-flex items-center gap-1.5"><span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: chartColor(segment.key, paletteIndex.get(segment.key) ?? 0) }} aria-hidden="true" />{segment.label}: <strong className="text-ink">{dashboardNumber(segment.value)}</strong></li>)}
                </ul>
            </li>;
        })}
    </ul>;
}

export function StockCoverageChart({ data }: { data: DashboardStockCoverage[] }) {
    if (!data.length) return <p className="grid min-h-40 place-content-center text-center text-sm text-history-muted">Nenhum produto desta seleção tem estoque mínimo definido para comparação.</p>;
    const visible = data.slice(0, 8);
    const scaleMax = Math.min(Math.max(150, ...visible.map(row => row.percent)), 300);
    const targetPosition = 100 / scaleMax * 100;
    return <div className="grid gap-4">
        <p className="text-xs leading-relaxed text-history-muted">Cada barra compara um produto com o próprio mínimo cadastrado. A marca vertical indica 100%; produtos com unidades diferentes não são somados.</p>
        <ul className="grid gap-4" aria-label="Saldo de cada produto comparado ao mínimo">
            {visible.map(row => <li key={row.key} className="grid min-w-0 gap-2">
                <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                    <span className="min-w-0 flex-1 font-semibold text-ink">{row.label}</span>
                    <span className="shrink-0 font-semibold text-ink">{dashboardNumber(row.quantity)} / {dashboardNumber(row.minimum)} {row.unit} <span className="font-normal text-history-muted">({dashboardNumber(row.percent)}% do mínimo)</span></span>
                </div>
                <div className="relative h-3 rounded-full bg-history-card-header" aria-hidden="true">
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(row.percent, scaleMax) / scaleMax * 100}%`, backgroundColor: row.percent < 100 ? "var(--color-feedback-error)" : "var(--color-feedback-success)" }} />
                    <span className="absolute -top-1 h-5 w-0.5 bg-heading" style={{ left: `${targetPosition}%` }} />
                </div>
                <span className={`text-xs font-semibold ${row.percent < 100 ? "text-feedback-error" : "text-feedback-success"}`}>{row.percent < 100 ? "Abaixo do mínimo" : "No mínimo ou acima"}</span>
            </li>)}
        </ul>
        {data.length > visible.length && <p className="text-xs text-history-muted">Exibindo os {visible.length} produtos com menor cobertura; a tabela de estoque contém a lista completa.</p>}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-history-border pt-3 text-xs text-history-muted"><span>0% do mínimo</span><span className="font-semibold text-heading">│ 100% · mínimo</span><span>{dashboardNumber(scaleMax)}% ou mais</span></div>
    </div>;
}

export function CategoryConcentrationChart({ data, format = dashboardMoney, onSelect, selected }: { data: ChartDatum[]; format?: (value: number) => string; onSelect?: (key: string) => void; selected?: string }) {
    const categories = data.filter(category => Number.isFinite(category.value) && category.value > 0);
    if (!categories.length) return <EmptyChart message="Não há lotes com saldo positivo e preço conhecido para esta seleção." />;

    const total = categories.reduce((sum, category) => sum + category.value, 0);
    const maximum = categories[0].value;
    const leaderShare = categories[0].value / total * 100;

    return <div className="grid min-w-0 gap-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl bg-history-card-header p-4 sm:px-5">
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">Maior concentração</p>
                <p className="mt-1 truncate text-base font-bold text-heading sm:text-lg">{categories[0].label}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-baseline gap-x-5 gap-y-1">
                <strong className="text-lg font-bold text-heading sm:text-xl">{format(categories[0].value)}</strong>
                <span className="text-sm font-semibold text-brand">{dashboardNumber(leaderShare)}% do total conhecido</span>
            </div>
        </div>

        <p className="text-xs leading-relaxed text-history-muted">A barra compara cada categoria com a de maior valor. O percentual mostra quanto ela representa do valor conhecido em estoque; categorias sem preço informado ficam fora deste cálculo.</p>

        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(12rem,2fr)_minmax(7rem,auto)] gap-4 px-3 text-xs font-semibold text-history-muted lg:grid">
            <span>Categoria e valor</span>
            <span>Comparação com a maior categoria</span>
            <span className="text-right">Participação no total</span>
        </div>
        <ul className="grid min-w-0 gap-2" aria-label="Comparação do valor em estoque por categoria">
            {categories.map((category, index) => {
                const share = category.value / total * 100;
                const relativeValue = category.value / maximum * 100;
                const rowContent = <span className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,2fr)_minmax(7rem,auto)] lg:gap-4">
                    <span className="col-start-1 row-start-1 flex min-w-0 items-center gap-3">
                        <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${index === 0 ? "bg-brand text-on-brand" : "bg-sidebar-active text-brand"}`} aria-hidden="true">{index + 1}</span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-heading">{category.label}</span>
                            <span className="block text-xs font-normal text-history-muted">{format(category.value)}</span>
                        </span>
                    </span>
                    <span className="col-span-2 row-start-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:col-span-1 lg:col-start-2 lg:row-start-auto">
                        <span className="h-3 min-w-0 overflow-hidden rounded-full bg-history-card-header" aria-hidden="true">
                            <span className={`block h-full rounded-full ${index === 0 ? "bg-brand-strong" : "bg-brand"}`} style={{ width: `${relativeValue}%` }} />
                        </span>
                        <span className="text-xs tabular-nums text-history-muted">{dashboardNumber(relativeValue)}%</span>
                    </span>
                    <span className="col-start-2 row-start-1 justify-self-end text-sm font-bold tabular-nums text-heading lg:col-start-3 lg:row-start-auto">{dashboardNumber(share)}%</span>
                </span>;

                return <li key={category.key} className="min-w-0">
                    {onSelect ? <Button variant="ghost" className={`min-h-18 w-full min-w-0 justify-start rounded-2xl border px-3 py-3 text-left transition-colors sm:px-4 ${selected === category.key ? "border-brand bg-sidebar-active" : "border-history-border bg-surface hover:bg-history-card-header"}`} aria-pressed={selected === category.key} onClick={() => onSelect(category.key)}>
                        {rowContent}
                    </Button> : <div className="flex min-h-18 min-w-0 items-center rounded-2xl border border-history-border bg-surface px-3 py-3 sm:px-4">
                        {rowContent}
                    </div>}
                </li>;
            })}
        </ul>
    </div>;
}

export function DivergingBarChart({ data }: { data: DashboardInventoryDivergence[] }) {
    if (!data.length) return <EmptyChart />;
    const visible = data.slice(0, 8);
    const maxValue = Math.max(...visible.flatMap(row => [row.shortage, row.surplus]), 1);
    return <div className="grid gap-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-history-muted"><span><span className="mr-1.5 inline-block size-2.5 rounded-sm bg-feedback-error align-middle" aria-hidden="true" />Faltou</span><span><span className="mr-1.5 inline-block size-2.5 rounded-sm bg-feedback-success align-middle" aria-hidden="true" />Sobrou</span></div>
        <ul className="grid gap-4" aria-label="Faltas e sobras separadas por inventário e unidade">
            {visible.map(row => <li key={row.key} className="grid min-w-0 gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm"><span className="font-semibold text-ink">{row.label} · {row.unit}</span><span className="text-xs text-history-muted">As quantidades não são compensadas entre si</span></div>
                <div className="flex items-center gap-2" aria-hidden="true">
                    <div className="flex h-3 flex-1 justify-end rounded-l-full bg-history-card-header"><span className="h-full rounded-l-full bg-feedback-error" style={{ width: `${row.shortage / maxValue * 100}%` }} /></div>
                    <span className="h-5 w-px shrink-0 bg-history-border" />
                    <div className="flex h-3 flex-1 rounded-r-full bg-history-card-header"><span className="h-full rounded-r-full bg-feedback-success" style={{ width: `${row.surplus / maxValue * 100}%` }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs"><span className="font-semibold text-feedback-error">Faltou: {dashboardNumber(row.shortage)} {row.unit}</span><span className="text-right font-semibold text-feedback-success">Sobrou: {dashboardNumber(row.surplus)} {row.unit}</span></div>
            </li>)}
        </ul>
        {data.length > visible.length && <p className="text-xs text-history-muted">Exibindo os {visible.length} inventários com maior divergência total; a tabela abaixo contém todos os registros.</p>}
    </div>;
}

export function DonutChart({ data }: { data: ChartDatum[] }) {
    if (!data.length) return <EmptyChart />;
    const total = data.reduce((sum, row) => sum + row.value, 0);
    return <div className="grid min-w-0 items-center gap-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
        <svg className="size-36 justify-self-center sm:size-40" viewBox="0 0 42 42" aria-hidden="true">
            <circle cx="21" cy="21" r="15.9155" fill="none" strokeWidth="6" className="stroke-history-card-header" />
            {data.map((row, index) => {
                const share = total ? row.value / total * 100 : 0;
                const start = total ? data.slice(0, index).reduce((sum, item) => sum + item.value, 0) / total * 100 : 0;
                return <circle key={row.key} cx="21" cy="21" r="15.9155" fill="none" strokeWidth="6" stroke={chartColor(row.key, index)} strokeDasharray={`${share} ${100 - share}`} strokeDashoffset={25 - start} />;
            })}
        </svg>
        <ul className="grid min-w-0 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3" aria-label="Valores do gráfico de distribuição">{data.map((row, index) => <li key={row.key} className="flex min-w-0 flex-wrap items-center gap-2"><svg className="size-3 shrink-0" viewBox="0 0 10 10" aria-hidden="true"><rect width="10" height="10" fill={chartColor(row.key, index)} /></svg><span className="min-w-0 flex-1 text-ink">{row.label}</span><strong className="text-ink">{dashboardNumber(row.value)}</strong><span className="text-history-muted">({dashboardNumber(total ? row.value / total * 100 : 0)}%)</span></li>)}</ul>
    </div>;
}

export function LineChart({ data }: { data: ChartDatum[] }) {
    if (!data.length) return <EmptyChart />;
    const max = Math.max(...data.map(row => row.value), 1);
    const point = (row: ChartDatum, index: number) => [24 + index / Math.max(data.length - 1, 1) * 352, 160 - row.value / max * 136];
    return <>
        <svg className="h-48 w-full text-heading" viewBox="0 0 400 184" aria-hidden="true">
            {[24, 92, 160].map(y => <line key={y} x1="24" x2="376" y1={y} y2={y} className="stroke-history-border" />)}
            <polyline points={data.map((row, index) => point(row, index).join(",")).join(" ")} fill="none" stroke="currentColor" strokeWidth="3" />
            {data.map((row, index) => { const [x, y] = point(row, index); return <circle key={row.key} cx={x} cy={y} r="4" fill="currentColor" />; })}
        </svg>
        <div className="flex flex-wrap justify-between gap-2 text-xs text-history-muted"><span>{data[0].label}</span><span>{data.at(-1)?.label}</span></div>
        <details className="mt-4 text-sm text-ink"><summary className="min-h-11 cursor-pointer py-3 font-semibold text-heading">Ver valores por mês</summary><dl className="grid gap-2">{data.map(row => <div key={row.key} className="flex flex-wrap justify-between gap-2 border-b border-history-border py-2"><dt>{row.label}</dt><dd className="font-bold">{dashboardNumber(row.value)}</dd></div>)}</dl></details>
    </>;
}

export function ScatterChart({ data }: { data: { key: string; label: string; x: number; y: number }[] }) {
    if (!data.length) return <EmptyChart />;
    const maxX = Math.max(...data.map(row => row.x), 1);
    const maxY = Math.max(...data.map(row => row.y), 1);
    const halfX = maxX / 2;
    const halfY = maxY / 2;
    return <>
        <p className="text-xs leading-relaxed text-history-muted">Cada ponto compara uma relação produto–fornecedor. Eixo horizontal: prazo de entrega, em dias. Eixo vertical: preço de referência, em reais.</p>
        <div className="mt-3 flex min-w-0 gap-2">
            <div className="flex w-20 shrink-0 flex-col justify-between py-2 text-xs text-history-muted" aria-hidden="true"><span>{dashboardMoney(maxY)}</span><span>{dashboardMoney(halfY)}</span><span>{dashboardMoney(0)}</span></div>
            <svg className="h-48 min-w-0 flex-1 text-heading sm:h-56" viewBox="0 0 400 200" aria-hidden="true">
                {[20, 100, 180].map(y => <line key={y} x1="32" x2="388" y1={y} y2={y} className="stroke-history-border" />)}
                {[32, 210, 388].map(x => <line key={x} x1={x} x2={x} y1="20" y2="180" className="stroke-history-border" />)}
                {data.map(row => <circle key={row.key} cx={32 + row.x / maxX * 356} cy={180 - row.y / maxY * 160} r="5" fill="currentColor" fillOpacity="0.75" />)}
            </svg>
        </div>
        <div className="ml-20 flex justify-between text-xs text-history-muted" aria-hidden="true"><span>0 dias</span><span>{dashboardNumber(halfX)} dias</span><span>{dashboardNumber(maxX)} dias</span></div>
        <details className="mt-3 text-sm text-ink"><summary className="min-h-11 cursor-pointer py-3 font-semibold text-heading">Ver valores dos pontos ({data.length})</summary><ul className="grid gap-2">{data.map(row => <li key={row.key} className="border-b border-history-border py-2"><strong className="block">{row.label}</strong><span className="text-history-muted">Prazo: {dashboardNumber(row.x)} dias · Preço: {dashboardMoney(row.y)}</span></li>)}</ul></details>
    </>;
}

export interface TableColumn<T> { key: string; title: string; render: (row: T) => ReactNode; sort?: (row: T) => string | number }

export function DashboardTable<T>({ title, data, columns, rowKey }: { title: string; data: T[]; columns: TableColumn<T>[]; rowKey: (row: T) => string | number }) {
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState<{ key: string; descending: boolean } | null>(null);
    const sorted = useMemo(() => {
        const column = columns.find(item => item.key === sort?.key);
        if (!column?.sort) return data;
        const getValue = column.sort;
        return [...data].sort((a, b) => {
            const left = getValue(a); const right = getValue(b);
            const comparison = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right), "pt-BR", { numeric: true });
            return sort?.descending ? -comparison : comparison;
        });
    }, [data, columns, sort]);
    const lastPage = Math.max(0, Math.ceil(sorted.length / 10) - 1);
    const currentPage = Math.min(page, lastPage);
    if (!data.length) return <EmptyChart />;
    return <>
        <div className="relative max-w-full overflow-x-auto rounded-xl border border-history-border" role="region" aria-label={`${title}: tabela com rolagem horizontal`} tabIndex={0}>
            <table className="w-full min-w-160 border-collapse text-left text-sm text-ink">
                <caption className="sr-only">{title}</caption>
                <thead className="bg-history-card-header text-heading"><tr>{columns.map(column => <th key={column.key} scope="col" className="px-3 py-2 font-semibold" aria-sort={sort?.key === column.key ? sort.descending ? "descending" : "ascending" : column.sort ? "none" : undefined}>
                    {column.sort ? <Button variant="ghost" className="min-h-11 text-left" onClick={() => { setSort({ key: column.key, descending: sort?.key === column.key ? !sort.descending : false }); setPage(0); }}>{column.title}<span aria-hidden="true">{sort?.key === column.key ? sort.descending ? " ↓" : " ↑" : " ↕"}</span><span className="sr-only">, ordenar</span></Button> : column.title}
                </th>)}</tr></thead>
                <tbody>{sorted.slice(currentPage * 10, currentPage * 10 + 10).map(row => <tr key={rowKey(row)} className="border-t border-history-border">{columns.map(column => <td key={column.key} className="px-3 py-3 align-top">{column.render(row)}</td>)}</tr>)}</tbody>
            </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-history-muted">
            <p role="status">{currentPage * 10 + 1}–{Math.min(currentPage * 10 + 10, sorted.length)} de {sorted.length} registros</p>
            <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label={`Página anterior de ${title}`}>Anterior</Button><Button variant="outline" disabled={currentPage === lastPage} onClick={() => setPage(currentPage + 1)} aria-label={`Próxima página de ${title}`}>Próxima</Button></div>
        </div>
    </>;
}
