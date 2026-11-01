import type { DashboardAnalysis } from "../../../utils/dashboardAnalysis";
import type { DashboardFilters } from "../../../types/dashboard";
import { dashboardDate, dashboardMoney, dashboardNumber, domainLabel } from "../../../utils/dashboardAggregations";
import { getBatchStatusPresentation } from "../../../utils/stockPresentation";
import { BarChart, ChartCard, DashboardTable, DonutChart, LineChart, Metric, ScatterChart } from "./DashboardPrimitives";
import Feedback from "../../ui/Feedback";

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
        <dl className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3 large-text:grid-cols-1">
            <Metric title="Valor total do estoque" value={a.states.batches.ready ? dashboardMoney(a.value.total) : null} note={a.value.missing ? `Valor parcial: ${a.value.missing} lote(s) com saldo sem preço informado.` : "Saldo atual dos lotes × preço unitário."} featured pending={a.states.batches.loading} />
            <Metric title="Quantidade em estoque" value={a.states.categories.ready ? a.quantity : null} note="Saldos separados por unidade, sem conversões." pending={a.states.categories.loading} />
            <Metric title="Total de lotes" value={a.states.batches.ready ? dashboardNumber(a.batches.length) : null} note="Todos os status, conforme os filtros escolhidos." pending={a.states.batches.loading} />
            <Metric title="Produtos cadastrados" value={a.states.products.ready ? dashboardNumber(a.selectedProducts.length) : null} note="Produtos vinculados pelo estoque ou por lotes da cozinha." pending={a.states.products.loading} />
            <Metric title="Alertas não lidos" value={a.states.alerts.ready ? dashboardNumber(a.alerts.filter(row => !row.read).length) : null} note="Alertas disponíveis para o supervisor conectado." pending={a.states.alerts.loading} />
            <Metric title="Requisições pendentes" value={a.states.requisitions.ready ? dashboardNumber(a.pending) : null} note="Requisições em análise na sua cozinha." pending={a.states.requisitions.loading} />
        </dl>
        <div className={chartsClass}>
            <ChartCard title="Valor do estoque por categoria" description={a.value.missing ? "Considera somente lotes com preço informado." : "Como o valor do estoque se distribui dentro da sua cozinha. Selecione uma categoria para filtrar."} {...a.states.categories} onRetry={onRetry}><BarChart data={a.categoryValue} format={dashboardMoney} onSelect={key => onFilter("category", filters.category === key ? "" : key)} selected={filters.category} /></ChartCard>
            <ChartCard title="Top 10 produtos por valor em estoque" description="Produtos ordenados pelo valor total dos seus lotes com preço informado." {...a.states.batches} onRetry={onRetry}><BarChart data={a.topProducts} format={dashboardMoney} onSelect={key => onFilter("product", filters.product === key ? "" : key)} selected={filters.product} /></ChartCard>
            <ChartCard title="Alertas por severidade" {...a.states.alerts} onRetry={onRetry}><DonutChart data={a.alertSeverities} /></ChartCard>
            <ChartCard title="Requisições por status" {...a.states.requisitions} onRetry={onRetry}><DonutChart data={a.requestStatuses} /></ChartCard>
        </div>
    </>;
}

export function StockView({ analysis: a, onRetry, filters, onFilter }: ViewProps) {
    return <>
        <dl className={metricsClass}>
            <Metric title="Produtos abaixo do mínimo" value={a.states.stock.ready ? dashboardNumber(a.lowStock) : null} note="Indicador atual calculado pela API para os produtos selecionados." featured pending={a.states.stock.loading} />
            <Metric title="Lotes vencidos" value={a.states.batches.ready ? dashboardNumber(a.expired) : null} note="Status vencido ou lote ativo com validade anterior a hoje." pending={a.states.batches.loading} />
            <Metric title="Consumo médio diário" value={a.states.parameters.ready ? a.consumption ?? "Não informado" : null} note={a.missingConsumption ? `Por unidade/dia; ${a.missingConsumption} parâmetro(s) sem consumo informado.` : "Soma dos consumos médios cadastrados, por unidade/dia."} pending={a.states.parameters.loading} />
            <Metric title="Entradas no mês atual" value={a.states.batches.ready ? dashboardNumber(a.monthlyEntries) : null} note="Lotes com entrada neste mês, dentro da seleção. O restante do painel inclui todo o período." pending={a.states.batches.loading} />
        </dl>
        <div className={chartsClass}>
            <ChartCard title="Valor do estoque por categoria" description="Lotes com preço informado. Selecione uma categoria para filtrar." {...a.states.categories} onRetry={onRetry}><BarChart data={a.categoryValue} format={dashboardMoney} onSelect={key => onFilter("category", filters.category === key ? "" : key)} selected={filters.category} /></ChartCard>
            <ChartCard title="Lotes por status" {...a.states.batches} onRetry={onRetry}><DonutChart data={a.batchStatuses} /></ChartCard>
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
            <ChartCard title="Requisições por tipo" {...a.states.requisitions} onRetry={onRetry}><BarChart data={a.requestTypes} /></ChartCard>
            <ChartCard title="Top 10 produtos mais requisitados" description="Ranking por número de requisições distintas em que o produto aparece, evitando somar unidades diferentes." {...a.states.items} onRetry={onRetry}><BarChart data={a.topRequested} /></ChartCard>
            <ChartCard title="Fornecedores por avaliação" description="Inclui fornecedores ativos e inativos; avaliações ausentes aparecem separadamente." {...a.states.suppliers} onRetry={onRetry}><BarChart data={a.ratings} /></ChartCard>
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
            <ChartCard title="Divergência absoluta por inventário" description="Soma dos valores absolutos, separada por unidade de medida." {...a.states.counts} onRetry={onRetry}><BarChart data={a.divergenceByInventory} /></ChartCard>
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
