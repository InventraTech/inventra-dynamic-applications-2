import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { ProductRecord, ProductSupplier, ProductSupplierOption } from "../../../types/products";
import { ApiError } from "../../../services/api";
import { getActiveSuppliers } from "../../../services/suppliers";
import { getProductSuppliers, linkProductSupplier } from "../../../services/productSuppliers";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";

interface ProductSupplierPanelProps {
    product: ProductRecord;
    suppliers: ProductSupplier[];
    onSuppliersChange: (suppliers: ProductSupplier[]) => void;
}

interface SupplierFormValues { supplierId: string; supplierCode: string; referencePrice: string; leadTimeDays: string }
interface SupplierFormErrors { supplierId?: string; supplierCode?: string; referencePrice?: string; leadTimeDays?: string }

const emptyValues: SupplierFormValues = { supplierId: "", supplierCode: "", referencePrice: "", leadTimeDays: "" };

function errorMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    return "Não foi possível carregar os fornecedores.";
}

function ProductSupplierPanel({ product, suppliers, onSuppliersChange }: ProductSupplierPanelProps) {
    const [options, setOptions] = useState<ProductSupplierOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [optionsError, setOptionsError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<SupplierFormValues>(emptyValues);
    const [errors, setErrors] = useState<SupplierFormErrors>({});
    const dialogRef = useRef<HTMLDialogElement>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        async function loadOptions() {
            setLoadingOptions(true);
            setOptionsError(null);
            try {
                setOptions(await getActiveSuppliers(controller.signal));
            } catch (error: unknown) {
                if (!controller.signal.aborted) setOptionsError(errorMessage(error));
            } finally {
                if (!controller.signal.aborted) setLoadingOptions(false);
            }
        }
        void loadOptions();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) {
            dialog.close();
            requestAnimationFrame(() => triggerRef.current?.focus());
        }
    }, [open]);

    const availableSuppliers = useMemo(() => {
        const alreadyLinked = new Set(suppliers.map((item) => item.supplier.id));
        return options.filter((option) => !alreadyLinked.has(option.id));
    }, [options, suppliers]);

    function updateValue(field: keyof SupplierFormValues, value: string) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    function openDialog(trigger: HTMLButtonElement) {
        triggerRef.current = trigger;
        setValues({ ...emptyValues, supplierId: String(availableSuppliers[0]?.id ?? "") });
        setErrors({});
        setFormError(null);
        setOpen(true);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextErrors: SupplierFormErrors = {};
        if (!values.supplierId) nextErrors.supplierId = "Selecione um fornecedor ativo que ainda não esteja associado.";
        if (values.supplierCode.length > 50) nextErrors.supplierCode = "O código pode ter até 50 caracteres.";
        if (values.referencePrice && !/^\d{1,10}(?:[.,]\d{1,2})?$/.test(values.referencePrice.trim())) nextErrors.referencePrice = "Informe um valor não negativo com até 2 casas decimais.";
        if (values.leadTimeDays && !/^\d{1,9}$/.test(values.leadTimeDays.trim())) nextErrors.leadTimeDays = "Informe um prazo inteiro de dias igual ou maior que zero.";
        setErrors(nextErrors);
        const firstInvalid = Object.keys(nextErrors)[0];
        if (firstInvalid) { document.getElementById(`fornecedor-${firstInvalid}`)?.focus(); return; }

        setSaving(true);
        setFormError(null);
        setNotice(null);
        try {
            await linkProductSupplier(product.id, {
                supplierId: Number(values.supplierId),
                supplierCode: values.supplierCode.trim(),
                referencePrice: values.referencePrice ? Number(values.referencePrice.replace(",", ".")) : null,
                leadTimeDays: values.leadTimeDays ? Number(values.leadTimeDays) : null,
            });
            const refreshedSuppliers = await getProductSuppliers(product.id);
            onSuppliersChange(refreshedSuppliers);
            setOpen(false);
            setNotice("Fornecedor associado ao produto.");
        } catch (error: unknown) {
            setFormError(errorMessage(error));
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7" aria-labelledby="fornecedores-produto-titulo">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-2"><div><h2 id="fornecedores-produto-titulo" className="font-k2d text-lg font-bold text-sidebar-text">Fornecedores associados</h2><p className="mt-1 text-sm leading-relaxed text-history-muted">Fornecedores e condições registrados para este produto.</p></div><Button ref={triggerRef} className="min-h-9 min-w-0 rounded-lg border border-brand px-3 py-2 font-k2d text-sm font-bold text-brand hover:bg-sidebar-active" variant="icon" type="button" onClick={(event) => openDialog(event.currentTarget)}>Vincular fornecedor</Button></div>
            {notice && <Feedback severity="success">{notice}</Feedback>}
            {optionsError && <Feedback severity="error">{optionsError}</Feedback>}
            {suppliers.length === 0 ? <p className="rounded-xl bg-history-card-header p-4 text-sm text-history-muted">Nenhum fornecedor associado a este produto.</p> : <div className="min-w-0 overflow-x-auto" role="region" aria-label="Fornecedores associados ao produto" tabIndex={0}><table className="w-full min-w-120 text-left font-k2d text-sm"><thead className="bg-history-card-header text-xs text-history-muted"><tr><th className="rounded-l-xl px-3 py-2.5" scope="col">Fornecedor</th><th className="px-3 py-2.5" scope="col">Código</th><th className="px-3 py-2.5" scope="col">Preço de referência</th><th className="rounded-r-xl px-3 py-2.5" scope="col">Prazo</th></tr></thead><tbody className="divide-y divide-history-border">{suppliers.map((supplier) => <tr key={supplier.supplier.id}><th className="px-3 py-3 text-left font-semibold text-sidebar-text" scope="row">{supplier.supplier.legalName}</th><td className="px-3 py-3 text-history-muted">{supplier.supplierCode || "—"}</td><td className="px-3 py-3 text-sidebar-text">{supplier.referencePrice === null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(supplier.referencePrice)}</td><td className="px-3 py-3 text-sidebar-text">{supplier.leadTimeDays === null ? "—" : `${supplier.leadTimeDays} dias`}</td></tr>)}</tbody></table></div>}
            <dialog ref={dialogRef} className="m-auto max-h-dvh w-11/12 max-w-128 overflow-y-auto rounded-3xl border border-history-border bg-surface p-0 text-sidebar-text shadow-2xl backdrop:bg-black/50" aria-labelledby="associar-fornecedor-titulo" onCancel={(event) => { event.preventDefault(); setOpen(false); }}>
                <form className="flex min-w-0 flex-col gap-4 p-5 sm:p-7" onSubmit={(event) => void submit(event)} noValidate>
                    <div><h3 id="associar-fornecedor-titulo" className="font-k2d text-xl font-bold text-sidebar-purple">Vincular fornecedor</h3><p className="mt-1 text-sm leading-relaxed text-history-muted">A associação registra código, preço de referência e prazo específicos deste produto.</p></div>
                    {formError && <Feedback severity="error">{formError}</Feedback>}
                    {loadingOptions ? <p role="status" aria-live="polite" className="text-sm text-history-muted">Carregando fornecedores ativos…</p> : availableSuppliers.length === 0 ? <p className="rounded-xl bg-history-card-header p-4 text-sm leading-relaxed text-history-muted">Não há fornecedores ativos disponíveis para vincular. Os já associados não aparecem nesta lista.</p> : <>
                        <div className="min-w-0"><label className="mb-1.5 block text-sm font-bold text-sidebar-purple" htmlFor="fornecedor-supplierId">Fornecedor</label><select id="fornecedor-supplierId" className="min-h-11 w-full rounded-xl border border-login-field-border bg-login-field px-3 py-2 text-sm text-login-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={values.supplierId} aria-invalid={Boolean(errors.supplierId)} aria-describedby={errors.supplierId ? "fornecedor-supplierId-erro" : undefined} onChange={(event) => updateValue("supplierId", event.target.value)}><option value="">Selecione um fornecedor</option>{availableSuppliers.map((option) => <option value={option.id} key={option.id}>{option.legalName}</option>)}</select>{errors.supplierId && <p id="fornecedor-supplierId-erro" className="mt-1 text-sm text-feedback-error" role="alert">{errors.supplierId}</p>}</div>
                        <div className="min-w-0"><label className="mb-1.5 block text-sm font-bold text-sidebar-purple" htmlFor="fornecedor-supplierCode">Código do produto no fornecedor <span className="font-normal text-history-muted">(opcional)</span></label><Input id="fornecedor-supplierCode" variant="text" maxLength={50} value={values.supplierCode} aria-invalid={Boolean(errors.supplierCode)} aria-describedby={errors.supplierCode ? "fornecedor-supplierCode-erro" : undefined} onChange={(event) => updateValue("supplierCode", event.target.value)} />{errors.supplierCode && <p id="fornecedor-supplierCode-erro" className="mt-1 text-sm text-feedback-error" role="alert">{errors.supplierCode}</p>}</div>
                        <div className="grid min-w-0 gap-3 sm:grid-cols-2"><div className="min-w-0"><label className="mb-1.5 block text-sm font-bold text-sidebar-purple" htmlFor="fornecedor-referencePrice">Preço de referência (R$)</label><Input id="fornecedor-referencePrice" variant="text" type="number" min="0" step="0.01" inputMode="decimal" value={values.referencePrice} aria-invalid={Boolean(errors.referencePrice)} aria-describedby={errors.referencePrice ? "fornecedor-referencePrice-erro" : undefined} onChange={(event) => updateValue("referencePrice", event.target.value)} />{errors.referencePrice && <p id="fornecedor-referencePrice-erro" className="mt-1 text-sm text-feedback-error" role="alert">{errors.referencePrice}</p>}</div><div className="min-w-0"><label className="mb-1.5 block text-sm font-bold text-sidebar-purple" htmlFor="fornecedor-leadTimeDays">Prazo de entrega (dias)</label><Input id="fornecedor-leadTimeDays" variant="text" type="number" min="0" step="1" inputMode="numeric" value={values.leadTimeDays} aria-invalid={Boolean(errors.leadTimeDays)} aria-describedby={errors.leadTimeDays ? "fornecedor-leadTimeDays-erro" : undefined} onChange={(event) => updateValue("leadTimeDays", event.target.value)} />{errors.leadTimeDays && <p id="fornecedor-leadTimeDays-erro" className="mt-1 text-sm text-feedback-error" role="alert">{errors.leadTimeDays}</p>}</div></div>
                    </>}
                    <div className="flex flex-wrap justify-end gap-2 border-t border-history-border pt-4"><Button variant="icon" className="min-h-10 rounded-xl border border-history-border px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" type="button" disabled={saving} onClick={() => setOpen(false)}>Cancelar</Button><Button variant="primary" className="min-h-10 rounded-xl px-4 py-2 text-sm" type="submit" disabled={saving || loadingOptions || availableSuppliers.length === 0}>{saving ? "Vinculando…" : "Vincular fornecedor"}</Button></div>
                </form>
            </dialog>
        </section>
    );
}

export default ProductSupplierPanel;
