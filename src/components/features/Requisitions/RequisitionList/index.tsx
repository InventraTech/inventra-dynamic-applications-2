import { Link } from "react-router-dom";
import type { Requisition } from "../../../../types/requisitions";
import StatusBadge from "../../../ui/StatusBadge";
import { formatRequisitionCurrency, formatRequisitionDate, getRequisitionStatusPresentation, getRequisitionTypeLabel } from "../../../../utils/requisitionPresentation";

interface RequisitionListProps {
    requisitions: Requisition[];
    userId: string | null;
}

export default function RequisitionList({ requisitions, userId }: RequisitionListProps) {
    return (
        <ul className="grid min-w-0 list-none gap-3 p-0" aria-label="Requisições da cozinha">
            {requisitions.map((requisition) => {
                const status = getRequisitionStatusPresentation(requisition.status);
                const canContinue = requisition.status === "DRAFT" && requisition.requester.id === userId;
                return (
                    <li key={requisition.id}>
                        <Link
                            className="grid min-w-0 gap-3 rounded-2xl border border-history-border bg-surface p-4 text-ink shadow-history-card transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                            to={`/requisicoes/${requisition.id}`}
                            aria-label={`${canContinue ? "Continuar rascunho" : "Abrir requisição"} número ${requisition.id}, ${getRequisitionTypeLabel(requisition.type)}, ${status.label}`}
                        >
                            <span className="grid min-w-0 gap-2">
                                <span className="flex min-w-0 flex-wrap items-center gap-2">
                                    <span className="font-semibold">Requisição #{requisition.id} · {getRequisitionTypeLabel(requisition.type)}</span>
                                    <StatusBadge label={status.label} tone={status.tone} />
                                </span>
                                <span className="text-sm text-history-muted">{requisition.requester.name} · {formatRequisitionDate(requisition.createdAt)}</span>
                                <span className="min-w-0 text-sm text-history-muted wrap-anywhere">{requisition.itemNames.length ? requisition.itemNames.join(", ") : "Nenhum item adicionado"}</span>
                            </span>
                            <span className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                                <span className="text-sm font-semibold text-brand">{formatRequisitionCurrency(requisition.estimatedTotal)}</span>
                                <span className="font-semibold text-brand">{canContinue ? "Continuar rascunho →" : "Ver detalhes →"}</span>
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
