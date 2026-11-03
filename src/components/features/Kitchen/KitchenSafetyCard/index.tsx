import { useLeaveKitchen } from "../../../../hooks/useLeaveKitchen";
import { useState } from "react";

import warningIcon from "../../../../assets/icons/alerta.svg";
import exitIcon from "../../../../assets/icons/remover-membro.svg";
import type { KitchenResponse } from "../../../../types/kitchen";
import Button from "../../../ui/Button/index";
import Dialog from "../../../ui/Dialog/index";
import Feedback from "../../../ui/Feedback/index";
import KitchenSectionHeading from "../KitchenSectionHeading/index";

interface KitchenSafetyCardProps {
    kitchen: KitchenResponse;
    canEdit: boolean;
    saving: boolean;
    error: string | null;
    success: string | null;
    onStatusChange: (active: boolean) => Promise<boolean>;
}

function KitchenSafetyCard({ kitchen, canEdit, saving, error, success, onStatusChange }: KitchenSafetyCardProps) {
    const leaveAction = useLeaveKitchen();
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);

    async function confirmAction() {
        const succeeded = await onStatusChange(false);
        if (succeeded) setConfirmDeactivate(false);
    }

    return (
        <section className="grid min-w-0 gap-3 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5">
            <KitchenSectionHeading icon={warningIcon} title="Zona de cuidado" description="Ações que mudam o acesso ao time. A desativação pede confirmação." />

            <div className="flex min-w-0 flex-col gap-3 border-b border-history-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-feedback-error-bg">
                        <img src={warningIcon} alt="" aria-hidden="true" className="size-5" />
                    </span>
                    <div className="grid min-w-0 gap-1.5">
                        <h3 className="m-0 flex min-w-0 flex-wrap items-center gap-2 font-k2d text-base font-bold text-ink sm:text-lg">
                            {kitchen.active ? "Desativar cozinha" : "Cozinha desativada"}
                            <span className="rounded-full bg-sidebar-active px-2.5 py-0.5 font-k2d text-xs font-bold text-sidebar-purple">Só supervisor</span>
                        </h3>
                        <p className="m-0 text-sm leading-snug text-history-muted">
                            {kitchen.active
                                ? "A cozinha some da descoberta e os pedidos pendentes ficam parados até ser reativada. A equipe e o histórico continuam como estão."
                                : "A cozinha não aparece na descoberta e pedidos pendentes ficam parados. Supervisores podem reativá-la a qualquer momento."}
                        </p>
                    </div>
                </div>
                {canEdit && (kitchen.active
                    ? <Button variant="outline" className="w-full shrink-0 border-feedback-error text-feedback-error hover:bg-feedback-error-bg sm:w-auto" type="button" onClick={() => setConfirmDeactivate(true)} disabled={saving}>Desativar cozinha</Button>
                    : <Button variant="standard" className="w-full shrink-0 sm:w-auto" type="button" onClick={() => void onStatusChange(true)} disabled={saving}>{saving ? "Reativando…" : "Reativar cozinha"}</Button>)}
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-feedback-error-bg">
                        <img src={exitIcon} alt="" aria-hidden="true" className="size-5" />
                    </span>
                    <div className="grid min-w-0 gap-1.5">
                        <h3 className="m-0 flex min-w-0 flex-wrap items-center gap-2 font-k2d text-base font-bold text-ink sm:text-lg">
                            Sair da cozinha

                        </h3>
                        <p className="m-0 text-sm leading-snug text-history-muted">Sua conta e seu histórico são mantidos. Seus rascunhos nesta cozinha são cancelados. O último supervisor precisa promover outro membro ou desativar a cozinha antes de sair.</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full shrink-0 sm:w-auto" type="button" onClick={() => setConfirmLeave(true)}>Sair da cozinha</Button>
            </div>
            <Dialog open={confirmLeave} onOpenChange={setConfirmLeave} aria-labelledby="leave-kitchen-title"><div className="space-y-4 p-6"><h2 id="leave-kitchen-title" className="text-xl font-bold">Sair da cozinha?</h2><p>Você perderá acesso aos dados desta cozinha e seus rascunhos serão cancelados. Sua conta será mantida.</p>{leaveAction.error && <Feedback severity="error">{leaveAction.error}</Feedback>}<div className="flex flex-wrap justify-end gap-3"><Button variant="outline" disabled={leaveAction.saving} onClick={() => setConfirmLeave(false)}>Cancelar</Button><Button variant="danger" disabled={leaveAction.saving} onClick={() => void leaveAction.leave()}>{leaveAction.saving ? "Saindo…" : "Confirmar saída"}</Button></div></div></Dialog>
            {error && !confirmDeactivate && <Feedback severity="error">{error}</Feedback>}
            {success && <Feedback severity="success">{success}</Feedback>}
            {saving && <p role="status" aria-live="polite" className="sr-only">Atualizando situação da cozinha…</p>}

            <Dialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate} aria-labelledby="kitchen-deactivate-title" aria-describedby="kitchen-deactivate-description">
                <div className="grid min-w-0 gap-4 p-5 sm:p-6">
                    <div className="grid size-12 place-items-center rounded-full bg-feedback-error-bg">
                        <img src={warningIcon} alt="" aria-hidden="true" className="size-6" />
                    </div>
                    <div className="grid min-w-0 gap-2">
                        <h2 id="kitchen-deactivate-title" className="m-0 font-k2d text-lg font-bold text-ink sm:text-xl">Desativar esta cozinha?</h2>
                        <p id="kitchen-deactivate-description" className="m-0 text-sm leading-snug text-history-muted">Ela deixará de aparecer na descoberta. Os pedidos de entrada pendentes ficarão parados, e a equipe e o histórico serão mantidos. Você poderá reativá-la depois.</p>
                    </div>
                    {error && <Feedback severity="error">{error}</Feedback>}
                    <div className="flex min-w-0 flex-wrap justify-end gap-3">
                        <Button variant="outline" type="button" onClick={() => setConfirmDeactivate(false)} disabled={saving} autoFocus>Cancelar</Button>
                        <Button variant="danger" type="button" onClick={() => void confirmAction()} disabled={saving}>{saving ? "Desativando…" : "Confirmar desativação"}</Button>
                    </div>
                </div>
            </Dialog>
        </section>
    );
}

export default KitchenSafetyCard;
