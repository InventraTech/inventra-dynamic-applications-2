import { useState } from "react";
import type { Inventory } from "../../../../types/inventory";
import { formatInventoryDate } from "../../../../utils/inventoryPresentation";
import Button from "../../../ui/Button/index";
import Feedback from "../../../ui/Feedback/index";
import InventoryDecisionDialog, { type InventoryDecision } from "../InventoryDecisionDialog/index";

interface InventoryLifecyclePanelProps {
    inventory: Inventory;
    count: number;
    saving: boolean;
    action: "count" | "remove-count" | "close" | "cancel" | null;
    error: string | null;
    success: string | null;
    onClose: () => Promise<boolean>;
    onCancel: () => Promise<boolean>;
    onClearFeedback: () => void;
}

export default function InventoryLifecyclePanel({ inventory, count, saving, action, error, success, onClose, onCancel, onClearFeedback }: InventoryLifecyclePanelProps) {
    const [decision, setDecision] = useState<InventoryDecision | null>(null);

    function requestDecision(nextDecision: InventoryDecision) {
        onClearFeedback();
        setDecision(nextDecision);
    }

    return (
        <>
            <section className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5" aria-labelledby="inventory-lifecycle-heading">
                <div className="grid min-w-0 gap-2">
                    <h2 id="inventory-lifecycle-heading" className="m-0 font-k2d text-lg font-bold text-ink">{inventory.status === "OPEN" ? "Encerrar inventário" : "Situação do inventário"}</h2>
                    {inventory.status === "OPEN" ? <p className="m-0 text-sm leading-relaxed text-history-muted">Fechar aplica a divergência ao saldo atual. Cancelar encerra sem alterar o estoque.</p> : (
                        <Feedback severity={inventory.status === "CLOSED" ? "success" : "info"}>
                            {inventory.status === "CLOSED"
                                ? `Fechado em ${formatInventoryDate(inventory.closedAt, { hour: "2-digit", minute: "2-digit" })}. As divergências foram aplicadas ao estoque.`
                                : `Cancelado em ${formatInventoryDate(inventory.closedAt, { hour: "2-digit", minute: "2-digit" })}. Nenhuma divergência foi aplicada.`}
                        </Feedback>
                    )}
                </div>

                {inventory.status === "OPEN" && <>
                    <div className="grid min-w-0 gap-2">
                        <Button variant="standard" type="button" disabled={saving || count === 0} onClick={() => requestDecision("close")}>
                            {saving && action === "close" ? "Fechando…" : "Fechar inventário"}
                        </Button>
                        <p className="m-0 text-xs leading-relaxed text-history-muted">{count === 0 ? "Registre pelo menos uma contagem para poder fechar." : `${count} ${count === 1 ? "lote contado" : "lotes contados"}. O saldo é ajustado pela divergência, com piso em zero.`}</p>
                    </div>
                    <div className="grid min-w-0 gap-2 border-t border-history-border pt-4">
                        <h3 className="m-0 font-k2d text-base font-bold text-feedback-error">Cancelar inventário</h3>
                        <p className="m-0 text-sm leading-relaxed text-history-muted">As divergências ficam sem efeito no saldo. O registro passa para o histórico como cancelado.</p>
                        <Button variant="subtle-danger" type="button" disabled={saving} onClick={() => requestDecision("cancel")}>
                            {saving && action === "cancel" ? "Cancelando…" : "Cancelar inventário"}
                        </Button>
                    </div>
                </>}

                {!decision && inventory.status === "OPEN" && (action === "close" || action === "cancel") && error && <Feedback severity="error">{error}</Feedback>}
                {inventory.status === "OPEN" && (action === "close" || action === "cancel") && success && <Feedback severity="success">{success}</Feedback>}
            </section>

            <InventoryDecisionDialog
                decision={decision}
                count={count}
                saving={saving && (action === "close" || action === "cancel")}
                error={decision && action === decision ? error : null}
                onOpenChange={(open) => { if (!open) setDecision(null); }}
                onConfirm={decision === "close" ? onClose : onCancel}
            />
        </>
    );
}
