import { useId, useMemo, useState, type ReactNode } from "react";
import type { ChartDatum, DashboardResource } from "../../../types/dashboard";
import { dashboardNumber } from "../../../utils/dashboardAggregations";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";

export const panelClass = "min-w-0 rounded-3xl border border-history-border bg-surface p-4 shadow-history-card sm:p-6";

export function Metric({ title, value, note, featured = false, pending = false }: { title: string; value: ReactNode; note: string; featured?: boolean; pending?: boolean }) {
    return <div className={`${panelClass} text-ink ${featured ? "border-b-4 border-b-login-gold" : ""}`}>
        <dt className="text-sm font-semibold text-history-muted">{title}</dt>
        <dd className="mt-3 text-2xl font-bold leading-tight wrap-anywhere sm:text-3xl">{pending ? <span className="text-base font-normal">Carregando…</span> : value ?? "Indisponível"}</dd>
        <dd className="mt-2 text-xs leading-relaxed text-history-muted">{note}</dd>
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

export function EmptyChart() { return <p className="grid min-h-40 place-content-center text-center text-sm text-history-muted">Nenhum registro para esta análise e os filtros selecionados.</p>; }

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

export function DonutChart({ data }: { data: ChartDatum[] }) {
    if (!data.length) return <EmptyChart />;
    const total = data.reduce((sum, row) => sum + row.value, 0);
    return <div className="flex min-w-0 flex-wrap items-center justify-center gap-5">
        <svg className="size-40 max-w-full shrink-0" viewBox="0 0 42 42" aria-hidden="true">
            <circle cx="21" cy="21" r="15.9155" fill="none" strokeWidth="6" className="stroke-history-card-header" />
            {data.map((row, index) => {
                const share = total ? row.value / total * 100 : 0;
                const start = total ? data.slice(0, index).reduce((sum, item) => sum + item.value, 0) / total * 100 : 0;
                return <circle key={row.key} cx="21" cy="21" r="15.9155" fill="none" strokeWidth="6" stroke={chartColor(row.key, index)} strokeDasharray={`${share} ${100 - share}`} strokeDashoffset={25 - start} />;
            })}
        </svg>
        <ul className="grid min-w-0 flex-1 gap-3 text-sm" aria-label="Valores do gráfico de distribuição">{data.map((row, index) => <li key={row.key} className="flex min-w-0 flex-wrap items-center gap-2"><svg className="size-3 shrink-0" viewBox="0 0 10 10" aria-hidden="true"><rect width="10" height="10" fill={chartColor(row.key, index)} /></svg><span className="min-w-0 flex-1 text-ink">{row.label}</span><strong className="text-ink">{dashboardNumber(row.value)}</strong><span className="text-history-muted">({dashboardNumber(total ? row.value / total * 100 : 0)}%)</span></li>)}</ul>
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
    return <>
        <p className="text-xs text-history-muted">Preço de referência (R$): 0 a {dashboardNumber(maxY)}</p>
        <svg className="h-52 w-full text-heading" viewBox="0 0 400 200" aria-hidden="true">
            {[20, 100, 180].map(y => <line key={y} x1="20" x2="380" y1={y} y2={y} className="stroke-history-border" />)}
            {data.map(row => <circle key={row.key} cx={20 + row.x / maxX * 360} cy={180 - row.y / maxY * 160} r="5" fill="currentColor" fillOpacity="0.75" />)}
        </svg>
        <p className="text-center text-xs text-history-muted">Prazo de entrega: 0 a {dashboardNumber(maxX)} dias</p>
        <p className="mt-3 text-xs text-history-muted">Cada ponto representa uma relação de produto e fornecedor. Consulte os valores na tabela de detalhamento.</p>
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
