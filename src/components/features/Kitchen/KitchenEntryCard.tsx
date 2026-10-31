import { useState } from "react";

import kitchenHexagon from "../../../assets/icons/hexagono-convite.svg";
import infoIcon from "../../../assets/icons/info.svg";
import successIcon from "../../../assets/icons/aprovado.svg";
import copyIcon from "../../../assets/icons/copiar-codigo.svg";
import peopleIcon from "../../../assets/icons/conta.svg";
import lockIcon from "../../../assets/icons/senha.svg";
import type { KitchenResponse } from "../../../types/kitchen";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Toggle from "../../ui/Toggle";
import KitchenSectionHeading from "./KitchenSectionHeading";

interface KitchenEntryCardProps {
    kitchen: KitchenResponse;
    canEdit: boolean;
    savingDiscovery: boolean;
    discoveryError: string | null;
    discoverySuccess: string | null;
    onDiscoveryChange: (enabled: boolean) => Promise<boolean>;
}

function KitchenEntryCard({ kitchen, canEdit, savingDiscovery, discoveryError, discoverySuccess, onDiscoveryChange }: KitchenEntryCardProps) {
    const [copyMessage, setCopyMessage] = useState<string | null>(null);
    const [copyError, setCopyError] = useState<string | null>(null);

    async function copyInviteCode() {
        try {
            await navigator.clipboard.writeText(kitchen.code);
            setCopyError(null);
            setCopyMessage("Código de convite copiado.");
        } catch {
            setCopyMessage(null);
            setCopyError("Não foi possível copiar automaticamente. Selecione o código e copie manualmente.");
        }
    }

    return (
        <section className="min-w-0 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5">
            <div className="grid min-w-0 gap-4">
                <KitchenSectionHeading icon={peopleIcon} title="Entrada de pessoas" description="O código e a descoberta decidem como o time encontra a cozinha." />

                <div className="grid min-w-0 gap-3 rounded-2xl bg-history-card-header p-3 sm:p-4">
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <h3 className="m-0 font-k2d text-base font-bold text-ink sm:text-lg">Código de convite</h3>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sidebar-active px-2.5 py-1 font-k2d text-xs font-bold text-sidebar-purple sm:text-sm">
                                <img src={lockIcon} alt="" aria-hidden="true" className="size-4" /> Somente leitura
                            </span>
                        </div>
                        <Button variant="outline" type="button" onClick={() => void copyInviteCode()} aria-label="Copiar código de convite">
                            <img src={copyIcon} alt="" aria-hidden="true" className="size-4" />
                            Copiar código
                        </Button>
                    </div>

                    <ol className="m-0 flex min-w-0 flex-wrap gap-1.5 p-0 sm:gap-2" aria-label="Código de convite">
                        {[...kitchen.code].map((character, index) => (
                            <li key={`${character}-${index}`} className="relative grid h-12 w-10 shrink-0 place-items-center sm:h-14 sm:w-11">
                                <img src={kitchenHexagon} alt="" aria-hidden="true" className="absolute inset-0 size-full" />
                                <span className="relative z-10 font-k2d text-xl font-bold text-sidebar-purple sm:text-2xl">{character}</span>
                            </li>
                        ))}
                    </ol>
                    <p className="m-0 text-sm leading-snug text-history-muted">Seis caracteres gerados pelo Inventra. O código não pode ser alterado nem renovado.</p>
                    {copyMessage && <Feedback severity="success"><img src={successIcon} alt="" aria-hidden="true" />{copyMessage}</Feedback>}
                    {copyError && <Feedback severity="error">{copyError}</Feedback>}
                </div>

                <div className="grid min-w-0 gap-3">
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                        <div className="grid min-w-0 gap-1">
                            <h3 className="m-0 font-k2d text-base font-bold text-ink sm:text-lg">Aparecer na descoberta</h3>
                            <p className="m-0 text-sm leading-snug text-history-muted">{canEdit ? "A alteração é salva imediatamente. Só supervisores podem mudar esta opção." : "Somente supervisores podem alterar a descoberta da cozinha."}</p>
                        </div>
                        <Toggle
                            enabled={kitchen.acceptingRequests}
                            ariaLabel="Aparecer na descoberta e aceitar pedidos de entrada"
                            disabled={!canEdit || savingDiscovery || !kitchen.active}
                            onToggle={() => void onDiscoveryChange(!kitchen.acceptingRequests)}
                        />
                    </div>

                    <div className="grid min-w-0 gap-2 md:grid-cols-2">
                        <div className={`flex min-w-0 items-start gap-2.5 rounded-xl border p-3 ${kitchen.acceptingRequests ? "border-feedback-success/30 bg-feedback-success-bg" : "border-history-border bg-history-card-header"}`}>
                            <img src={successIcon} alt="" aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                            <p className="m-0 min-w-0 text-sm leading-snug text-ink">
                                <strong className="block font-k2d text-feedback-success">Ligado</strong>
                                A cozinha aparece na busca e aceita pedidos de entrada.
                            </p>
                        </div>
                        <div className={`flex min-w-0 items-start gap-2.5 rounded-xl border p-3 ${!kitchen.acceptingRequests ? "border-feedback-info/30 bg-feedback-info-bg" : "border-history-border bg-history-card-header"}`}>
                            <img src={infoIcon} alt="" aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                            <p className="m-0 min-w-0 text-sm leading-snug text-ink">
                                <strong className="block font-k2d text-sidebar-purple">Desligado</strong>
                                Some da busca; o código de convite continua aceitando pedidos.
                            </p>
                        </div>
                    </div>
                    {!kitchen.active && <Feedback severity="info">A descoberta só pode ser alterada enquanto a cozinha estiver ativa.</Feedback>}
                    {discoveryError && <Feedback severity="error">{discoveryError}</Feedback>}
                    {discoverySuccess && <Feedback severity="success">{discoverySuccess}</Feedback>}
                    {savingDiscovery && <p role="status" aria-live="polite" className="sr-only">Salvando preferência de descoberta…</p>}
                </div>
            </div>
        </section>
    );
}

export default KitchenEntryCard;
