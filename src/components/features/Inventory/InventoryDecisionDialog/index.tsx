import { useId } from "react";
import Button from "../../../ui/Button/index";
import Dialog from "../../../ui/Dialog/index";
import Feedback from "../../../ui/Feedback/index";

export type InventoryDecision = "close" | "cancel";

interface InventoryDecisionDialogProps {
    decision: InventoryDecision | null;
    count: number;
    saving: boolean;
    error: string | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<boolean>;
}

export default function InventoryDecisionDialog({ decision, count, saving, error, onOpenChange, onConfirm }: InventoryDecisionDialogProps) {
    const id = useId();
    const closing = decision === "close";

    async function confirm() {
        if (decision && await onConfirm()) onOpenChange(false);
    }

    return (
        <Dialog open={Boolean(decision)} onOpenChange={onOpenChange} aria-labelledby={`${id}-title`} placement="top" className="max-w-xl">
            {decision && <div className="grid min-w-0 gap-4 p-5 sm:p-6" aria-busy={saving}>
                <header className="grid min-w-0 gap-1">
                    <h2 id={`${id}-title`} className={`m-0 font-k2d text-xl font-bold ${closing ? "text-ink" : "text-feedback-error"}`}>{closing ? "Fechar inventário?" : "Cancelar inventário?"}</h2>
                    <p className="m-0 text-sm leading-relaxed text-history-muted">
                        {closing
                            ? `O fechamento vai aplicar as divergências das ${count} ${count === 1 ? "contagem registrada" : "contagens registradas"} ao saldo atual de cada lote. A quantidade física não substitui o saldo; valores abaixo de zero ficam em zero.`
                            : "O inventário será marcado como cancelado. As contagens permanecem no registro, mas nenhuma divergência será aplicada ao estoque."}
                    </p>
                </header>
                <Feedback severity={closing ? "info" : "error"}>
                    {closing ? "Esta ação encerra a contagem e atualiza os saldos dos lotes." : "Esta ação não pode ser desfeita e não altera os saldos do estoque."}
                </Feedback>
                {error && <Feedback severity="error">{error}</Feedback>}
                {saving && <p className="sr-only" role="status" aria-live="polite">{closing ? "Fechando inventário…" : "Cancelando inventário…"}</p>}
                <footer className="flex min-w-0 flex-wrap justify-end gap-2 border-t border-history-border pt-4">
                    <Button variant="outline" type="button" disabled={saving} onClick={() => onOpenChange(false)}>Voltar</Button>
                    <Button variant={closing ? "standard" : "danger"} type="button" disabled={saving || (closing && count === 0)} onClick={() => void confirm()}>
                        {saving ? "Processando…" : closing ? "Fechar inventário" : "Cancelar inventário"}
                    </Button>
                </footer>
            </div>}
        </Dialog>
    );
}
