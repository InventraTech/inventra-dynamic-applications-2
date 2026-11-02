import { useMemo, useState } from "react";
import type { InventoryBatch, InventoryCount } from "../../../types/inventory";
import type { KitchenStockItem } from "../../../types/stock";
import { formatInventoryQuantity } from "../../../utils/inventoryPresentation";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import StatusBadge from "../../ui/StatusBadge";
import InventoryCountRemovalDialog from "./InventoryCountRemovalDialog";

interface InventoryCountsTableProps {
    counts: InventoryCount[];
    batches: InventoryBatch[];
    products: KitchenStockItem[];
    canEdit: boolean;
    saving: boolean;
    error: string | null;
    onRemove: (countId: number) => Promise<boolean>;
}

function getDifferenceLabel(value: number, unit: string) {
    if (value < 0) return `Faltou ${formatInventoryQuantity(Math.abs(value))} ${unit}`;
    if (value > 0) return `Sobrou ${formatInventoryQuantity(value)} ${unit}`;
    return `Sem divergência · 0 ${unit}`;
}

export default function InventoryCountsTable({ counts, batches, products, canEdit, saving, error, onRemove }: InventoryCountsTableProps) {
    const [selectedCount, setSelectedCount] = useState<InventoryCount | null>(null);
    const batchById = useMemo(() => new Map(batches.map((batch) => [batch.id, batch])), [batches]);
    const productById = useMemo(() => new Map(products.map((item) => [item.product.id, item])), [products]);
    const selectedBatch = selectedCount ? batchById.get(selectedCount.batch.id) : undefined;
    const selectedProductName = selectedBatch?.product.name ?? `Lote ${selectedCount?.batch.batchNumber ?? ""}`;

    return (
        <section className="grid min-w-0 overflow-hidden rounded-3xl bg-surface shadow-history-card" aria-labelledby="inventory-counts-heading">
            <header className="flex min-w-0 flex-wrap items-baseline justify-between gap-2 p-4 sm:p-5">
                <div className="grid min-w-0 gap-1">
                    <h2 id="inventory-counts-heading" className="m-0 font-k2d text-lg font-bold text-ink sm:text-xl">Contagens registradas</h2>
                    <p className="m-0 text-sm text-history-muted">O saldo do sistema é o valor capturado quando cada lote foi contado.</p>
                </div>
                <span className="text-sm text-history-muted">{counts.length} {counts.length === 1 ? "lote contado" : "lotes contados"}</span>
            </header>

            {counts.length === 0 ? <div className="grid justify-items-center gap-2 border-t border-history-border px-5 py-9 text-center">
                <p className="m-0 font-semibold text-ink">Nenhum lote foi contado ainda</p>
                <p className="m-0 max-w-prose text-sm leading-relaxed text-history-muted">Selecione um lote, informe a quantidade física e registre a primeira contagem.</p>
            </div> : <div className="min-w-0 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus" tabIndex={0} aria-label="Tabela rolável das contagens registradas">
                <table className="w-full min-w-240 border-collapse text-left">
                    <caption className="sr-only">Contagens do inventário, com quantidade no sistema, quantidade física, divergência e possibilidade de remoção enquanto aberto.</caption>
                    <thead className="bg-history-card-header text-xs font-semibold text-history-muted sm:text-sm">
                        <tr>
                            <th className="px-4 py-3" scope="col">Produto e lote</th>
                            <th className="px-4 py-3 text-right" scope="col">No sistema</th>
                            <th className="px-4 py-3 text-right" scope="col">Contado</th>
                            <th className="px-4 py-3" scope="col">Divergência</th>
                            <th className="px-4 py-3" scope="col">Observação</th>
                            {canEdit && <th className="px-4 py-3 text-right" scope="col">Ação</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {counts.map((count) => {
                            const batch = batchById.get(count.batch.id);
                            const product = batch ? productById.get(batch.product.id) : undefined;
                            const unit = product?.unit.symbol ?? "unidade";
                            const tone = count.divergence < 0 ? "danger" : count.divergence > 0 ? "success" : "neutral";
                            const label = getDifferenceLabel(count.divergence, unit);
                            return <tr key={count.id} className="border-b border-history-border last:border-b-0">
                                <th scope="row" className="min-w-64 px-4 py-4 font-normal">
                                    <span className="block font-k2d text-sm font-bold text-ink wrap-anywhere">{batch?.product.name ?? `Lote ${count.batch.batchNumber}`}</span>
                                    <span className="mt-1 block text-xs text-history-muted">Lote {count.batch.batchNumber}</span>
                                </th>
                                <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-ink">{formatInventoryQuantity(count.registeredQuantity)} {unit}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-ink">{formatInventoryQuantity(count.physicalQuantity)} {unit}</td>
                                <td className="px-4 py-4"><StatusBadge label={label} tone={tone} /></td>
                                <td className="max-w-56 px-4 py-4 text-sm text-history-muted"><span className="line-clamp-2">{count.note || "—"}</span></td>
                                {canEdit && <td className="whitespace-nowrap px-4 py-4 text-right"><Button variant="subtle-danger" type="button" disabled={saving} onClick={() => setSelectedCount(count)} aria-label={`Remover contagem do lote ${count.batch.batchNumber}`}>Remover</Button></td>}
                            </tr>;
                        })}
                    </tbody>
                </table>
            </div>}

            <p className="m-0 border-t border-history-border px-4 py-3 text-xs leading-relaxed text-history-muted sm:px-5">Divergência = quantidade física menos quantidade do sistema no momento da contagem.</p>
            {error && !selectedCount && <div className="px-4 pb-4 sm:px-5"><Feedback severity="error">{error}</Feedback></div>}
            <InventoryCountRemovalDialog count={selectedCount} lotLabel={selectedProductName} saving={saving} error={error} onOpenChange={(open) => { if (!open) setSelectedCount(null); }} onConfirm={() => selectedCount ? onRemove(selectedCount.id) : Promise.resolve(false)} />
        </section>
    );
}
