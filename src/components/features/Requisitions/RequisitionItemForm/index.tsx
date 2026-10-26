import { useEffect, useState, type FormEvent } from "react";
import { addRequisitionItem } from "../../../../services/requisitions";
import { getProductSuppliers } from "../../../../services/products";
import type { ProductRecord, ProductSupplier } from "../../../../types/products";
import type { Requisition } from "../../../../types/requisitions";
import { validateRequisitionItem } from "../../../../utils/requisitionValidation";
import Button from "../../../ui/Button";
import Feedback from "../../../ui/Feedback";
import Input from "../../../ui/Input";
import KitchenProductPicker from "../KitchenProductPicker";

interface RequisitionItemFormProps {
    requisition: Requisition;
    kitchenId: number;
    onAdded: () => Promise<void> | void;
}

interface ItemFormValues {
    quantity: string;
    estimatedPrice: string;
    note: string;
    supplierId: string;
}

export default function RequisitionItemForm({ requisition, kitchenId, onAdded }: RequisitionItemFormProps) {
    const [product, setProduct] = useState<ProductRecord | null>(null);
    const [suppliers, setSuppliers] = useState<ProductSupplier[]>([]);
    const [supplierLoading, setSupplierLoading] = useState(false);
    const [supplierError, setSupplierError] = useState<string | null>(null);
    const [values, setValues] = useState<ItemFormValues>({ quantity: "1", estimatedPrice: "", note: "", supplierId: "" });
    const [errors, setErrors] = useState<{ quantity?: string; estimatedPrice?: string; note?: string }>({});
    const [feedback, setFeedback] = useState<{ severity: "error" | "success"; message: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!product || requisition.type !== "PURCHASE") {
            setSuppliers([]);
            setSupplierError(null);
            return;
        }

        const controller = new AbortController();
        setSupplierLoading(true);
        setSupplierError(null);
        getProductSuppliers(product.id, controller.signal)
            .then((options) => { if (!controller.signal.aborted) setSuppliers(options); })
            .catch((error: unknown) => {
                if (!controller.signal.aborted) setSupplierError(error instanceof Error ? error.message : "Não foi possível buscar fornecedores associados.");
            })
            .finally(() => { if (!controller.signal.aborted) setSupplierLoading(false); });
        return () => controller.abort();
    }, [product, requisition.type]);

    function selectProduct(nextProduct: ProductRecord) {
        setProduct(nextProduct);
        setValues({ quantity: "1", estimatedPrice: "", note: "", supplierId: "" });
        setErrors({});
        setFeedback(null);
    }

    function selectSupplier(supplierId: string) {
        const selectedSupplier = suppliers.find(({ supplier }) => String(supplier.id) === supplierId);
        setValues((current) => ({
            ...current,
            supplierId,
            estimatedPrice: selectedSupplier?.referencePrice === null || selectedSupplier?.referencePrice === undefined
                ? current.estimatedPrice
                : String(selectedSupplier.referencePrice),
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFeedback(null);
        if (!product) {
            setFeedback({ severity: "error", message: "Selecione um produto vinculado à cozinha." });
            return;
        }

        const parsedQuantity = Number(values.quantity.replace(",", "."));
        const parsedPrice = values.estimatedPrice.trim() ? Number(values.estimatedPrice.replace(",", ".")) : undefined;
        const validation = validateRequisitionItem({
            productId: product.id,
            quantity: parsedQuantity,
            ...(values.supplierId ? { suggestedSupplierId: Number(values.supplierId) } : {}),
            ...(parsedPrice === undefined ? {} : { estimatedPrice: parsedPrice }),
            ...(values.note.trim() ? { note: values.note.trim() } : {}),
        });
        setErrors({ quantity: validation.errors.quantity, estimatedPrice: validation.errors.estimatedPrice, note: validation.errors.note });
        if (Object.values(validation.errors).some(Boolean)) return;

        setSubmitting(true);
        try {
            await addRequisitionItem(requisition.id, validation.value);
            await onAdded();
            setFeedback({ severity: "success", message: `${product.name} foi adicionado ao rascunho.` });
            setProduct(null);
            setValues({ quantity: "1", estimatedPrice: "", note: "", supplierId: "" });
        } catch (error: unknown) {
            setFeedback({ severity: "error", message: error instanceof Error ? error.message : "Não foi possível adicionar o item. O rascunho foi mantido." });
        } finally {
            setSubmitting(false);
        }
    }

    const supplierOptions = suppliers.filter(({ supplier }) => supplier.id > 0);
    const estimatedTotal = Number(values.quantity.replace(",", ".")) * Number(values.estimatedPrice.replace(",", "."));

    return (
        <section className="grid min-w-0 gap-4" aria-labelledby="add-requisition-item-heading">
            <h3 id="add-requisition-item-heading" className="font-k2d text-lg font-bold text-ink">Adicionar produto</h3>
            <KitchenProductPicker kitchenId={kitchenId} onSelect={selectProduct} />
            {product && (
                <form className="grid min-w-0 gap-4 rounded-2xl border border-history-border bg-history-card-header p-4" noValidate onSubmit={handleSubmit}>
                    <div className="grid min-w-0 gap-1"><span className="font-semibold text-ink">{product.name}</span><span className="text-sm text-history-muted">Unidade: {product.unit.symbol}</span></div>
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                        <div className="grid min-w-0 gap-2"><label htmlFor="requisition-quantity" className="font-semibold text-ink">Quantidade <span aria-hidden="true">*</span></label><Input id="requisition-quantity" name="quantity" type="number" min="0.001" step="0.001" inputMode="decimal" required value={values.quantity} aria-invalid={errors.quantity ? true : undefined} aria-describedby={errors.quantity ? "requisition-quantity-error" : undefined} onChange={(event) => setValues((current) => ({ ...current, quantity: event.target.value }))} />{errors.quantity && <p id="requisition-quantity-error" className="text-sm text-feedback-error">{errors.quantity}</p>}</div>
                        <p className="grid min-w-0 content-center gap-1 text-sm text-history-muted"><span>Unidade</span><strong className="text-ink">{product.unit.symbol}</strong><span>Conforme cadastro do produto.</span></p>
                    </div>
                    {requisition.type === "PURCHASE" && (
                        <div className="grid min-w-0 gap-2"><label htmlFor="requisition-supplier" className="font-semibold text-ink">Fornecedor sugerido <span className="font-normal text-history-muted">· opcional</span></label><select id="requisition-supplier" className="min-h-11 min-w-0 rounded-xl border border-history-border bg-surface px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={values.supplierId} onChange={(event) => selectSupplier(event.target.value)}><option value="">Nenhum fornecedor associado</option>{supplierOptions.map(({ supplier }) => <option key={supplier.id} value={supplier.id}>{supplier.legalName}</option>)}</select>{supplierLoading && <p role="status" className="text-sm text-history-muted">Carregando fornecedores associados…</p>}{supplierError && <Feedback severity="info">{supplierError} É possível adicionar o item sem fornecedor.</Feedback>}</div>
                    )}
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                        <div className="grid min-w-0 gap-2"><label htmlFor="requisition-estimated-price" className="font-semibold text-ink">Preço estimado por unidade <span className="font-normal text-history-muted">· opcional</span></label><Input id="requisition-estimated-price" name="estimatedPrice" type="number" min="0" step="0.01" inputMode="decimal" value={values.estimatedPrice} aria-invalid={errors.estimatedPrice ? true : undefined} aria-describedby={errors.estimatedPrice ? "requisition-price-error" : undefined} onChange={(event) => setValues((current) => ({ ...current, estimatedPrice: event.target.value }))} />{errors.estimatedPrice && <p id="requisition-price-error" className="text-sm text-feedback-error">{errors.estimatedPrice}</p>}</div>
                        <p className="grid min-w-0 content-center gap-1 text-sm text-history-muted"><span>Estimativa deste item</span><strong className="text-lg text-brand">{Number.isFinite(estimatedTotal) ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(estimatedTotal) : "Não informada"}</strong><span>Estimativa, não representa pagamento.</span></p>
                    </div>
                    <div className="grid min-w-0 gap-2"><label htmlFor="requisition-item-note" className="font-semibold text-ink">Observação do item <span className="font-normal text-history-muted">· opcional</span></label><textarea id="requisition-item-note" name="note" rows={3} maxLength={255} className="min-w-0 rounded-xl border border-history-border bg-surface px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={values.note} aria-invalid={errors.note ? true : undefined} aria-describedby={errors.note ? "requisition-note-error" : undefined} onChange={(event) => setValues((current) => ({ ...current, note: event.target.value }))} />{errors.note && <p id="requisition-note-error" className="text-sm text-feedback-error">{errors.note}</p>}<span className="text-right text-xs text-history-muted">{values.note.length}/255</span></div>
                    {feedback && <Feedback severity={feedback.severity}>{feedback.message}</Feedback>}
                    <div className="flex flex-wrap justify-end gap-3"><Button variant="link" type="button" onClick={() => setProduct(null)} disabled={submitting}>Escolher outro produto</Button><Button variant="primary" type="submit" disabled={submitting || supplierLoading} aria-busy={submitting} className="min-h-11 rounded-xl px-5">{submitting ? "Adicionando…" : "Adicionar item"}</Button></div>
                </form>
            )}
        </section>
    );
}
