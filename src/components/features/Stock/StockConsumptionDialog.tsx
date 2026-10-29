import { useEffect, useState, type FormEvent } from "react";
import type { KitchenStockItem, StockConsumptionRequest } from "../../../types/stock";
import { validateStockConsumption } from "../../../utils/stockValidation";
import { formatStockQuantity } from "../../../utils/stockPresentation";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";

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
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [fieldError, setFieldError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        const firstAvailable = products.find((item) => item.totalQuantity > 0);
        setProductId(firstAvailable ? String(firstAvailable.product.id) : products[0] ? String(products[0].product.id) : "");
        setQuantity("");
        setFieldError(null);
    }, [open, products]);

    const selectedProduct = products.find((item) => String(item.product.id) === productId) ?? null;

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validation = validateStockConsumption(quantity);
        if (validation.error || validation.quantity === null) {
            setFieldError(validation.error);
            return;
        }
        if (!selectedProduct) {
            setFieldError("Selecione um produto vinculado à cozinha.");
            return;
        }
        if (validation.quantity > selectedProduct.totalQuantity) {
            setFieldError(`A quantidade excede o saldo utilizável de ${formatStockQuantity(selectedProduct.totalQuantity, selectedProduct.unit.symbol)}.`);
            return;
        }
        setFieldError(null);
        const saved = await onSubmit({ kitchenId, productId: selectedProduct.product.id, quantity: validation.quantity, reason: "USAGE" });
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
                            <label htmlFor="stock-consumption-product" className="font-semibold text-ink">Produto da cozinha <span aria-hidden="true">*</span></label>
                            <select id="stock-consumption-product" className="min-h-12 min-w-0 rounded-xl border border-history-border bg-history-card-header px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={productId} onChange={(event) => { setProductId(event.target.value); setFieldError(null); }}>
                                <option value="">Selecione um produto</option>
                                {products.map((item) => <option key={item.product.id} value={item.product.id}>{item.product.name} · saldo {formatStockQuantity(item.totalQuantity, item.unit.symbol)}</option>)}
                            </select>
                        </div>
                        {selectedProduct && <p className="m-0 rounded-2xl bg-history-card-header p-4 text-sm leading-relaxed text-history-muted">Saldo atual: <strong className="text-ink">{formatStockQuantity(selectedProduct.totalQuantity, selectedProduct.unit.symbol)}</strong>. A API fará a baixa FIFO e recusará atomicamente a operação se o saldo real for insuficiente.</p>}
                        <div className="grid min-w-0 gap-1.5">
                            <label htmlFor="stock-consumption-quantity" className="font-semibold text-ink">Quantidade consumida <span aria-hidden="true">*</span></label>
                            <Input id="stock-consumption-quantity" variant="text" type="number" min="0.001" max="999999999.999" step="0.001" inputMode="decimal" value={quantity} onChange={(event) => { setQuantity(event.target.value); setFieldError(null); }} aria-invalid={Boolean(fieldError)} aria-describedby={fieldError ? "stock-consumption-error" : "stock-consumption-help"} />
                            <p id="stock-consumption-help" className="m-0 text-xs text-history-muted">Informe um valor positivo com até 3 casas decimais.</p>
                        </div>
                        {fieldError && <p id="stock-consumption-error" className="m-0 text-sm text-feedback-error" role="alert">{fieldError}</p>}
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
