import type { Requisition } from "../../../types/requisitions";
import draftIcon from "../../../assets/icons/requisicao.svg";
import reviewIcon from "../../../assets/icons/historico.svg";
import approvedIcon from "../../../assets/icons/aprovado.svg";

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
        <ul className="grid list-none grid-cols-3 gap-2 p-0 sm:gap-3" aria-label="Resumo das requisições">
            {metrics.map((metric) => {
                const count = requisitions.filter(({ status }) => status === metric.status).length;
                return (
                    <li key={metric.status} className="flex min-w-0 items-center gap-2 rounded-2xl border border-history-border bg-surface p-2 shadow-history-card sm:gap-3 sm:px-4 sm:py-4">
                        <span className={"grid size-8 shrink-0 place-items-center rounded-xl sm:size-10 " + metric.tone} aria-hidden="true"><img className="size-4 sm:size-5" src={metric.icon} alt="" /></span>
                        <span className="grid min-w-0">
                            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2"><strong className="font-k2d text-lg leading-none sm:text-2xl">{count}</strong><span className="text-xs font-semibold leading-tight sm:text-sm">{metric.label}</span></span>
                            <span className="mt-1 hidden text-xs text-history-muted sm:block">{metric.detail}</span>
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
