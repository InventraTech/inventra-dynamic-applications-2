import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Loading from "../../ui/Loading";
import RequisitionList from "./RequisitionList";
import RequisitionMetrics from "./RequisitionMetrics";
import { getKitchenRequisitions } from "../../../services/requisitions";
import type { Requisition, RequisitionListFilters } from "../../../types/requisitions";
import type { RequisitionPageMode } from "../../../pages/Requisitions";
import RequisitionFilters from "./RequisitionFilters";
import RequisitionCreateForm from "./RequisitionCreateForm";
import useRequisitionDetail from "./hooks/useRequisitionDetail";
import RequisitionDetailSkeleton from "./RequisitionDetailSkeleton";
import RequisitionDetailView from "./RequisitionDetailView";
import Mascot from "../../ui/Mascot";
import RequisitionComposer from "./RequisitionComposer";

interface RequisitionFlowProps {
    mode: RequisitionPageMode;
    kitchenId: number | null;
    kitchenName: string | null;
    userId: string | null;
    canReview: boolean;
}

interface ListState {
    loading: boolean;
    error: string | null;
    requisitions: Requisition[];
}

export default function RequisitionFlow({ mode, kitchenId, kitchenName, userId, canReview }: RequisitionFlowProps) {
    const [listState, setListState] = useState<ListState>({ loading: true, error: null, requisitions: [] });
    const [filters, setFilters] = useState<RequisitionListFilters>({ status: "ALL", type: "ALL", search: "" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const { requestId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const detail = useRequisitionDetail(requestId, (mode === "detail" || mode === "edit") && kitchenId !== null);

    useEffect(() => {
        if (mode !== "list" || kitchenId === null) {
            setListState({ loading: false, error: null, requisitions: [] });
            return;
        }

        const controller = new AbortController();
        setListState({ loading: true, error: null, requisitions: [] });
        getKitchenRequisitions(kitchenId, controller.signal)
            .then((requisitions) => {
                if (controller.signal.aborted) return;
                const sorted = [...requisitions].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
                setListState({ loading: false, error: null, requisitions: sorted });
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                setListState({ loading: false, error: error instanceof Error ? error.message : "Não foi possível carregar as requisições.", requisitions: [] });
            });

        return () => controller.abort();
    }, [kitchenId, mode]);

    const normalizedSearch = filters.search.trim().toLocaleLowerCase("pt-BR");
    const visibleRequisitions = listState.requisitions.filter((requisition) => {
        const matchesStatus = filters.status === "ALL" || requisition.status === filters.status;
        const matchesType = filters.type === "ALL" || requisition.type === filters.type;
        const searchableValues = [String(requisition.id), requisition.requester.name, requisition.origin, ...requisition.itemNames];
        const matchesSearch = !normalizedSearch || searchableValues.some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedSearch));
        return matchesStatus && matchesType && matchesSearch;
    });
    const totalPages = Math.max(1, Math.ceil(visibleRequisitions.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageRequisitions = visibleRequisitions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (mode === "create") {
        return <div className="grid min-w-0 gap-5 px-4 py-5 md:px-6 lg:px-8"><RequisitionCreateForm kitchenId={kitchenId} kitchenName={kitchenName} /></div>;
    }

    if (mode === "detail") {
        const locationState = location.state;
        const created = typeof locationState === "object" && locationState !== null && "created" in locationState && locationState.created === true;
        return (
            <section className="grid min-w-0 gap-5 px-4 py-5 md:px-6 lg:px-8">
                {detail.state.loading && <RequisitionDetailSkeleton />}
                {detail.state.error && <div className="grid min-w-0 gap-3"><Feedback severity="error">{detail.state.error}</Feedback><Button variant="link" type="button" onClick={() => void detail.refresh()}>Tentar carregar novamente</Button></div>}
                {!detail.state.loading && !detail.state.error && detail.state.requisition && kitchenId !== null && <RequisitionDetailView requisition={detail.state.requisition} items={detail.state.items} userId={userId} canReview={canReview} created={created} onChanged={detail.refresh} />}
                {detail.state.refreshing && <p role="status" aria-live="polite" className="text-sm text-history-muted">Atualizando os dados da requisição…</p>}
            </section>
        );
    }

    if (mode === "edit") {
        const locationState = location.state;
        const created = typeof locationState === "object" && locationState !== null && "created" in locationState && locationState.created === true;
        return (
            <section className="grid min-w-0 gap-5 px-4 py-5 md:px-6 lg:px-8">
                {detail.state.loading && <RequisitionDetailSkeleton />}
                {detail.state.error && <div className="grid min-w-0 gap-3"><Feedback severity="error">{detail.state.error}</Feedback><Button variant="link" type="button" onClick={() => void detail.refresh()}>Tentar carregar novamente</Button></div>}
                {!detail.state.loading && !detail.state.error && detail.state.requisition && kitchenId !== null && <RequisitionComposer requisition={detail.state.requisition} items={detail.state.items} kitchenId={kitchenId} kitchenName={kitchenName} userId={userId} canReview={canReview} created={created} onChanged={detail.refresh} />}
                {detail.state.refreshing && <p role="status" aria-live="polite" className="text-sm text-history-muted">Atualizando os dados do rascunho…</p>}
            </section>
        );
    }

    if (mode === "list") {
        return (
            <section className="grid min-w-0 gap-5 px-4 py-5 md:px-6 lg:px-8" aria-labelledby="requisitions-heading">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-3xl bg-linear-to-r from-brand-strong to-brand p-6 text-on-brand shadow-history-card">
                    <div className="min-w-0">
                        <h2 id="requisitions-heading" className="font-k2d text-2xl font-bold">Requisições da cozinha</h2>
                        <p className="mt-1 text-sm leading-relaxed">Acompanhe compras, consumo e transferências até a decisão.</p>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-4"><Mascot size="amplo" className="hidden max-h-20 shrink-0 object-contain sm:block" /><Button variant="primary" type="button" onClick={() => navigate("/requisicoes/nova")} className="min-h-11 rounded-xl bg-login-gold px-5 text-ink hover:brightness-95">Nova requisição</Button></div>
                </div>

                {!listState.loading && !listState.error && kitchenId !== null && <RequisitionMetrics requisitions={listState.requisitions} />}
                {!listState.loading && !listState.error && kitchenId !== null && listState.requisitions.length > 0 && <RequisitionFilters value={filters} onChange={(nextFilters) => { setFilters(nextFilters); setPage(1); }} resultCount={visibleRequisitions.length} />}
                {kitchenId === null && <Feedback severity="info">Sua conta ainda não está vinculada a uma cozinha. Vincule uma cozinha para consultar ou criar requisições.</Feedback>}
                {listState.loading && kitchenId !== null && <div className="flex min-h-60 items-center justify-center rounded-3xl bg-surface"><Loading loadingText="Carregando requisições…" /></div>}
                {listState.error && <Feedback severity="error">{listState.error}</Feedback>}
                {!listState.loading && !listState.error && kitchenId !== null && listState.requisitions.length === 0 && (
                    <div className="grid min-h-60 place-content-center justify-items-center gap-3 rounded-3xl bg-surface p-6 text-center shadow-history-card">
                        <h3 className="font-k2d text-xl font-bold text-heading">Nenhuma requisição por enquanto</h3>
                        <p className="max-w-prose text-history-muted">Crie um rascunho para solicitar uma compra, registrar um consumo ou transferir itens.</p>
                    </div>
                )}
                {!listState.loading && !listState.error && visibleRequisitions.length === 0 && listState.requisitions.length > 0 && <div className="grid justify-items-center gap-3 rounded-2xl bg-surface p-6 text-center"><p className="text-history-muted">Nenhuma requisição corresponde aos filtros selecionados.</p><Button variant="link" type="button" onClick={() => { setFilters({ status: "ALL", type: "ALL", search: "" }); setPage(1); }}>Limpar filtros</Button></div>}
                {!listState.loading && !listState.error && visibleRequisitions.length > 0 && <RequisitionList requisitions={pageRequisitions} page={currentPage} pageSize={pageSize} totalCount={visibleRequisitions.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />}
            </section>
        );
    }

    return null;
}
