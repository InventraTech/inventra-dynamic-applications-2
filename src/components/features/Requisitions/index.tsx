import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

export default function RequisitionFlow({ mode, kitchenId, kitchenName, userId }: RequisitionFlowProps) {
    const [listState, setListState] = useState<ListState>({ loading: true, error: null, requisitions: [] });
    const [filters, setFilters] = useState<RequisitionListFilters>({ status: "ALL", type: "ALL", search: "" });
    const { requestId } = useParams();
    const navigate = useNavigate();

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

    if (mode === "create") {
        return <div className="grid min-w-0 gap-5 px-4 py-5 md:px-6 lg:px-8"><RequisitionCreateForm kitchenId={kitchenId} kitchenName={kitchenName} /></div>;
    }

    if (mode === "list") {
        return (
            <section className="grid min-w-0 gap-5 px-4 py-5 md:px-6 lg:px-8" aria-labelledby="requisitions-heading">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-3xl bg-linear-to-r from-brand-strong to-brand p-6 text-on-brand shadow-history-card">
                    <div className="min-w-0">
                        <h2 id="requisitions-heading" className="font-k2d text-2xl font-bold">Requisições da cozinha</h2>
                        <p className="mt-1 text-sm leading-relaxed">Acompanhe compras, consumo e transferências até a decisão.</p>
                    </div>
                    <Button variant="primary" type="button" onClick={() => navigate("/requisicoes/nova")} className="min-h-11 rounded-xl bg-login-gold px-5 text-ink hover:brightness-95">Nova requisição</Button>
                </div>

                {!listState.loading && !listState.error && kitchenId !== null && <RequisitionMetrics requisitions={listState.requisitions} />}
                {!listState.loading && !listState.error && kitchenId !== null && listState.requisitions.length > 0 && <RequisitionFilters value={filters} onChange={setFilters} />}
                {kitchenId === null && <Feedback severity="info">Sua conta ainda não está vinculada a uma cozinha. Vincule uma cozinha para consultar ou criar requisições.</Feedback>}
                {listState.loading && kitchenId !== null && <div className="flex min-h-60 items-center justify-center rounded-3xl bg-surface"><Loading loadingText="Carregando requisições…" /></div>}
                {listState.error && <Feedback severity="error">{listState.error}</Feedback>}
                {!listState.loading && !listState.error && kitchenId !== null && listState.requisitions.length === 0 && (
                    <div className="grid min-h-60 place-content-center justify-items-center gap-3 rounded-3xl bg-surface p-6 text-center shadow-history-card">
                        <h3 className="font-k2d text-xl font-bold text-heading">Nenhuma requisição por enquanto</h3>
                        <p className="max-w-prose text-history-muted">Crie um rascunho para solicitar uma compra, registrar um consumo ou transferir itens.</p>
                    </div>
                )}
                {!listState.loading && !listState.error && visibleRequisitions.length === 0 && listState.requisitions.length > 0 && <div className="grid justify-items-center gap-3 rounded-2xl bg-surface p-6 text-center"><p className="text-history-muted">Nenhuma requisição corresponde aos filtros selecionados.</p><Button variant="link" type="button" onClick={() => setFilters({ status: "ALL", type: "ALL", search: "" })}>Limpar filtros</Button></div>}
                {!listState.loading && !listState.error && visibleRequisitions.length > 0 && <RequisitionList requisitions={visibleRequisitions} userId={userId} />}
            </section>
        );
    }

    return (
        <section className="grid min-w-0 gap-5 px-4 py-5 md:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div><h2 className="font-k2d text-2xl font-bold text-ink">Requisição #{requestId ?? ""}</h2><p className="text-sm text-history-muted">Consulte os itens e acompanhe a situação da requisição.</p></div>
                <Link className="rounded-xl border border-history-border bg-surface px-4 py-2 font-semibold text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/requisicoes">← Voltar à lista</Link>
            </div>
            <div className="grid min-h-60 place-content-center rounded-3xl bg-surface p-6 text-center shadow-history-card">
                <p className="text-history-muted">O detalhe da requisição está sendo preparado.</p>
            </div>
        </section>
    );
}
