import { useEffect, useState, type FormEvent } from "react";
import type { BatchWriteOffRequest, KitchenStockItem, StockBatch } from "../../../types/stock";
import { formatStockDate, formatStockQuantity } from "../../../utils/stockPresentation";
import { validateStockWriteOff, type StockWriteOffFormValues } from "../../../utils/stockValidation";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";
import StatusBadge from "../../ui/StatusBadge";

interface StockWriteOffDialogProps {
    open: boolean;
    batch: StockBatch | null;
    product: KitchenStockItem | null;
    submitting: boolean;
    error: string | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (batchId: number, request: BatchWriteOffRequest) => Promise<boolean>;
}

const defaultForm: StockWriteOffFormValues = { quantity: "", reason: "LOSS" };

export default function StockWriteOffDialog({ open, batch, product, submitting, error, onOpenChange, onSubmit }: StockWriteOffDialogProps) {
    const [form, setForm] = useState<StockWriteOffFormValues>(defaultForm);
    const [fieldError, setFieldError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setForm(defaultForm);
            setFieldError(null);
        }
    }, [open, batch]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!batch) return;
        const validation = validateStockWriteOff(form);
        if (!validation.value || validation.error) {
            setFieldError(validation.error);
            return;
        }
        if (validation.value.quantity > batch.currentQuantity) {
            setFieldError(`A quantidade não pode exceder o saldo do lote (${formatStockQuantity(batch.currentQuantity, product?.unit.symbol ?? "unidade")}).`);
            return;
        }
        setFieldError(null);
        const saved = await onSubmit(batch.id, validation.value);
        if (saved) onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} aria-labelledby="stock-writeoff-heading">
            <form className="grid min-w-0 gap-5 p-5 sm:p-7" noValidate onSubmit={(event) => void submit(event)}>
                <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-1">
                        <h2 id="stock-writeoff-heading" className="m-0 font-k2d text-xl font-bold text-ink sm:text-2xl">Registrar perda ou vencimento</h2>
                        <p className="m-0 text-sm leading-relaxed text-history-muted">A baixa será registrada somente no lote selecionado.</p>
                    </div>
                    <Button variant="outline" type="button" autoFocus onClick={() => onOpenChange(false)}>Fechar</Button>
                </header>

                {batch && (
                    <div className="grid min-w-0 gap-3 rounded-2xl bg-history-card-header p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <div className="grid min-w-0 gap-1">
                            <strong className="wrap-anywhere font-k2d text-ink">{batch.product.name} · lote {batch.batchNumber}</strong>
                            <span className="text-sm text-history-muted">Validade: {formatStockDate(batch.expirationDate)}</span>
                        </div>
                        <div className="grid justify-items-start gap-1 sm:justify-items-end">
                            <span className="text-xs text-history-muted">Saldo do lote</span>
                            <StatusBadge label={formatStockQuantity(batch.currentQuantity, product?.unit.symbol ?? "unidade")} tone="neutral" />
                        </div>
                    </div>
                )}

                <div className="grid min-w-0 gap-4">
                    <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0">
                        <legend className="mb-2 font-semibold text-ink">Motivo da baixa <span aria-hidden="true">*</span></legend>
                        <label className="flex min-h-12 min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-history-border px-4 py-3 has-checked:border-sidebar-purple has-checked:bg-sidebar-active">
                            <input type="radio" name="stock-writeoff-reason" value="LOSS" checked={form.reason === "LOSS"} onChange={() => setForm((current) => ({ ...current, reason: "LOSS" }))} className="size-5 accent-brand" />
                            <span className="grid min-w-0 gap-0.5"><strong className="text-sm text-ink">Perda</strong><span className="text-xs text-history-muted">Avaria ou descarte registrado para este lote.</span></span>
                        </label>
                        <label className="flex min-h-12 min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-history-border px-4 py-3 has-checked:border-sidebar-purple has-checked:bg-sidebar-active">
                            <input type="radio" name="stock-writeoff-reason" value="EXPIRED" checked={form.reason === "EXPIRED"} onChange={() => setForm((current) => ({ ...current, reason: "EXPIRED" }))} className="size-5 accent-brand" />
                            <span className="grid min-w-0 gap-0.5"><strong className="text-sm text-ink">Vencimento</strong><span className="text-xs text-history-muted">Baixa de quantidade vencida deste lote.</span></span>
                        </label>
                    </fieldset>
                    <div className="grid min-w-0 gap-1.5">
                        <label htmlFor="stock-writeoff-quantity" className="font-semibold text-ink">Quantidade a baixar <span aria-hidden="true">*</span></label>
                        <Input id="stock-writeoff-quantity" variant="text" type="number" min="0.001" max={batch?.currentQuantity} step="0.001" inputMode="decimal" value={form.quantity} onChange={(event) => { setForm((current) => ({ ...current, quantity: event.target.value })); setFieldError(null); }} aria-invalid={Boolean(fieldError)} aria-describedby={fieldError ? "stock-writeoff-error" : "stock-writeoff-help"} />
                        <p id="stock-writeoff-help" className="m-0 text-xs text-history-muted">Até {formatStockQuantity(batch?.currentQuantity ?? 0, product?.unit.symbol ?? "unidade")} disponíveis; até 3 casas decimais.</p>
                    </div>
                </div>
                {fieldError && <p id="stock-writeoff-error" className="m-0 text-sm text-feedback-error" role="alert">{fieldError}</p>}
                {error && <Feedback severity="error">{error}</Feedback>}
                <div className="flex min-w-0 flex-wrap justify-end gap-3 border-t border-history-border pt-4">
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button variant="subtle-danger" type="submit" disabled={submitting || !batch} aria-busy={submitting}>{submitting ? "Registrando baixa…" : "Confirmar baixa"}</Button>
                </div>
            </form>
        </Dialog>
    );
}
