import { useId, useMemo, useState, type ReactNode } from "react";
import type { ChartDatum, DashboardInventoryDivergence, DashboardResource, DashboardStackedDatum, DashboardStockCoverage, DashboardTreemapGroup } from "../../../types/dashboard";
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

interface TreemapRect extends ChartDatum {
    x: number;
    y: number;
    width: number;
    height: number;
}

function worstTreemapRatio(items: ChartDatum[], side: number): number {
    if (!items.length || side <= 0) return Number.POSITIVE_INFINITY;
    const sum = items.reduce((total, item) => total + item.value, 0);
    const largest = Math.max(...items.map(item => item.value));
    const smallest = Math.min(...items.map(item => item.value));
    return Math.max((side ** 2 * largest) / (sum ** 2), (sum ** 2) / (side ** 2 * smallest));
}

function layoutTreemap(items: ChartDatum[], bounds: Pick<TreemapRect, "x" | "y" | "width" | "height">): TreemapRect[] {
    const remaining = items.filter(item => Number.isFinite(item.value) && item.value > 0).sort((left, right) => right.value - left.value);
    const layout: TreemapRect[] = [];
    let free = { ...bounds };
    let row: ChartDatum[] = [];

    const placeRow = () => {
        if (!row.length) return;
        const rowValue = row.reduce((total, item) => total + item.value, 0);
        const unplacedValue = rowValue + remaining.reduce((total, item) => total + item.value, 0);
        const rowArea = (rowValue / unplacedValue) * free.width * free.height;
        if (free.width >= free.height) {
            const rowHeight = rowArea / free.width;
            let x = free.x;
            row.forEach((item, index) => {
                const width = index === row.length - 1 ? free.x + free.width - x : (item.value / rowValue) * free.width;
                layout.push({ ...item, x, y: free.y, width: Math.max(0, width), height: rowHeight });
                x += width;
            });
            free = { ...free, y: free.y + rowHeight, height: Math.max(0, free.height - rowHeight) };
        } else {
            const rowWidth = rowArea / free.height;
            let y = free.y;
            row.forEach((item, index) => {
                const height = index === row.length - 1 ? free.y + free.height - y : (item.value / rowValue) * free.height;
                layout.push({ ...item, x: free.x, y, width: rowWidth, height: Math.max(0, height) });
                y += height;
            });
            free = { ...free, x: free.x + rowWidth, width: Math.max(0, free.width - rowWidth) };
        }
        row = [];
    };

    while (remaining.length && free.width > 0 && free.height > 0) {
        const next = remaining[0];
        const side = Math.min(free.width, free.height);
        const unplacedValue = row.reduce((total, item) => total + item.value, 0) + remaining.reduce((total, item) => total + item.value, 0);
        const areaScale = (free.width * free.height) / unplacedValue;
        const scaledRow = row.map(item => ({ ...item, value: item.value * areaScale }));
        const scaledNext = { ...next, value: next.value * areaScale };
        if (!row.length || worstTreemapRatio([...scaledRow, scaledNext], side) <= worstTreemapRatio(scaledRow, side)) row.push(remaining.shift()!);
        else placeRow();
    }
    placeRow();
    return layout;
}

const treemapPalette = [
    { background: "var(--color-brand-strong)", foreground: "var(--color-on-brand)" },
    { background: "var(--color-brand)", foreground: "var(--color-on-brand)" },
    { background: "var(--color-feedback-info)", foreground: "var(--color-on-brand)" },
    { background: "var(--color-history-muted)", foreground: "var(--color-on-brand)" },
    { background: "var(--color-sidebar-active)", foreground: "var(--color-heading)" },
    { background: "var(--color-history-card-header)", foreground: "var(--color-heading)" },
];

function fittedTreemapLabel(label: string, width: number): string {
    const maxCharacters = Math.max(5, Math.floor((width - 20) / 8));
    return label.length > maxCharacters ? `${label.slice(0, maxCharacters - 1).trimEnd()}…` : label;
}

export function TreemapChart({ data, format = dashboardMoney, onSelect, selected }: { data: DashboardTreemapGroup[]; format?: (value: number) => string; onSelect?: (key: string) => void; selected?: string }) {
    const chartId = useId().replaceAll(":", "");
    const groups = data.filter(group => Number.isFinite(group.value) && group.value > 0);
    if (!groups.length) return <EmptyChart message="Não há lotes com saldo positivo e preço conhecido para esta seleção." />;

    const width = 1200;
    const height = 400;
    const total = groups.reduce((sum, group) => sum + group.value, 0);
    const leadingGroup = groups[0];
    const leadingShare = leadingGroup.value / total;
    const showExpandedRemainder = groups.length > 2 && leadingShare >= 0.62 && selected !== leadingGroup.key;
    const mapGroups = showExpandedRemainder ? groups.slice(1) : groups;
    const categoryTiles = layoutTreemap(mapGroups, { x: 0, y: 0, width, height }).map(rect => {
        const group = groups.find(item => item.key === rect.key)!;
        const palette = treemapPalette[groups.findIndex(item => item.key === rect.key) % treemapPalette.length];
        const inset = 6;
        const headingHeight = rect.width >= 130 && rect.height >= 66 ? 32 : 0;
        const content = {
            x: rect.x + inset,
            y: rect.y + headingHeight + inset,
            width: Math.max(0, rect.width - inset * 2),
            height: Math.max(0, rect.height - headingHeight - inset * 2),
        };
        const items = content.width > 0 && content.height > 0
            ? layoutTreemap(group.items, content)
            : [];
        return { ...group, ...rect, color: palette.background, textColor: palette.foreground, headingHeight, items };
    });
    const leadingPalette = treemapPalette[0];

    return <div className="grid min-w-0 gap-4">
        {showExpandedRemainder && <section className="grid min-w-0 gap-3 rounded-2xl border border-history-border bg-history-card-header p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-4" aria-label="Categoria com maior participação">
            <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-xs font-semibold text-history-muted">Maior categoria</p>
                    <strong className="text-sm text-heading">{dashboardNumber(leadingShare * 100)}% do valor</strong>
                </div>
                <p className="mt-1 truncate text-base font-bold text-heading">{leadingGroup.label} <span className="font-semibold text-history-muted">· {format(leadingGroup.value)}</span></p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface" role="img" aria-label={`${leadingGroup.label} representa ${dashboardNumber(leadingShare * 100)} por cento do valor conhecido`}>
                    <span className="block h-full rounded-full" style={{ width: `${leadingShare * 100}%`, backgroundColor: leadingPalette.background }} />
                </div>
            </div>
            <p className="text-xs leading-relaxed text-history-muted sm:max-w-48">O mapa abaixo amplia as demais categorias para permitir comparar seus valores.</p>
        </section>}
        <p className="text-xs leading-relaxed text-history-muted">{showExpandedRemainder ? "Áreas ampliadas e proporcionais entre as demais categorias; os valores e percentuais da legenda continuam relativos ao total." : "Cada categoria ocupa uma área proporcional ao valor. Os blocos dentro dela representam os produtos; use a legenda para filtrar por categoria."}</p>
        <svg className="block h-auto w-full rounded-2xl" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby={`${chartId}-title`}>
            <title id={`${chartId}-title`}>{showExpandedRemainder ? "Treemap ampliado das categorias com menor participação no valor em estoque" : "Treemap do valor em estoque por categoria e produto"}</title>
            {categoryTiles.map(group => {
                const isMuted = selected && selected !== group.key;
                return <g key={group.key} opacity={isMuted ? 0.28 : 1}>
                    <rect x={group.x} y={group.y} width={group.width} height={group.height} rx="8" fill={group.color} stroke="var(--color-surface)" strokeWidth="5" />
                    {group.headingHeight > 0 && <text x={group.x + 14} y={group.y + 23} style={{ fill: group.textColor }} className="text-sm font-bold">{fittedTreemapLabel(group.label, group.width)}</text>}
                    {group.items.map(item => <g key={item.key}>
                        <title>{`${group.label} · ${item.label}: ${format(item.value)} · ${dashboardNumber(item.value / total * 100)}% do total`}</title>
                        <rect x={item.x} y={item.y} width={item.width} height={item.height} fill={group.color} stroke="var(--color-surface)" strokeWidth="4" />
                        {item.width >= 112 && item.height >= 46 && <>
                            <text x={item.x + 12} y={item.y + 21} style={{ fill: group.textColor }} className="text-sm font-semibold">{fittedTreemapLabel(item.label, item.width)}</text>
                            {item.height >= 66 && <text x={item.x + 12} y={item.y + 42} style={{ fill: group.textColor }} className="text-xs">{format(item.value)}</text>}
                        </>}
                    </g>)}
                </g>;
            })}
        </svg>
        <ul className="grid min-w-0 gap-2 sm:grid-cols-2" aria-label="Categorias e participação no valor em estoque">
            {groups.map((group, index) => {
                const palette = treemapPalette[index % treemapPalette.length];
                return <li key={group.key} className="min-w-0">
                {onSelect ? <Button variant="ghost" className={`min-h-12 w-full justify-start gap-3 rounded-xl border border-history-border px-3 py-2 text-left ${selected === group.key ? "bg-sidebar-active text-heading" : "hover:bg-history-card-header"}`} aria-pressed={selected === group.key} onClick={() => onSelect(group.key)}>
                    <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: palette.background }} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-heading">{group.label}</span>
                        <span className="block text-xs font-normal text-history-muted">{format(group.value)} · {dashboardNumber(group.value / total * 100)}% do valor</span>
                    </span>
                </Button> : <div className="flex min-h-12 min-w-0 items-center gap-3 rounded-xl border border-history-border px-3 py-2">
                    <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: palette.background }} aria-hidden="true" />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-heading">{group.label}</span><span className="block text-xs text-history-muted">{format(group.value)} · {dashboardNumber(group.value / total * 100)}% do valor</span></span>
                </div>}
            </li>;
            })}
        </ul>
        <details className="text-sm text-ink"><summary className="min-h-11 cursor-pointer py-3 font-semibold text-heading">Consultar produtos e valores da categoria</summary><div className="grid gap-4 sm:grid-cols-2">{groups.map(group => <section key={group.key} aria-label={group.label}><h4 className="font-semibold text-heading">{group.label} · {format(group.value)}</h4><ul className="mt-2 grid gap-1">{group.items.map(item => <li key={item.key} className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-b border-history-border py-2"><span>{item.label}</span><strong>{format(item.value)}</strong></li>)}</ul></section>)}</div></details>
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
