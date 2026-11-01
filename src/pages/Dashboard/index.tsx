import { useRef, useState, type KeyboardEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Feedback from "../../components/ui/Feedback";
import Mascot from "../../components/ui/Mascot";
import DashboardFilters from "../../components/features/Dashboard/DashboardFilters";
import { ControlView, Overview, PartialDataNotice, PurchasesView, StockView } from "../../components/features/Dashboard/DashboardViews";
import { panelClass } from "../../components/features/Dashboard/DashboardPrimitives";
import useDashboard from "../../hooks/useDashboard";
import { getSession } from "../../services/authSession";
import type { DashboardFilters as Filters, DashboardTab } from "../../types/dashboard";
import { EMPTY_DASHBOARD_FILTERS, hasProductFilter } from "../../utils/dashboardAggregations";
import { analyzeDashboard } from "../../utils/dashboardAnalysis";
import { getProfileDisplayName, getProfileInitials } from "../../components/features/Profile/profileHelpers";

const tabs: { id: DashboardTab; title: string; description: string }[] = [
    { id: "overview", title: "Visão geral", description: "Uma visão integrada do estoque, dos alertas e das requisições." },
    { id: "stock", title: "Estoque e validade", description: "Saldos, consumo e vencimentos para apoiar sua operação." },
    { id: "purchases", title: "Compras e fornecedores", description: "Requisições e referências para planejar o abastecimento." },
    { id: "control", title: "Inventário, alertas e controle", description: "Contagens e alertas para acompanhar a sua cozinha." },
];

export default function Dashboard() {
    const session = getSession();
    // Changing the authenticated identity remounts all resource caches and local filters.
    return <DashboardContent key={`${session?.user.id}:${session?.user.kitchen?.id}:${session?.token}`} />;
}

function DashboardContent() {
    const session = getSession();
    const kitchen = session?.user.kitchen;
    const kitchenId = kitchen?.id ?? -1;
    const [tab, setTab] = useState<DashboardTab>("overview");
    const [filters, setFilters] = useState<Filters>(EMPTY_DASHBOARD_FILTERS);
    const refs = useRef<(HTMLButtonElement | null)[]>([]);
    const data = useDashboard(tab, hasProductFilter(filters));
    const analysis = analyzeDashboard(data, filters, tab, kitchenId);
    const name = getProfileDisplayName(session?.user.name ?? "Usuário");
    const currentTab = tabs.find(item => item.id === tab)!;
    const resources = [data.stock, data.batches, data.requisitions, data.alerts, data.products, data.parameters, data.items, data.suppliers, data.links, data.inventories, data.counts];
    const loading = resources.some(resource => resource.loading);
    const errors = resources.filter(resource => resource.error).length;
    const incomplete = resources.filter(resource => resource.data && typeof resource.data === "object" && "failed" in resource.data && resource.data.failed.length).length;
    const timestamps = resources.flatMap(resource => resource.updatedAt === null ? [] : [resource.updatedAt]);
    const updatedAt = timestamps.length ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(Math.max(...timestamps)) : null;
    const dates = [...(data.batches.data ?? []).map(row => row.entryDate), ...(data.requisitions.data ?? []).map(row => row.createdAt), ...(data.alerts.data ?? []).map(row => row.createdAt), ...(data.inventories.data ?? []).map(row => row.startedAt)];

    function changeFilter(key: keyof Filters, value: string) {
        if (["search", "category", "product", "unit"].includes(key) && value) data.requestItems();
        setFilters(previous => ({ ...previous, [key]: value, ...(["category", "unit"].includes(key) ? { product: "" } : {}) }));
    }

    function selectTab(value: DashboardTab) { data.visitTab(value); setTab(value); }

    function tabKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
        if (next === null) return;
        event.preventDefault();
        selectTab(tabs[next].id);
        refs.current[next]?.focus();
    }

    const viewProps = { analysis, filters, onFilter: changeFilter, onRetry: data.refresh };
    if (!session) return <Navigate to="/login" replace state={{ message: "Sua sessão expirou. Entre novamente para consultar o painel." }} />;
    return <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
        <Topbar title="Painel" description="Inteligência para cuidar do estoque da sua cozinha." userName={name} userInitials={getProfileInitials(name)} userPhotoUrl={session?.user.photoUrl} userRole="Supervisor" searchPlaceholder="Buscar produto no painel…" searchValue={filters.search} onSearch={value => changeFilter("search", value)} hasNotifications={Boolean(data.alerts.data?.some(row => !row.read))} onNotifications={() => selectTab("control")} />
        <main id="conteudo-principal" tabIndex={-1} className="flex min-w-0 flex-1 flex-col gap-5 px-3 pb-10 pt-5 outline-none sm:px-6">
            {!kitchen ? <section className={`${panelClass} grid justify-items-start gap-3`}><Mascot size="compacto" /><h2 className="text-xl font-bold text-heading">Seu painel começa com uma cozinha</h2><p className="text-sm text-history-muted">Crie sua cozinha para acompanhar os indicadores com os dados da sua operação.</p><Link className="inline-flex min-h-11 items-center rounded-xl bg-brand px-4 py-2 font-bold text-on-brand" to="/cadastro/cozinha">Criar cozinha</Link></section> : <>
                <section className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-3xl bg-linear-to-r from-brand-strong to-brand p-5 text-on-brand shadow-history-card sm:p-6 adjusted-contrast:bg-brand adjusted-contrast:bg-none" aria-label="Apresentação do painel">
                    <div className="min-w-0 flex-1"><h2 className="text-xl font-bold">Olá, {name.split(" ")[0]}</h2><p className="mt-1 text-sm">Seu estoque sob controle. Acompanhe os indicadores de {kitchen.name}.</p><div className="mt-4 flex min-w-0 flex-wrap gap-2"><Link className="inline-flex min-h-11 items-center rounded-full bg-login-gold px-4 py-2 text-sm font-bold text-brand-strong" to="/requisicoes/nova">+ Nova requisição</Link><Link className="inline-flex min-h-11 items-center rounded-full border border-on-brand px-4 py-2 text-sm font-semibold text-on-brand" to="/estoque">Ver estoque</Link></div></div>
                    <Mascot size="compacto" className="w-20 shrink-0 max-sm:hidden large-text:hidden" />
                </section>
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-history-muted">Painel gerencial</p><p className="mt-1 text-lg font-bold text-heading">{kitchen.name}</p></div><div className="flex flex-wrap items-center gap-3"><p role="status" aria-live="polite" className="text-xs text-history-muted">{loading ? "Atualizando os indicadores…" : updatedAt ? `Dados consultados às ${updatedAt}` : "Aguardando dados"}</p><Button variant="outline" disabled={loading} onClick={data.refresh}>Atualizar dados</Button></div></div>
                <div role="tablist" aria-label="Áreas do painel de BI" className="flex min-w-0 flex-wrap gap-1 rounded-3xl bg-surface p-1.5 shadow-history-card large-text:flex-col">{tabs.map((item, index) => <Button key={item.id} ref={element => { refs.current[index] = element; }} id={`tab-${item.id}`} role="tab" variant="ghost" aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} className={`min-h-12 min-w-0 flex-1 rounded-2xl px-4 py-3 text-sm leading-normal ${tab === item.id ? "bg-brand-strong text-on-brand shadow-history-tab" : "text-history-muted hover:bg-history-card-header"}`} onClick={() => selectTab(item.id)} onKeyDown={event => tabKeys(event, index)}>{item.title}</Button>)}</div>
                <DashboardFilters filters={filters} tab={tab} products={analysis.products} dates={dates} alertTypes={[...new Set((data.alerts.data ?? []).map(row => row.type))].sort()} onChange={changeFilter} onClear={() => setFilters({ ...EMPTY_DASHBOARD_FILTERS })} />
                {(errors > 0 || incomplete > 0) && <div className="grid justify-items-start gap-3"><Feedback severity="error">Parte dos dados não pôde ser carregada. As análises que dependem desses dados aparecem indisponíveis; os demais indicadores continuam acessíveis.</Feedback><Button variant="outline" onClick={data.refresh} disabled={loading}>Tentar carregar novamente</Button></div>}
                <section id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0} className="grid min-w-0 gap-5">
                    <div><h2 className="text-xl font-bold text-heading">{currentTab.title}</h2><p className="mt-1 text-sm text-history-muted">{currentTab.description}</p></div>
                    {(tab === "overview" || tab === "stock") && <PartialDataNotice analysis={analysis} />}
                    {tab === "overview" && <Overview {...viewProps} />}
                    {tab === "stock" && <StockView {...viewProps} />}
                    {tab === "purchases" && <PurchasesView {...viewProps} />}
                    {tab === "control" && <ControlView {...viewProps} />}
                </section>
                {tabs.filter(item => item.id !== tab).map(item => <section key={item.id} id={`panel-${item.id}`} role="tabpanel" aria-labelledby={`tab-${item.id}`} hidden />)}
            </>}
        </main>
    </div>;
}
