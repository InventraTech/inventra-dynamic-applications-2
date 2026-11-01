import { useId } from "react";
import type { Supplier } from "../../../types/suppliers";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import Feedback from "../../ui/Feedback";
import SupplierAvatar from "./SupplierAvatar";
import SupplierStatusBadge from "./SupplierStatusBadge";

interface SupplierStatusDialogProps {
    open: boolean;
    supplier: Supplier | null;
    saving: boolean;
    error: string | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

function SupplierStatusDialog({ open, supplier, saving, error, onOpenChange, onConfirm }: SupplierStatusDialogProps) {
    const id = useId();
    const activating = supplier ? !supplier.active : false;

    return (
        <Dialog open={open && Boolean(supplier)} onOpenChange={onOpenChange} aria-labelledby={`${id}-title`} placement="top" className="max-w-xl">
            {supplier && <div className="grid min-w-0 gap-5 p-5 sm:p-7" aria-busy={saving}>
                <div>
                    <h2 id={`${id}-title`} className="font-k2d text-xl font-bold text-sidebar-text">{activating ? "Reativar fornecedor?" : "Desativar fornecedor?"}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-history-muted">
                        {activating
                            ? "O fornecedor voltará para a lista de ativos e ficará disponível para uso. CNPJ e contatos serão mantidos."
                            : "O fornecedor sairá da lista de ativos. O cadastro não será excluído e poderá ser reativado depois."}
                    </p>
                </div>

                <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-history-card-header p-4">
                    <SupplierAvatar supplier={supplier} />
                    <div className="min-w-0 flex-1">
                        <p className="wrap-anywhere font-k2d text-sm font-bold text-sidebar-text">{supplier.legalName}</p>
                        <p className="mt-1 text-xs text-history-muted">CNPJ {supplier.cnpj}</p>
                    </div>
                    <SupplierStatusBadge active={supplier.active} />
                </div>

                {error && <Feedback severity="error">{error}</Feedback>}
                {saving && <p className="sr-only" role="status" aria-live="polite">{activating ? "Reativando fornecedor…" : "Desativando fornecedor…"}</p>}

                <footer className="flex flex-wrap justify-end gap-2 border-t border-history-border pt-4">
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
                    <Button variant={activating ? "success" : "danger"} type="button" onClick={onConfirm} disabled={saving}>
                        {saving ? "Salvando…" : activating ? "Reativar fornecedor" : "Desativar fornecedor"}
                    </Button>
                </footer>
            </div>}
        </Dialog>
    );
}

export default SupplierStatusDialog;
