import supplierIcon from "../../../assets/icons/fornecedor.svg";
import approvedIcon from "../../../assets/icons/aprovado.svg";

interface SupplierSummaryProps {
    activeCount: number;
    inactiveCount: number | null;
}

function SupplierSummary({ activeCount, inactiveCount }: SupplierSummaryProps) {
    const total = inactiveCount === null ? activeCount : activeCount + inactiveCount;
    const cards = [
        {
            title: "Fornecedores",
            value: total,
            description: inactiveCount === null ? "Cadastros ativos disponíveis" : "Cadastros carregados",
            icon: <img className="size-6" src={supplierIcon} alt="" aria-hidden="true" />,
            tone: "text-brand",
        },
        {
            title: "Ativos",
            value: activeCount,
            description: "Disponíveis para uso",
            icon: <img className="size-6" src={approvedIcon} alt="" aria-hidden="true" />,
            tone: "text-feedback-success",
        },
        {
            title: "Inativos",
            value: inactiveCount ?? "—",
            description: inactiveCount === null ? "Consulta exclusiva de supervisor" : "Podem ser reativados",
            icon: <span className="flex items-center gap-1" aria-hidden="true"><span className="h-4 w-1.5 rounded-sm bg-current" /><span className="h-4 w-1.5 rounded-sm bg-current" /></span>,
            tone: inactiveCount === null ? "text-history-muted" : "text-history-muted",
        },
    ];

    return (
        <section className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Resumo de fornecedores">
            {cards.map((card) => (
                <article className="flex min-w-0 items-center gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5" key={card.title}>
                    <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-history-card-header ${card.tone}`}>
                        {card.icon}
                    </span>
                    <div className="min-w-0">
                        <p className="flex flex-wrap items-baseline gap-x-2 font-k2d text-sm font-semibold text-sidebar-text">
                            <span className="text-2xl font-bold leading-none tabular-nums">{card.value}</span>
                            {card.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-history-muted">{card.description}</p>
                    </div>
                </article>
            ))}
        </section>
    );
}

export default SupplierSummary;
