import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useInventories from "../../../../hooks/useInventories";
import useOpenInventory from "../../../../hooks/useOpenInventory";
import type { Inventory } from "../../../../types/inventory";
import { formatInventoryDate } from "../../../../utils/inventoryPresentation";
import Button from "../../../ui/Button/index";
import Feedback from "../../../ui/Feedback/index";
import InventoryHero from "../InventoryHero/index";
import InventoryHistoryTable from "../InventoryHistoryTable/index";
import InventoryOpenDialog from "../InventoryOpenDialog/index";
import InventoryOverview from "../InventoryOverview/index";
import InventoryListSkeleton from "../InventoryListSkeleton/index";

interface InventoryListProps {
    kitchenId: number | null;
    kitchenName: string | null;
}

export default function InventoryList({ kitchenId, kitchenName }: InventoryListProps) {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);
    const inventories = useInventories(kitchenId);
    const activeInventory = inventories.data.find((inventory) => inventory.status === "OPEN") ?? null;
    const onOpened = useCallback((inventory: Inventory) => navigate(`/inventarios/${inventory.id}`), [navigate]);
    const opening = useOpenInventory(kitchenId, onOpened);

    if (kitchenId === null || kitchenName === null) {
        return (
            <div className="grid justify-items-center gap-3 px-4 py-12 text-center sm:px-6">
                <span className="grid size-14 place-items-center rounded-2xl bg-sidebar-active text-2xl text-sidebar-purple" aria-hidden="true">⌂</span>
                <h2 className="m-0 font-k2d text-xl font-bold text-ink">Sua conta ainda não tem uma cozinha</h2>
                <p className="m-0 max-w-prose text-sm leading-relaxed text-history-muted">Entre em uma cozinha para consultar e registrar inventários dos lotes dela.</p>
                <Link to="/cozinha" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-sidebar-indicator bg-surface px-4 py-2 font-k2d text-sm font-bold text-sidebar-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Abrir cozinha</Link>
            </div>
        );
    }

    if (inventories.loading && inventories.data.length === 0) {
        return <div aria-busy="true"><p className="sr-only" role="status" aria-live="polite">Carregando inventários da cozinha…</p><InventoryListSkeleton /></div>;
    }

    return (
        <div className="grid min-w-0 gap-4 px-4 pb-8 pt-5 sm:gap-5 sm:px-6 sm:pt-6">
            <InventoryHero
                kitchenName={kitchenName}
                title="Inventários da cozinha"
                description="Confira a quantidade física por lote. O saldo só muda quando você fecha o inventário."
                actions={activeInventory ? (
                    <>
                        <Link to={`/inventarios/${activeInventory.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-login-gold px-4 py-2.5 font-k2d text-sm font-bold text-brand-strong hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand">Retomar inventário <span className="sr-only">#{activeInventory.id}</span></Link>
                        <Button variant="outline" type="button" disabled aria-describedby="inventory-open-limit" className="border-white/30 bg-white/10 text-on-brand hover:bg-white/15">Novo inventário</Button>
                        <span id="inventory-open-limit" className="sr-only">Feche ou cancele o inventário aberto antes de iniciar outro.</span>
                    </>
                ) : (
                    <Button variant="accent" type="button" onClick={() => { opening.clearFeedback(); setDialogOpen(true); }}>Novo inventário</Button>
                )}
            />

            {inventories.error && <section className="grid min-w-0 gap-3 rounded-3xl bg-surface p-5 shadow-history-card" aria-labelledby="inventory-load-error-title">
                <h2 id="inventory-load-error-title" className="m-0 font-k2d text-lg font-bold text-ink">Não foi possível carregar o histórico</h2>
                <Feedback severity="error">{inventories.error}</Feedback>
                <Button variant="outline" type="button" className="w-fit" onClick={inventories.retry}>Tentar novamente</Button>
            </section>}

            {!inventories.error && <>
                <InventoryOverview inventories={inventories.data} />
                {inventories.loading && <p className="m-0 text-sm text-history-muted" role="status" aria-live="polite">Atualizando histórico…</p>}
                {activeInventory && <section className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-3xl bg-sidebar-active p-4 text-sidebar-text sm:px-5" aria-label="Inventário aberto">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 shrink-0 text-lg text-sidebar-purple" aria-hidden="true">◷</span>
                        <div className="min-w-0">
                            <h2 className="m-0 font-k2d text-base font-bold">Inventário #{activeInventory.id} está aberto desde {formatInventoryDate(activeInventory.startedAt, { hour: "2-digit", minute: "2-digit" })}</h2>
                            <p className="m-0 mt-1 text-sm leading-relaxed text-history-muted">Responsável: {activeInventory.responsible.name}. Só pode haver um inventário aberto por vez nesta cozinha.</p>
                        </div>
                    </div>
                    <Link to={`/inventarios/${activeInventory.id}`} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-sidebar-indicator bg-surface px-4 py-2 font-k2d text-sm font-bold text-sidebar-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Retomar</Link>
                </section>}
                <InventoryHistoryTable inventories={inventories.data} />
            </>}

            {opening.success && <Feedback severity="success">{opening.success}</Feedback>}
            <InventoryOpenDialog open={dialogOpen} saving={opening.saving} error={opening.error} onOpenChange={setDialogOpen} onSubmit={opening.submit} />
        </div>
    );
}
