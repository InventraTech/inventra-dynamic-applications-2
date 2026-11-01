import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import type { InventoryCount, InventoryCountFormValues, InventoryBatch, RegisterInventoryCountRequest } from "../../../types/inventory";
import type { KitchenStockItem } from "../../../types/stock";
import { formatInventoryDate, formatInventoryQuantity } from "../../../utils/inventoryPresentation";
import { validateInventoryCount, type InventoryCountErrors } from "../../../utils/inventoryValidation";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";

interface InventoryCountFormProps {
    batches: InventoryBatch[];
    counts: InventoryCount[];
    products: KitchenStockItem[];
    loadingBatches: boolean;
    batchesError: string | null;
    submitting: boolean;
    onSubmit: (request: RegisterInventoryCountRequest) => Promise<boolean>;
    onRetryBatches: () => void;
}

const emptyForm: InventoryCountFormValues = { batchId: "", physicalQuantity: "", note: "" };

export default function InventoryCountForm({ batches, counts, products, loadingBatches, batchesError, submitting, onSubmit, onRetryBatches }: InventoryCountFormProps) {
    const id = useId();
    const [form, setForm] = useState<InventoryCountFormValues>(emptyForm);
    const [errors, setErrors] = useState<InventoryCountErrors>({});
    const countedBatchIds = useMemo(() => new Set(counts.map((count) => count.batch.id)), [counts]);
    const availableBatches = batches;
    const selectedBatch = availableBatches.find((batch) => String(batch.id) === form.batchId) ?? null;
    const unit = selectedBatch ? products.find((product) => product.product.id === selectedBatch.product.id)?.unit.symbol : null;

    useEffect(() => {
        if (form.batchId && countedBatchIds.has(Number(form.batchId))) setForm(emptyForm);
    }, [countedBatchIds, form.batchId]);

    function update<K extends keyof InventoryCountFormValues>(field: K, value: InventoryCountFormValues[K]) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validation = validateInventoryCount(form);
        setErrors(validation.errors);
        if (!validation.value) return;
        if (await onSubmit(validation.value)) {
            setForm(emptyForm);
            setErrors({});
        }
    }

    function fieldError(field: keyof InventoryCountFormValues) {
        const message = errors[field];
        return message ? <p id={`${id}-${field}-error`} className="m-0 text-sm text-feedback-error" role="alert">{message}</p> : null;
    }

    return (
        <section className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:gap-5 sm:p-6" aria-labelledby={`${id}-heading`}>
            <header className="grid min-w-0 gap-1">
                <h2 id={`${id}-heading`} className="m-0 font-k2d text-lg font-bold text-ink sm:text-xl">Registrar contagem</h2>
                <p className="m-0 text-sm leading-relaxed text-history-muted">Conte um lote por vez. O saldo do sistema fica registrado para calcular a divergência.</p>
            </header>

            {loadingBatches ? <p className="m-0 text-sm text-history-muted" role="status" aria-live="polite">Carregando lotes da cozinha…</p> : batchesError ? (
                <div className="grid min-w-0 justify-items-start gap-2"><Feedback severity="error">{batchesError}</Feedback><Button variant="link" type="button" onClick={onRetryBatches}>Tentar carregar lotes novamente</Button></div>
            ) : batches.length === 0 ? <Feedback severity="info">Esta cozinha ainda não tem lotes disponíveis para contagem.</Feedback> : (
                <form className="grid min-w-0 gap-4" onSubmit={(event) => void submit(event)} noValidate aria-busy={submitting}>
                    <div className="grid min-w-0 content-start gap-1 self-start">
                        <label htmlFor={`${id}-batch`} className="font-semibold text-ink">Lote da cozinha <span aria-hidden="true">*</span></label>
                        <select id={`${id}-batch`} autoFocus className="min-h-12 min-w-0 rounded-xl border border-history-border bg-history-card-header px-3 text-ink outline-none focus-visible:border-sidebar-indicator focus-visible:ring-4 focus-visible:ring-sidebar-active" value={form.batchId} onChange={(event) => update("batchId", event.target.value)} aria-invalid={Boolean(errors.batchId)} aria-describedby={errors.batchId ? `${id}-batch-error` : `${id}-batch-help`}>
                            <option value="">Selecione um produto e lote</option>
                            {availableBatches.map((batch) => {
                                const counted = countedBatchIds.has(batch.id);
                                const productName = batch.product.name;
                                const productUnit = products.find((product) => product.product.id === batch.product.id)?.unit.symbol;
                                return <option key={batch.id} value={batch.id} disabled={counted}>{productName} · Lote {batch.batchNumber} · {formatInventoryQuantity(batch.currentQuantity)} {productUnit ?? "unidade"}{counted ? " · já contado" : ""}</option>;
                            })}
                        </select>
                        <p id={`${id}-batch-help`} className="m-0 text-xs leading-relaxed text-history-muted">Lotes já contados neste inventário não podem ser selecionados novamente.</p>
                        {fieldError("batchId")}
                        {selectedBatch && <p className="m-0 text-sm text-history-muted">Saldo atual do sistema: <strong className="text-ink">{formatInventoryQuantity(selectedBatch.currentQuantity)} {unit ?? "unidade"}</strong>{selectedBatch.expirationDate ? ` · validade ${formatInventoryDate(selectedBatch.expirationDate)}` : ""}</p>}
                    </div>

                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                        <div className="grid min-w-0 content-start gap-1 self-start">
                            <label htmlFor={`${id}-quantity`} className="font-semibold text-ink">Quantidade física <span className="font-normal text-history-muted">· obrigatória</span></label>
                            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-history-border bg-history-card-header pr-3 focus-within:border-sidebar-indicator focus-within:ring-4 focus-within:ring-sidebar-active">
                                <input id={`${id}-quantity`} type="number" min="0" max="999999999.999" step="0.001" inputMode="decimal" className="min-h-12 min-w-0 flex-1 rounded-xl bg-transparent px-3 text-ink outline-none" value={form.physicalQuantity} onChange={(event) => update("physicalQuantity", event.target.value)} aria-invalid={Boolean(errors.physicalQuantity)} aria-describedby={errors.physicalQuantity ? `${id}-physicalQuantity-error` : `${id}-quantity-help`} />
                                {unit && <span className="shrink-0 rounded-full bg-sidebar-active px-3 py-1 text-sm font-bold text-sidebar-purple" aria-label={`Unidade ${unit}`}>{unit}</span>}
                            </div>
                            <p id={`${id}-quantity-help`} className="m-0 text-xs leading-relaxed text-history-muted">Aceita zero e até 3 casas decimais.</p>
                            {fieldError("physicalQuantity")}
                        </div>
                        <div className="grid min-w-0 content-start gap-1 self-start">
                            <label htmlFor={`${id}-note`} className="font-semibold text-ink">Observação <span className="font-normal text-history-muted">· opcional</span></label>
                            <textarea id={`${id}-note`} rows={2} maxLength={255} className="min-h-12 min-w-0 resize-y rounded-xl border border-history-border bg-history-card-header px-3 py-2 text-ink outline-none placeholder:text-history-muted focus-visible:border-sidebar-indicator focus-visible:ring-4 focus-visible:ring-sidebar-active" placeholder="Ex.: caixa a mais no fundo" value={form.note} onChange={(event) => update("note", event.target.value)} aria-invalid={Boolean(errors.note)} aria-describedby={errors.note ? `${id}-note-error` : `${id}-note-help`} />
                            <p id={`${id}-note-help`} className="m-0 text-xs leading-relaxed text-history-muted">Até 255 caracteres.</p>
                            {fieldError("note")}
                        </div>
                    </div>

                    <footer className="flex min-w-0 flex-wrap justify-end border-t border-history-border pt-4">
                        <Button variant="standard" type="submit" disabled={submitting || !selectedBatch || countedBatchIds.has(selectedBatch.id)}>{submitting ? "Registrando…" : "Registrar contagem"}</Button>
                    </footer>
                </form>
            )}
        </section>
    );
}
