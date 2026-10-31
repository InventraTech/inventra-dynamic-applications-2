import { Link } from "react-router-dom";

import teamIcon from "../../../assets/icons/equipe.svg";
import type { KitchenAccessRequest, TeamUser } from "../../../types/teamAccess";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import KitchenSectionHeading from "./KitchenSectionHeading";

interface KitchenTeamCardProps {
    kitchenId: number;
    canManage: boolean;
    users: TeamUser[];
    accessRequests: KitchenAccessRequest[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
}

function KitchenTeamCard({ kitchenId, canManage, users, accessRequests, loading, error, onRetry }: KitchenTeamCardProps) {
    const kitchenUsers = users.filter((user) => user.kitchen?.id === kitchenId);
    const pendingRequests = accessRequests.filter((request) => request.kitchen.id === kitchenId && request.status === "PENDING");

    return (
        <section className="grid min-w-0 gap-5 rounded-4xl bg-surface p-5 shadow-history-card sm:p-6">
            <KitchenSectionHeading icon={teamIcon} title="Equipe da cozinha" description="Quem está aqui e quem pediu para entrar." />

            {loading ? (
                <div className="grid min-w-0 gap-3" aria-busy="true">
                    <p role="status" aria-live="polite" className="sr-only">Carregando equipe e pedidos de acesso…</p>
                    <div className="h-12 w-3/4 rounded-full bg-history-card-header motion-safe:animate-pulse" aria-hidden="true" />
                    <div className="h-11 w-full rounded-xl bg-history-card-header motion-safe:animate-pulse" aria-hidden="true" />
                </div>
            ) : error ? (
                <div className="grid min-w-0 gap-3">
                    <Feedback severity="error">Não foi possível carregar o resumo da equipe.</Feedback>
                    <Button variant="outline" type="button" className="w-fit" onClick={onRetry}>Tentar novamente</Button>
                </div>
            ) : canManage ? (
                <>
                    <p className="m-0 inline-flex w-fit max-w-full flex-wrap items-center gap-2 rounded-full border border-sidebar-purple bg-sidebar-active px-4 py-2 font-k2d text-sm font-bold text-sidebar-purple">
                        <span className="size-2.5 rounded-full bg-login-gold" aria-hidden="true" />
                        <span>{kitchenUsers.length} {kitchenUsers.length === 1 ? "pessoa" : "pessoas"} · {pendingRequests.length} {pendingRequests.length === 1 ? "pedido pendente" : "pedidos pendentes"}</span>
                    </p>
                    <Link className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-sidebar-purple bg-surface px-4 py-2 text-center font-k2d text-sm font-bold text-sidebar-purple transition-colors hover:bg-history-card-header focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/equipe-acessos">
                        Abrir Equipe e acessos
                    </Link>
                </>
            ) : (
                <Feedback severity="info">A gestão de pessoas e pedidos de acesso está disponível para supervisores.</Feedback>
            )}
        </section>
    );
}

export default KitchenTeamCard;
