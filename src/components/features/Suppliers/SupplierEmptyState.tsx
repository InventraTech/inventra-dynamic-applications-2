import Button from "../../ui/Button";
import Mascote from "../../ui/Mascot";

interface SupplierEmptyStateProps {
    title: string;
    description: string;
    canCreate: boolean;
    onCreate: () => void;
}

function SupplierEmptyState({ title, description, canCreate, onCreate }: SupplierEmptyStateProps) {
    return (
        <section className="grid min-w-0 justify-items-center gap-3 rounded-3xl bg-surface px-5 py-10 text-center shadow-history-card sm:px-8" aria-labelledby="supplier-empty-title">
            <Mascote size="compacto" className="mb-1" />
            <h2 id="supplier-empty-title" className="font-k2d text-lg font-bold text-sidebar-text">{title}</h2>
            <p className="max-w-xl text-sm leading-relaxed text-history-muted">{description}</p>
            {canCreate && <Button variant="standard" type="button" onClick={onCreate}>Cadastrar primeiro fornecedor</Button>}
        </section>
    );
}

export default SupplierEmptyState;
