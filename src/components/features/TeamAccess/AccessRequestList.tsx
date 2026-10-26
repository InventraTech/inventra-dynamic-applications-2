import type { KitchenAccessRequest } from "../../../types/teamAccess";
import Button from "../../ui/Button";
import approveIcon from "../../../assets/icons/aprovado.svg";
import rejectIcon from "../../../assets/icons/erro.svg";
import UserAvatar from "../../ui/UserAvatar";

interface AccessRequestListProps {
    requests: KitchenAccessRequest[];
    busyRequestId: string | null;
    onApprove: (request: KitchenAccessRequest) => void;
    onReject: (request: KitchenAccessRequest, trigger: HTMLButtonElement) => void;
}

const statusLabels: Record<KitchenAccessRequest["status"], string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
};

function formatDate(value: string | null): string {
    if (!value) return "Data indisponível";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Data indisponível";
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function initials(name: string): string {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => [...part][0]?.toLocaleUpperCase("pt-BR") ?? "").join("");
}

function AccessRequestList({ requests, busyRequestId, onApprove, onReject }: AccessRequestListProps) {
    if (requests.length === 0) {
        return (
            <section className="rounded-3xl bg-surface px-5 py-12 text-center shadow-history-card" aria-labelledby="pedidos-vazios-titulo">
                <h2 id="pedidos-vazios-titulo" className="font-k2d text-lg font-bold text-sidebar-text">Nenhum pedido encontrado</h2>
                <p className="mx-auto mt-2 max-w-105 font-k2d text-sm text-history-muted">Quando alguém solicitar entrada nesta cozinha, o pedido aparecerá aqui.</p>
            </section>
        );
    }

    return (
        <section aria-label="Pedidos de acesso" className="flex min-w-0 flex-col gap-3">
            {requests.map((request) => (
                <article className="flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6 xl:flex-row xl:items-center xl:justify-between" key={request.id}>
                    <div className="flex min-w-0 items-start gap-3">
                        <UserAvatar className="size-11 rounded-2xl text-sm" name={request.user.name} photoUrl={request.user.photoUrl} fallbackText={initials(request.user.name) || "?"} />
                        <div className="min-w-0">
                            <h2 className="wrap-anywhere font-k2d text-base font-bold text-sidebar-text">{request.user.name}</h2>
                            <p className="mt-0.5 wrap-anywhere font-k2d text-sm text-history-muted">{request.user.email}</p>
                            <p className="mt-2 wrap-anywhere font-k2d text-sm text-sidebar-text">Cozinha: {request.kitchen.name}</p>
                            <p className="mt-1 font-k2d text-sm text-history-muted">
                                Pedido em {formatDate(request.createdAt)}
                                {request.status === "PENDING" && request.expiresAt && <> · Expira em {formatDate(request.expiresAt)}</>}
                            </p>
                            {request.reason && request.status === "REJECTED" && (
                                <p className="mt-2 wrap-anywhere font-k2d text-sm text-history-muted">Motivo da rejeição: {request.reason}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 sm:justify-end">
                            <span className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 font-k2d text-sm font-bold ${request.status === "PENDING" ? "border-history-status-observation-text text-history-status-observation-text bg-history-status-observation-bg" : request.status === "APPROVED" ? "border-feedback-success text-feedback-success bg-feedback-success-bg" : "border-feedback-error text-feedback-error bg-feedback-error-bg"}`}>
                            {statusLabels[request.status]}
                        </span>
                        {request.status === "PENDING" && (
                            <div className="flex gap-2">
                                <Button
                                    variant="icon"
                                    type="button"
                                    className="min-h-11 rounded-xl border border-feedback-error/40 px-3 text-feedback-error hover:bg-feedback-error-bg focus-visible:outline-focus disabled:cursor-wait disabled:opacity-60"
                                    disabled={busyRequestId === request.id}
                                    onClick={(event) => onReject(request, event.currentTarget)}
                                >
                                    <img className="mr-2 size-4" src={rejectIcon} alt="" aria-hidden="true" />
                                    Rejeitar
                                </Button>
                                <Button
                                    variant="icon"
                                    type="button"
                                    className="min-h-11 rounded-xl bg-feedback-success px-3 font-k2d text-sm font-bold text-on-brand hover:brightness-95 focus-visible:outline-focus disabled:cursor-wait disabled:opacity-60"
                                    disabled={busyRequestId === request.id}
                                    onClick={() => onApprove(request)}
                                >
                                    <img className="mr-2 size-4 brightness-0 invert" src={approveIcon} alt="" aria-hidden="true" />
                                    Aprovar
                                </Button>
                            </div>
                        )}
                    </div>
                </article>
            ))}
        </section>
    );
}

export default AccessRequestList;
