import type { Requisition } from "../../../../types/requisitions";
import draftIcon from "../../../../assets/icons/requisicao.svg";
import reviewIcon from "../../../../assets/icons/solicitacao.svg";
import approvedIcon from "../../../../assets/icons/aprovado.svg";

interface RequisitionMetricsProps {
    requisitions: Requisition[];
}

const metrics = [
    { status: "DRAFT", label: "Rascunhos", detail: "Prontos para continuar", icon: draftIcon, tone: "bg-sidebar-active" },
    { status: "UNDER_REVIEW", label: "Em análise", detail: "Aguardando o supervisor", icon: reviewIcon, tone: "bg-history-status-observation-bg" },
    { status: "APPROVED", label: "Aprovadas", detail: "Decisão registrada", icon: approvedIcon, tone: "bg-feedback-success-bg" },
] as const;

export default function RequisitionMetrics({ requisitions }: RequisitionMetricsProps) {
    return (
        <ul className="grid list-none gap-3 p-0 sm:grid-cols-3" aria-label="Resumo das requisições">
            {metrics.map((metric) => {
                const count = requisitions.filter(({ status }) => status === metric.status).length;
                return (
                    <li key={metric.status} className="flex min-w-0 items-center gap-3 rounded-2xl border border-history-border bg-surface p-4 shadow-history-card">
                        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${metric.tone}`} aria-hidden="true"><img className="size-5" src={metric.icon} alt="" /></span>
                        <span className="grid min-w-0">
                            <span className="flex flex-wrap items-baseline gap-2"><strong className="text-xl leading-none">{count}</strong><span className="font-semibold">{metric.label}</span></span>
                            <span className="mt-1 text-sm text-history-muted">{metric.detail}</span>
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
