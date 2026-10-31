import { useState } from "react";

import warningIcon from "../../../assets/icons/alerta.svg";
import exitIcon from "../../../assets/icons/remover-membro.svg";
import type { KitchenResponse } from "../../../types/kitchen";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import Feedback from "../../ui/Feedback";
import KitchenSectionHeading from "./KitchenSectionHeading";

interface KitchenSafetyCardProps {
    kitchen: KitchenResponse;
    canEdit: boolean;
    saving: boolean;
    error: string | null;
    onStatusChange: (active: boolean) => Promise<boolean>;
}

function KitchenSafetyCard({ kitchen, canEdit, saving, error, onStatusChange }: KitchenSafetyCardProps) {
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);

    async function confirmAction() {
        const succeeded = await onStatusChange(false);
        if (succeeded) setConfirmDeactivate(false);
    }

    return (
        <section className="grid min-w-0 gap-5 rounded-4xl bg-surface p-5 shadow-history-card sm:p-8">
            <KitchenSectionHeading icon={warningIcon} title="Zona de cuidado" description="Ações que mudam o acesso ao time. A desativação pede confirmação." />

            <div className="flex min-w-0 flex-col gap-4 border-b border-history-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-feedback-error-bg">
                        <img src={warningIcon} alt="" aria-hidden="true" className="size-7" />
                    </span>
                    <div className="grid min-w-0 gap-2">
                        <h3 className="m-0 flex min-w-0 flex-wrap items-center gap-2 font-k2d text-lg font-bold text-ink sm:text-xl">
                            {kitchen.active ? "Desativar cozinha" : "Cozinha desativada"}
                            <span className="rounded-full bg-sidebar-active px-3 py-1 font-k2d text-xs font-bold text-sidebar-purple">Só supervisor</span>
                        </h3>
                        <p className="m-0 text-sm leading-relaxed text-history-muted">
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

            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-feedback-error-bg">
                        <img src={exitIcon} alt="" aria-hidden="true" className="size-7" />
                    </span>
                    <div className="grid min-w-0 gap-2">
                        <h3 className="m-0 flex min-w-0 flex-wrap items-center gap-2 font-k2d text-lg font-bold text-ink sm:text-xl">
                            Sair da cozinha
                            <span className="rounded-full bg-history-card-header px-3 py-1 font-k2d text-xs font-bold text-history-muted">Indisponível</span>
                        </h3>
                        <p className="m-0 text-sm leading-relaxed text-history-muted">A API atual não permite remover a associação da sua conta à cozinha. Nenhuma ação será simulada.</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full shrink-0 sm:w-auto" type="button" disabled aria-describedby="kitchen-leave-unavailable">Sair da cozinha</Button>
            </div>
            <p id="kitchen-leave-unavailable" className="sr-only">Função indisponível: o backend ainda não oferece uma operação para sair da cozinha.</p>
            {error && <Feedback severity="error">{error}</Feedback>}
            {saving && <p role="status" aria-live="polite" className="sr-only">Atualizando situação da cozinha…</p>}

            <Dialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate} aria-labelledby="kitchen-deactivate-title" aria-describedby="kitchen-deactivate-description">
                <div className="grid min-w-0 gap-5 p-6 sm:p-8">
                    <div className="grid size-14 place-items-center rounded-full bg-feedback-error-bg">
                        <img src={warningIcon} alt="" aria-hidden="true" className="size-7" />
                    </div>
                    <div className="grid min-w-0 gap-2">
                        <h2 id="kitchen-deactivate-title" className="m-0 font-k2d text-xl font-bold text-ink sm:text-2xl">Desativar esta cozinha?</h2>
                        <p id="kitchen-deactivate-description" className="m-0 text-sm leading-relaxed text-history-muted">Ela deixará de aparecer na descoberta. Os pedidos de entrada pendentes ficarão parados, e a equipe e o histórico serão mantidos. Você poderá reativá-la depois.</p>
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
