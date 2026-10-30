import { useEffect, useState, type FormEvent } from "react";
import type { KitchenStockItem, StockEntryRequest, StockSupplier } from "../../../types/stock";
import { validateStockEntry, type StockEntryErrors, type StockEntryFormValues } from "../../../utils/stockValidation";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";
import Loading from "../../ui/Loading";

interface StockEntryDialogProps {
    open: boolean;
    kitchenId: number;
    products: KitchenStockItem[];
    suppliers: StockSupplier[];
    suppliersLoading: boolean;
    suppliersError: string | null;
    submitting: boolean;
    error: string | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (request: StockEntryRequest) => Promise<boolean>;
    onRetrySuppliers: () => void;
}

const emptyForm: StockEntryFormValues = {
    productId: "",
    supplierId: "",
    batchNumber: "",
    invoiceNumber: "",
    initialQuantity: "",
    entryDate: "",
    expirationDate: "",
    unitPrice: "",
};

function localToday(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default function StockEntryDialog({ open, kitchenId, products, suppliers, suppliersLoading, suppliersError, submitting, error, onOpenChange, onSubmit, onRetrySuppliers }: StockEntryDialogProps) {
    const [form, setForm] = useState<StockEntryFormValues>(emptyForm);
    const [fieldErrors, setFieldErrors] = useState<StockEntryErrors>({});

    useEffect(() => {
        if (!open) return;
        setForm({ ...emptyForm, productId: products[0] ? String(products[0].product.id) : "", entryDate: localToday() });
        setFieldErrors({});
    }, [open, products]);

    function update<K extends keyof StockEntryFormValues>(field: K, value: StockEntryFormValues[K]) {
        setForm((current) => ({ ...current, [field]: value }));
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validation = validateStockEntry(form, kitchenId);
        setFieldErrors(validation.errors);
        if (!validation.value) return;
        const saved = await onSubmit(validation.value);
        if (saved) onOpenChange(false);
    }

    function renderFieldError(field: keyof StockEntryFormValues) {
        const message = fieldErrors[field];
        return message ? <p id={`stock-entry-${field}-error`} className="m-0 text-sm text-feedback-error" role="alert">{message}</p> : null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} aria-labelledby="stock-entry-heading" className="max-w-3xl">
            <form className="grid min-w-0 gap-5 p-5 sm:p-7" noValidate onSubmit={(event) => void submit(event)}>
                <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-1">
                        <h2 id="stock-entry-heading" className="m-0 font-k2d text-xl font-bold text-ink sm:text-2xl">Registrar entrada</h2>
                        <p className="m-0 text-sm leading-relaxed text-history-muted">Cada recebimento cria um novo lote e passa a compor o saldo utilizável da cozinha.</p>
                    </div>
                    <Button variant="outline" type="button" autoFocus onClick={() => onOpenChange(false)}>Fechar</Button>
                </header>

                {products.length === 0 ? (
                    <Feedback severity="info">Não há produtos vinculados a esta cozinha para registrar uma entrada.</Feedback>
                ) : (
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                        <div className="grid min-w-0 gap-1.5 sm:col-span-2">
                            <label htmlFor="stock-entry-product" className="font-semibold text-ink">Produto da cozinha <span aria-hidden="true">*</span></label>
                            <select id="stock-entry-product" className="min-h-12 min-w-0 rounded-xl border border-history-border bg-history-card-header px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={form.productId} onChange={(event) => update("productId", event.target.value)} aria-invalid={Boolean(fieldErrors.productId)} aria-describedby={fieldErrors.productId ? "stock-entry-productId-error" : undefined}>
                                <option value="">Selecione um produto</option>
                                {products.map((item) => <option key={item.product.id} value={item.product.id}>{item.product.name} · {item.unit.symbol}</option>)}
                            </select>
                            {renderFieldError("productId")}
                        </div>
                        <div className="grid min-w-0 gap-1.5">
                            <label htmlFor="stock-entry-batch" className="font-semibold text-ink">Número do lote <span aria-hidden="true">*</span></label>
                            <Input id="stock-entry-batch" variant="text" maxLength={50} value={form.batchNumber} onChange={(event) => update("batchNumber", event.target.value)} aria-invalid={Boolean(fieldErrors.batchNumber)} aria-describedby={fieldErrors.batchNumber ? "stock-entry-batchNumber-error" : "stock-entry-batch-help"} />
                            <p id="stock-entry-batch-help" className="m-0 text-xs text-history-muted">Até 50 caracteres.</p>
                            {renderFieldError("batchNumber")}
                        </div>
                        <div className="grid min-w-0 gap-1.5">
                            <label htmlFor="stock-entry-quantity" className="font-semibold text-ink">Quantidade recebida <span aria-hidden="true">*</span></label>
                            <Input id="stock-entry-quantity" variant="text" type="number" min="0.001" max="999999999.999" step="0.001" inputMode="decimal" value={form.initialQuantity} onChange={(event) => update("initialQuantity", event.target.value)} aria-invalid={Boolean(fieldErrors.initialQuantity)} aria-describedby={fieldErrors.initialQuantity ? "stock-entry-initialQuantity-error" : "stock-entry-quantity-help"} />
                            <p id="stock-entry-quantity-help" className="m-0 text-xs text-history-muted">Deve ser positiva; até 3 casas decimais.</p>
                            {renderFieldError("initialQuantity")}
                        </div>
                        <div className="grid min-w-0 gap-1.5">
                            <label htmlFor="stock-entry-entry-date" className="font-semibold text-ink">Data de entrada <span aria-hidden="true">*</span></label>
                            <Input id="stock-entry-entry-date" variant="text" type="date" value={form.entryDate} onChange={(event) => update("entryDate", event.target.value)} aria-invalid={Boolean(fieldErrors.entryDate)} aria-describedby={fieldErrors.entryDate ? "stock-entry-entryDate-error" : undefined} />
                            {renderFieldError("entryDate")}
                        </div>
                        <div className="grid min-w-0 gap-1.5">
                            <label htmlFor="stock-entry-expiration-date" className="font-semibold text-ink">Data de validade</label>
                            <Input id="stock-entry-expiration-date" variant="text" type="date" value={form.expirationDate} onChange={(event) => update("expirationDate", event.target.value)} aria-invalid={Boolean(fieldErrors.expirationDate)} aria-describedby={fieldErrors.expirationDate ? "stock-entry-expirationDate-error" : "stock-entry-expiration-help"} />
                            <p id="stock-entry-expiration-help" className="m-0 text-xs text-history-muted">Opcional; não pode ser anterior à entrada.</p>
                            {renderFieldError("expirationDate")}
                        </div>
                        <div className="grid min-w-0 gap-1.5">
                            <label htmlFor="stock-entry-supplier" className="font-semibold text-ink">Fornecedor</label>
                            {suppliersLoading ? <div className="flex min-h-12 items-center"><Loading loadingText="Carregando fornecedores…" /></div> : (
                                <select id="stock-entry-supplier" className="min-h-12 min-w-0 rounded-xl border border-history-border bg-history-card-header px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={form.supplierId} onChange={(event) => update("supplierId", event.target.value)} aria-invalid={Boolean(fieldErrors.supplierId)} aria-describedby={fieldErrors.supplierId ? "stock-entry-supplierId-error" : suppliersError ? "stock-entry-supplier-help stock-entry-supplier-error" : "stock-entry-supplier-help"}>
                                    <option value="">Sem fornecedor</option>
                                    {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.legalName}</option>)}
                                </select>
                            )}
                            <p id="stock-entry-supplier-help" className="m-0 text-xs text-history-muted">Lista limitada a fornecedores que já entregaram para esta cozinha.</p>
                            {suppliersError && <div id="stock-entry-supplier-error" className="grid justify-items-start gap-1"><Feedback severity="error">{suppliersError}</Feedback><Button variant="link" type="button" onClick={onRetrySuppliers}>Tentar carregar fornecedores</Button></div>}
                            {renderFieldError("supplierId")}
                        </div>
                        <div className="grid min-w-0 gap-1.5">
                            <label htmlFor="stock-entry-invoice" className="font-semibold text-ink">Nota fiscal</label>
                            <Input id="stock-entry-invoice" variant="text" value={form.invoiceNumber} maxLength={50} onChange={(event) => update("invoiceNumber", event.target.value)} />
                        </div>
                        <div className="grid min-w-0 gap-1.5 sm:col-span-2">
                            <label htmlFor="stock-entry-unit-price" className="font-semibold text-ink">Preço unitário</label>
                            <Input id="stock-entry-unit-price" variant="text" type="number" min="0" max="999999999.99" step="0.01" inputMode="decimal" value={form.unitPrice} onChange={(event) => update("unitPrice", event.target.value)} aria-invalid={Boolean(fieldErrors.unitPrice)} aria-describedby={fieldErrors.unitPrice ? "stock-entry-unitPrice-error" : "stock-entry-price-help"} />
                            <p id="stock-entry-price-help" className="m-0 text-xs text-history-muted">Opcional; valor não negativo com até 2 casas decimais.</p>
                            {renderFieldError("unitPrice")}
                        </div>
                    </div>
                )}

                {error && <Feedback severity="error">{error}</Feedback>}
                <div className="flex min-w-0 flex-wrap justify-end gap-3 border-t border-history-border pt-4">
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button variant="standard" type="submit" disabled={submitting || suppliersLoading || products.length === 0} aria-busy={submitting}>
                        {submitting ? "Registrando entrada…" : "Registrar novo lote"}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
