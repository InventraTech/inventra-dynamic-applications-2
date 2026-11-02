import type { DashboardAnalysis } from "../../../utils/dashboardAnalysis";
import type { DashboardFilters } from "../../../types/dashboard";
import { dashboardDate, dashboardMoney, dashboardNumber, domainLabel } from "../../../utils/dashboardAggregations";
import { getBatchStatusPresentation, getDaysUntilDate } from "../../../utils/stockPresentation";
import { BarChart, ChartCard, DashboardTable, DivergingBarChart, DonutChart, LineChart, Metric, ScatterChart, StackedBarChart, StockCoverageChart, panelClass } from "./DashboardPrimitives";
import Feedback from "../../ui/Feedback";
import { Link } from "react-router-dom";
import stockIcon from "../../../assets/icons/estoque.svg";
import warningIcon from "../../../assets/icons/alerta.svg";
import expiryIcon from "../../../assets/icons/vencimento.svg";
import requisitionIcon from "../../../assets/icons/requisicao.svg";

export interface ViewProps {
    analysis: DashboardAnalysis;
    onRetry: () => void;
    filters: DashboardFilters;
    onFilter: (key: keyof DashboardFilters, value: string) => void;
}

const metricsClass = "grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4 large-text:grid-cols-1";
const chartsClass = "grid min-w-0 items-start gap-4 xl:grid-cols-2 large-text:grid-cols-1";

export function Overview({ analysis: a, onRetry, filters, onFilter }: ViewProps) {
    return <>
        <dl className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4 large-text:grid-cols-1">
            <Metric title="Valor em estoque" value={a.states.batches.ready ? dashboardMoney(a.value.total) : null} note={a.value.missing ? `Parcial: ${a.value.missing} lote(s) com saldo sem preço informado.` : "Saldo atual × preço unitário conhecido."} featured pending={a.states.batches.loading} icon={stockIcon} />
            <Metric title="Produtos abaixo do mínimo" value={a.states.stock.ready ? dashboardNumber(a.lowStock) : null} note="Produtos que a API sinaliza abaixo do limite cadastrado." tone={a.states.stock.ready ? a.lowStock ? "danger" : "success" : undefined} pending={a.states.stock.loading} icon={warningIcon} />
            <Metric title="Lotes vencendo em 30 dias" value={a.states.batches.ready ? dashboardNumber(a.expiringSoon) : null} note="Lotes ativos com validade próxima, conforme os filtros." tone={a.states.batches.ready ? a.expiringSoon ? "warning" : "success" : undefined} pending={a.states.batches.loading} icon={expiryIcon} />
            <Metric title="Requisições em análise" value={a.states.requisitions.ready ? dashboardNumber(a.pending) : null} note="Aguardando decisão do supervisor." tone={a.states.requisitions.ready ? a.pending ? "warning" : "success" : undefined} pending={a.states.requisitions.loading} icon={requisitionIcon} />
        </dl>
        <div className={chartsClass}>
            <ChartCard title="Valor em estoque por categoria" description={a.value.missing ? "Comparação do saldo positivo com preço conhecido. Como há lotes sem preço, o valor é parcial." : "Comparação do saldo positivo com preço conhecido por categoria."} {...a.states.categories} onRetry={onRetry}><BarChart data={a.categoryValue} format={dashboardMoney} selected={filters.category} onSelect={key => onFilter("category", filters.category === key ? "" : key)} /></ChartCard>
            <ChartCard title="Alertas por severidade" description="Alertas retornados para sua conta nesta cozinha." {...a.states.alerts} onRetry={onRetry}><DonutChart data={a.alertSeverities} /></ChartCard>
        </div>
        <OverviewAttention analysis={a} />
    </>;
}

function OverviewAttention({ analysis: a }: { analysis: DashboardAnalysis }) {
    const lowStock = a.stock.filter(row => row.lowStock).slice(0, 5);
    const expiring = a.sortedBatches.filter(row => row.status === "ACTIVE" && row.expirationDate !== null && getDaysUntilDate(row.expirationDate) >= 0 && getDaysUntilDate(row.expirationDate) <= 30).slice(0, 5);

    return <section className={`${panelClass} grid gap-4`} aria-labelledby="dashboard-attention-title">
        <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">Acompanhamento</p>
                <h3 id="dashboard-attention-title" className="mt-1 text-lg font-bold text-heading">O que pede atenção agora</h3>
                <p className="mt-1 text-sm text-history-muted">Itens priorizados a partir do saldo e da validade dos lotes.</p>
            </div>
            <Link className="inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-semibold text-brand hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/estoque">Abrir estoque</Link>
        </header>
        <div className="grid min-w-0 gap-3 xl:grid-cols-2">
            <section className="min-w-0 rounded-2xl bg-history-card-header p-4 sm:p-5" aria-labelledby="dashboard-low-stock-title">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 id="dashboard-low-stock-title" className="text-sm font-bold text-heading">Abaixo do estoque mínimo</h4>
                    {a.states.stock.ready && <span className="text-xs font-semibold text-history-muted">{dashboardNumber(a.lowStock)} {a.lowStock === 1 ? "produto" : "produtos"}</span>}
                </div>
                {!a.states.stock.ready ? <p className="mt-3 text-sm text-history-muted">{a.states.stock.loading ? "Carregando os saldos…" : "Dados de estoque indisponíveis."}</p> : lowStock.length ? <ul className="mt-3 grid gap-2">
                    {lowStock.map(row => <li key={row.product.id} className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-history-border/70 pt-2 text-sm">
                        <span className="min-w-0 flex-1 font-semibold text-ink">{row.product.name}</span>
                        <span className="shrink-0 text-right font-semibold text-feedback-error">{dashboardNumber(row.totalQuantity)} {row.unit.symbol}<span className="block text-xs font-normal text-history-muted">mínimo {row.minStock === null ? "não informado" : `${dashboardNumber(row.minStock)} ${row.unit.symbol}`}</span></span>
                    </li>)}
                </ul> : <p className="mt-3 text-sm text-history-muted">Nenhum produto está abaixo do mínimo cadastrado.</p>}
            </section>
            <section className="min-w-0 rounded-2xl bg-history-card-header p-4 sm:p-5" aria-labelledby="dashboard-expiring-title">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 id="dashboard-expiring-title" className="text-sm font-bold text-heading">Validade nos próximos 30 dias</h4>
                    {a.states.batches.ready && <span className="text-xs font-semibold text-history-muted">{dashboardNumber(a.expiringSoon)} {a.expiringSoon === 1 ? "lote" : "lotes"}</span>}
                </div>
                {!a.states.batches.ready ? <p className="mt-3 text-sm text-history-muted">{a.states.batches.loading ? "Carregando as validades…" : "Dados de lotes indisponíveis."}</p> : expiring.length ? <ul className="mt-3 grid gap-2">
                    {expiring.map(row => {
                        const days = getDaysUntilDate(row.expirationDate!);
                        const deadline = days === 0 ? "Vence hoje" : days === 1 ? "Vence amanhã" : `Vence em ${days} dias`;
                        return <li key={row.id} className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-history-border/70 pt-2 text-sm">
                            <span className="min-w-0 flex-1"><strong className="block text-ink">{row.product.name}</strong><span className="text-xs text-history-muted">Lote {row.batchNumber}</span></span>
                            <span className="shrink-0 text-right font-semibold text-history-status-observation-text">{deadline}<span className="block text-xs font-normal text-history-muted">{dashboardDate(row.expirationDate)}</span></span>
                        </li>;
                    })}
                </ul> : <p className="mt-3 text-sm text-history-muted">Nenhum lote ativo vence nos próximos 30 dias.</p>}
            </section>
        </div>
    </section>;
}

export function StockView({ analysis: a, onRetry, filters, onFilter }: ViewProps) {
    return <>
        <dl className={metricsClass}>
            <Metric title="Produtos abaixo do mínimo" value={a.states.stock.ready ? dashboardNumber(a.lowStock) : null} note="Indicador atual calculado pela API para os produtos selecionados." featured pending={a.states.stock.loading} />
            <Metric title="Lotes vencidos" value={a.states.batches.ready ? dashboardNumber(a.expired) : null} note="Status vencido ou lote ativo com validade anterior a hoje." pending={a.states.batches.loading} />
            <Metric title="Consumo médio diário" value={a.states.parameters.ready ? a.consumption.length ? <ul className="flex flex-wrap gap-2 text-sm" aria-label="Consumo médio por unidade e por dia">{a.consumption.map(row => <li key={row.key} className="inline-flex items-baseline gap-1.5 rounded-lg bg-sidebar-active px-2.5 py-1.5"><strong className="text-brand">{dashboardNumber(row.value)}</strong><span className="text-history-muted">{row.label}</span></li>)}</ul> : "Não informado" : null} note={a.missingConsumption ? `Por unidade/dia; ${a.missingConsumption} parâmetro(s) sem consumo informado.` : "Valores apresentados por unidade, sem somar medidas diferentes."} pending={a.states.parameters.loading} />
            <Metric title="Entradas no mês atual" value={a.states.batches.ready ? dashboardNumber(a.monthlyEntries) : null} note="Lotes com entrada neste mês, dentro da seleção. O restante do painel inclui todo o período." pending={a.states.batches.loading} />
        </dl>
        <div className={chartsClass}>
            <ChartCard title="Valor do estoque por categoria" description="Lotes com preço informado. Selecione uma categoria para filtrar." {...a.states.categories} onRetry={onRetry}><BarChart data={a.categoryValue} format={dashboardMoney} onSelect={key => onFilter("category", filters.category === key ? "" : key)} selected={filters.category} /></ChartCard>
            <ChartCard title="Lotes por status" {...a.states.batches} onRetry={onRetry}><DonutChart data={a.batchStatuses} /></ChartCard>
            <ChartCard title="Saldo de produtos em relação ao mínimo" description="Cobertura normalizada por produto, sem somar kg, litros ou unidades." {...a.states.stock} onRetry={onRetry}><StockCoverageChart data={a.stockCoverage} /></ChartCard>
        </div>
        <ChartCard title="Entradas de lotes por mês" description="Quantidade de lotes por data de entrada, em ordem cronológica." {...a.states.batches} onRetry={onRetry}><LineChart data={a.entryMonths} /></ChartCard>
        <ChartCard title="Detalhamento de lotes" description="Validades mais próximas primeiro. Quantidades mantêm a unidade de cada produto." {...a.states.categories} onRetry={onRetry}>
            <DashboardTable title="Detalhamento de lotes" data={a.sortedBatches} rowKey={row => row.id} columns={[
                { key: "product", title: "Produto", render: row => row.product.name, sort: row => row.product.name },
                { key: "batch", title: "Lote", render: row => row.batchNumber, sort: row => row.batchNumber },
                { key: "initial", title: "Quantidade inicial", render: row => `${dashboardNumber(row.initialQuantity)} ${a.productMap.get(row.product.id)?.unit.symbol ?? ""}`, sort: row => row.initialQuantity },
                { key: "current", title: "Saldo atual", render: row => `${dashboardNumber(row.currentQuantity)} ${a.productMap.get(row.product.id)?.unit.symbol ?? ""}`, sort: row => row.currentQuantity },
                { key: "price", title: "Preço unitário", render: row => dashboardMoney(row.unitPrice), sort: row => row.unitPrice ?? -1 },
                { key: "entry", title: "Entrada", render: row => dashboardDate(row.entryDate), sort: row => row.entryDate },
                { key: "expiration", title: "Validade", render: row => dashboardDate(row.expirationDate), sort: row => row.expirationDate ?? "9999" },
                { key: "status", title: "Status", render: row => getBatchStatusPresentation(row).label, sort: row => row.status },
                { key: "supplier", title: "Fornecedor", render: row => row.supplier?.legalName ?? "Não informado", sort: row => row.supplier?.legalName ?? "" },
            ]} />
        </ChartCard>
    </>;
}

export function PurchasesView({ analysis: a, onRetry }: ViewProps) {
    return <>
        <p className="text-xs leading-relaxed text-history-muted">O período, o tipo e o status filtram as requisições. Cadastros e referências de fornecedores usam os filtros de categoria, produto e unidade. O valor estimado considera o total integral das requisições selecionadas.</p>
        <dl className={metricsClass}>
            <Metric title="Total de requisições" value={a.states.requisitions.ready ? dashboardNumber(a.requisitions.length) : null} note="Requisições da cozinha conforme sua seleção." featured pending={a.states.requisitions.loading} />
            <Metric title="Valor total estimado" value={a.states.requisitions.ready ? dashboardMoney(a.estimatedTotal) : null} note="Soma dos totais estimados informados pela API." pending={a.states.requisitions.loading} />
            <Metric title="Fornecedores ativos" value={a.states.suppliers.ready ? dashboardNumber(a.suppliers.filter(row => row.active).length) : null} note="Fornecedores ativos relacionados à sua cozinha." pending={a.states.suppliers.loading} />
            <Metric title="Prazo médio de entrega" value={a.states.links.ready ? a.leadTime === null ? "Não informado" : `${dashboardNumber(a.leadTime)} dias` : null} note="Média dos prazos cadastrados nas relações produto × fornecedor." pending={a.states.links.loading} />
        </dl>
        <div className={chartsClass}>
            <ChartCard title="Requisições por tipo e situação" description="Cada barra mostra a composição dos estados dentro daquele tipo de requisição." {...a.states.requisitions} onRetry={onRetry}><StackedBarChart data={a.requisitionsByType} /></ChartCard>
            <ChartCard title="Top 10 produtos mais requisitados" description="Ranking por número de requisições distintas em que o produto aparece, evitando somar unidades diferentes." {...a.states.items} onRetry={onRetry}><BarChart data={a.topRequested} /></ChartCard>
            <ChartCard title="Fornecedores por avaliação" description="Distribuição das avaliações disponíveis nos cadastros carregados; ausências aparecem separadamente." {...a.states.suppliers} onRetry={onRetry}><BarChart data={a.ratings} /></ChartCard>
            <ChartCard title="Preço de referência × prazo de entrega" description="Somente relações que possuem preço e prazo informados." {...a.states.links} onRetry={onRetry}><ScatterChart data={a.links.filter(row => row.referencePrice !== null && row.leadTimeDays !== null).map(row => ({ key: `${row.productId}:${row.supplier.id}`, label: `${row.productName} · ${row.supplier.legalName}`, x: row.leadTimeDays!, y: row.referencePrice! }))} /></ChartCard>
        </div>
        <ChartCard title="Detalhamento de fornecedores e produtos" {...a.states.links} onRetry={onRetry}>
            <DashboardTable title="Fornecedores e produtos" data={a.links} rowKey={row => `${row.productId}:${row.supplier.id}`} columns={[
                { key: "product", title: "Produto", render: row => row.productName, sort: row => row.productName },
                { key: "supplier", title: "Fornecedor", render: row => row.supplier.legalName, sort: row => row.supplier.legalName },
                { key: "code", title: "Código do fornecedor", render: row => row.supplierCode ?? "Não informado" },
                { key: "price", title: "Preço de referência", render: row => dashboardMoney(row.referencePrice), sort: row => row.referencePrice ?? -1 },
                { key: "days", title: "Prazo de entrega", render: row => row.leadTimeDays === null ? "Não informado" : `${dashboardNumber(row.leadTimeDays)} dias`, sort: row => row.leadTimeDays ?? -1 },
            ]} />
        </ChartCard>
    </>;
}

export function ControlView({ analysis: a, onRetry }: ViewProps) {
    const pendingCounts = a.counts.filter(row => row.divergence === null).length;
    return <>
        <dl className={metricsClass}>
            <Metric title="Total de inventários" value={a.states.inventories.ready ? dashboardNumber(a.inventories.length) : null} note="Inventários da cozinha conforme sua seleção." featured pending={a.states.inventories.loading} />
            <Metric title="Contagens com divergência" value={a.states.counts.ready ? dashboardNumber(a.divergences.length) : null} note={pendingCounts ? `${pendingCounts} contagem(ns) ainda sem divergência calculada.` : "Contagens com divergência informada e diferente de zero."} pending={a.states.counts.loading} />
            <Metric title="Alertas críticos" value={a.states.alerts.ready ? dashboardNumber(a.alerts.filter(row => row.severity === "CRITICAL").length) : null} note="Severidade crítica, conforme os filtros escolhidos." pending={a.states.alerts.loading} />
            <Metric title="Total de alertas" value={a.states.alerts.ready ? dashboardNumber(a.alerts.length) : null} note="Alertas disponíveis para o supervisor conectado." pending={a.states.alerts.loading} />
        </dl>
        <div className={chartsClass}>
            <ChartCard title="Inventários por status" {...a.states.inventories} onRetry={onRetry}><DonutChart data={a.inventoryStatuses} /></ChartCard>
            <ChartCard title="Faltas e sobras por inventário" description="Divergências negativas e positivas ficam em lados opostos e são agrupadas por unidade, sem compensação entre elas." {...a.states.counts} onRetry={onRetry}><DivergingBarChart data={a.inventoryDivergences} /></ChartCard>
            <ChartCard title="Alertas por tipo" {...a.states.alerts} onRetry={onRetry}><BarChart data={a.alertTypes} /></ChartCard>
            <ChartCard title="Evolução dos alertas" description="Alertas por mês de criação, em ordem cronológica." {...a.states.alerts} onRetry={onRetry}><LineChart data={a.alertMonths} /></ChartCard>
        </div>
        <ChartCard title="Contagens de inventário com divergência" description="Maiores divergências absolutas primeiro. O sinal indica falta (−) ou sobra (+)." {...a.states.counts} onRetry={onRetry}>
            <DashboardTable title="Contagens com divergência" data={a.divergences} rowKey={row => `${row.inventoryId}:${row.id}`} columns={[
                { key: "inventory", title: "Inventário", render: row => `#${row.inventoryId}`, sort: row => row.inventoryId },
                { key: "batch", title: "Lote", render: row => row.batch.batchNumber, sort: row => row.batch.batchNumber },
                { key: "product", title: "Produto", render: row => a.allBatches.get(row.batch.id)?.product.name ?? "Não informado" },
                { key: "registered", title: "Registrada", render: row => dashboardNumber(row.registeredQuantity), sort: row => row.registeredQuantity },
                { key: "physical", title: "Física", render: row => dashboardNumber(row.physicalQuantity), sort: row => row.physicalQuantity },
                { key: "divergence", title: "Divergência", render: row => `${row.divergence! > 0 ? "+" : ""}${dashboardNumber(row.divergence!)} ${a.productMap.get(a.allBatches.get(row.batch.id)?.product.id ?? -1)?.unit.symbol ?? "unidade não informada"}`, sort: row => Math.abs(row.divergence!) },
                { key: "note", title: "Observação", render: row => row.note ?? "Sem observação" },
            ]} />
        </ChartCard>
        <ChartCard title="Alertas recentes" description="Alertas mais recentes primeiro. A leitura é específica do usuário conectado." {...a.states.alerts} onRetry={onRetry}>
            <DashboardTable title="Alertas recentes" data={a.alerts} rowKey={row => row.id} columns={[
                { key: "date", title: "Criado em", render: row => dashboardDate(row.createdAt), sort: row => row.createdAt },
                { key: "severity", title: "Severidade", render: row => domainLabel(row.severity), sort: row => row.severity },
                { key: "type", title: "Tipo", render: row => domainLabel(row.type), sort: row => row.type },
                { key: "product", title: "Produto", render: row => row.product?.name ?? "Sem produto associado" },
                { key: "message", title: "Mensagem", render: row => row.message },
                { key: "read", title: "Leitura", render: row => row.read ? "Lido" : "Não lido", sort: row => Number(row.read) },
            ]} />
        </ChartCard>
    </>;
}

export function PartialDataNotice({ analysis: a }: { analysis: DashboardAnalysis }) {
    return a.value.missing > 0 && a.states.batches.ready ? <Feedback>Há {a.value.missing} lote(s) com saldo e sem preço unitário. Os gráficos financeiros incluem somente preços informados.</Feedback> : null;
}
