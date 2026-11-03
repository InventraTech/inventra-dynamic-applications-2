import { useId } from "react";
import type { InventoryCount } from "../../../../types/inventory";
import Button from "../../../ui/Button/index";
import Dialog from "../../../ui/Dialog/index";
import Feedback from "../../../ui/Feedback/index";

interface InventoryCountRemovalDialogProps {
    count: InventoryCount | null;
    lotLabel: string;
    saving: boolean;
    error: string | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<boolean>;
}

export default function InventoryCountRemovalDialog({ count, lotLabel, saving, error, onOpenChange, onConfirm }: InventoryCountRemovalDialogProps) {
    const id = useId();

    async function confirm() {
        if (count && await onConfirm()) onOpenChange(false);
    }

    return (
        <Dialog open={Boolean(count)} onOpenChange={onOpenChange} aria-labelledby={`${id}-title`} placement="top" className="max-w-lg">
            {count && <div className="grid min-w-0 gap-4 p-5 sm:p-6" aria-busy={saving}>
                <header className="grid min-w-0 gap-1">
                    <h2 id={`${id}-title`} className="m-0 font-k2d text-xl font-bold text-ink">Remover esta contagem?</h2>
                    <p className="m-0 text-sm leading-relaxed text-history-muted">A contagem do lote será removida do inventário aberto. O saldo não muda; depois você poderá registrar uma nova contagem para este lote.</p>
                </header>
                <div className="grid min-w-0 gap-1 rounded-2xl bg-history-card-header p-4">
                    <p className="m-0 font-semibold text-ink wrap-anywhere">{lotLabel}</p>
                    <p className="m-0 text-sm text-history-muted">Registro de contagem #{count.id} · Lote {count.batch.batchNumber}</p>
                </div>
                {error && <Feedback severity="error">{error}</Feedback>}
                {saving && <p className="sr-only" role="status" aria-live="polite">Removendo contagem…</p>}
                <footer className="flex min-w-0 flex-wrap justify-end gap-2 border-t border-history-border pt-4">
                    <Button variant="outline" type="button" disabled={saving} onClick={() => onOpenChange(false)}>Manter contagem</Button>
                    <Button variant="subtle-danger" type="button" disabled={saving} onClick={() => void confirm()}>{saving ? "Removendo…" : "Remover contagem"}</Button>
                </footer>
            </div>}
        </Dialog>
    );
}
