interface SupplierStatusBadgeProps {
    active: boolean;
}

function SupplierStatusBadge({ active }: SupplierStatusBadgeProps) {
    return (
        <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 py-1 font-k2d text-xs font-bold ${active ? "bg-feedback-success-bg text-feedback-success" : "bg-history-card-header text-history-muted"}`}>
            <span className={`size-2 shrink-0 rounded-full ${active ? "bg-feedback-success" : "bg-history-muted"}`} aria-hidden="true" />
            {active ? "Ativo" : "Inativo"}
        </span>
    );
}

export default SupplierStatusBadge;
