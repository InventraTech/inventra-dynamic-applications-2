import { useEffect, useState, type FormEvent } from "react";
import type { KitchenStockItem, StockConsumptionRequest } from "../../../../types/stock";
import { validateStockConsumption, type StockConsumptionErrors, type StockConsumptionFormValues } from "../../../../utils/stockValidation";
import { formatStockQuantity } from "../../../../utils/stockPresentation";
import Button from "../../../ui/Button/index";
import Dialog from "../../../ui/Dialog/index";
import Feedback from "../../../ui/Feedback/index";
import Input from "../../../ui/Input/index";

const emptyForm: StockConsumptionFormValues = { productId: "", quantity: "" };

interface StockConsumptionDialogProps {
    open: boolean;
    kitchenId: number;
    products: KitchenStockItem[];
    submitting: boolean;
    error: string | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (request: StockConsumptionRequest) => Promise<boolean>;
}

export default function StockConsumptionDialog({ open, kitchenId, products, submitting, error, onOpenChange, onSubmit }: StockConsumptionDialogProps) {
    const [form, setForm] = useState<StockConsumptionFormValues>(emptyForm);
    const [fieldErrors, setFieldErrors] = useState<StockConsumptionErrors>({});

    useEffect(() => {
        if (!open) return;
        const firstAvailable = products.find((item) => item.totalQuantity > 0);
        setForm({ productId: firstAvailable ? String(firstAvailable.product.id) : products[0] ? String(products[0].product.id) : "", quantity: "" });
        setFieldErrors({});
    }, [open, products]);

    const selectedProduct = products.find((item) => String(item.product.id) === form.productId) ?? null;

    function updateValue(field: keyof StockConsumptionFormValues, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validation = validateStockConsumption(form, products);
        setFieldErrors(validation.errors);
        if (!validation.value) {
            const firstInvalid = Object.keys(validation.errors)[0] as keyof StockConsumptionFormValues | undefined;
            if (firstInvalid) document.getElementById(`stock-consumption-${firstInvalid}`)?.focus();
            return;
        }
        const saved = await onSubmit({ kitchenId, ...validation.value, reason: "USAGE" });
        if (saved) onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} aria-labelledby="stock-consumption-heading">
            <form className="grid min-w-0 gap-5 p-5 sm:p-7" noValidate onSubmit={(event) => void submit(event)}>
                <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-1">
                        <h2 id="stock-consumption-heading" className="m-0 font-k2d text-xl font-bold text-ink sm:text-2xl">Registrar consumo</h2>
                        <p className="m-0 text-sm leading-relaxed text-history-muted">A baixa será feita nesta cozinha, usando primeiro os lotes com vencimento mais próximo.</p>
                    </div>
                    <Button variant="outline" type="button" autoFocus onClick={() => onOpenChange(false)}>Fechar</Button>
                </header>

                {products.length === 0 ? <Feedback severity="info">Não há produtos vinculados a esta cozinha para registrar consumo.</Feedback> : (
                    <div className="grid min-w-0 gap-4">
                        <div className="grid min-w-0 gap-1.5">
                            <label htmlFor="stock-consumption-productId" className="font-semibold text-ink">Produto da cozinha <span aria-hidden="true">*</span></label>
                            <select id="stock-consumption-productId" className="min-h-12 min-w-0 rounded-xl border border-history-border bg-history-card-header px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={form.productId} aria-invalid={Boolean(fieldErrors.productId)} aria-describedby={fieldErrors.productId ? "stock-consumption-product-error" : undefined} onChange={(event) => updateValue("productId", event.target.value)}>
                                <option value="">Selecione um produto</option>
                                {products.map((item) => <option key={item.product.id} value={item.product.id}>{item.product.name} · saldo {formatStockQuantity(item.totalQuantity, item.unit.symbol)}</option>)}
                            </select>
                            {fieldErrors.productId && <p id="stock-consumption-product-error" className="m-0 text-sm text-feedback-error" role="alert">{fieldErrors.productId}</p>}
                        </div>
                        {selectedProduct && <p className="m-0 rounded-2xl bg-history-card-header p-4 text-sm leading-relaxed text-history-muted">Saldo atual: <strong className="text-ink">{formatStockQuantity(selectedProduct.totalQuantity, selectedProduct.unit.symbol)}</strong>. A API fará a baixa FIFO e recusará atomicamente a operação se o saldo real for insuficiente.</p>}
                        <div className="grid min-w-0 gap-1.5">
                            <label htmlFor="stock-consumption-quantity" className="font-semibold text-ink">Quantidade consumida <span aria-hidden="true">*</span></label>
                            <Input id="stock-consumption-quantity" variant="text" type="number" min="0.001" max="999999999.999" step="0.001" inputMode="decimal" value={form.quantity} onChange={(event) => updateValue("quantity", event.target.value)} aria-invalid={Boolean(fieldErrors.quantity)} aria-describedby={fieldErrors.quantity ? "stock-consumption-quantity-error" : "stock-consumption-help"} />
                            <p id="stock-consumption-help" className="m-0 text-xs text-history-muted">Informe um valor positivo com até 3 casas decimais.</p>
                            {fieldErrors.quantity && <p id="stock-consumption-quantity-error" className="m-0 text-sm text-feedback-error" role="alert">{fieldErrors.quantity}</p>}
                        </div>
                    </div>
                )}
                {error && <Feedback severity="error">{error}</Feedback>}
                <div className="flex min-w-0 flex-wrap justify-end gap-3 border-t border-history-border pt-4">
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button variant="standard" type="submit" disabled={submitting || products.length === 0} aria-busy={submitting}>{submitting ? "Registrando consumo…" : "Confirmar consumo"}</Button>
                </div>
            </form>
        </Dialog>
    );
}
