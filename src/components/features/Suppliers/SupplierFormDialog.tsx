import { useEffect, useId, useState, type FormEvent } from "react";
import type { Supplier, SupplierDialogMode } from "../../../types/suppliers";
import { formatSupplierCnpj, validateSupplier, type SupplierFormErrors, type SupplierFormValues } from "../../../utils/validateSupplier";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";
import SupplierPhotoField from "./SupplierPhotoField";

export interface SupplierFormSubmission {
    values: SupplierFormValues;
    photo: File | null;
    removePhoto: boolean;
}

interface SupplierFormDialogProps {
    open: boolean;
    mode: SupplierDialogMode;
    supplier?: Supplier | null;
    saving: boolean;
    error: string | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (submission: SupplierFormSubmission) => void;
}

const emptyValues: SupplierFormValues = { legalName: "", cnpj: "", email: "", whatsapp: "" };

function valuesFromSupplier(supplier?: Supplier | null): SupplierFormValues {
    return supplier ? {
        legalName: supplier.legalName,
        cnpj: formatSupplierCnpj(supplier.cnpj),
        email: supplier.email ?? "",
        whatsapp: supplier.whatsapp ?? "",
    } : emptyValues;
}

function SupplierFormDialog({ open, mode, supplier = null, saving, error, onOpenChange, onSubmit }: SupplierFormDialogProps) {
    const id = useId();
    const [values, setValues] = useState<SupplierFormValues>(() => valuesFromSupplier(supplier));
    const [errors, setErrors] = useState<SupplierFormErrors>({});
    const [photo, setPhoto] = useState<File | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const editing = mode === "edit";

    useEffect(() => {
        if (!open) return;
        setValues(valuesFromSupplier(supplier));
        setErrors({});
        setPhoto(null);
        setRemovePhoto(false);
    }, [open, mode, supplier]);

    function update<K extends keyof SupplierFormValues>(field: K, value: SupplierFormValues[K]) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextErrors = validateSupplier(values);

        if (editing && supplier?.email && !values.email.trim()) {
            nextErrors.email = "A API não permite apagar um e-mail já cadastrado. Mantenha ou substitua o valor.";
        }
        if (editing && supplier?.whatsapp && !values.whatsapp.trim()) {
            nextErrors.whatsapp = "A API não permite apagar um WhatsApp já cadastrado. Mantenha ou substitua o valor.";
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        onSubmit({ values, photo, removePhoto });
    }

    function fieldDescription(field: keyof SupplierFormValues, helpId: string): string {
        return errors[field] ? `${helpId} ${id}-${field}-error` : helpId;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} aria-labelledby={`${id}-title`} className="flex max-h-dvh max-w-2xl flex-col">
            <form onSubmit={submit} noValidate aria-busy={saving} className="flex min-h-0 flex-col">
                <header className="flex items-start justify-between gap-4 border-b border-history-border px-5 py-5 sm:px-7">
                    <div className="min-w-0">
                        <h2 id={`${id}-title`} className="font-k2d text-xl font-bold text-sidebar-text">{editing ? "Editar fornecedor" : "Novo fornecedor"}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-history-muted">{editing ? "Atualize os dados deste cadastro compartilhado." : "Cadastre uma empresa fornecedora para todas as cozinhas."}</p>
                    </div>
                    <Button variant="icon" type="button" onClick={() => onOpenChange(false)} disabled={saving} aria-label="Fechar cadastro" className="size-10 rounded-full bg-history-card-header text-history-muted">×</Button>
                </header>

                <div className="grid min-h-0 min-w-0 flex-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-7">
                    {error && <Feedback severity="error" className="sm:col-span-2">{error}</Feedback>}
                    {saving && <p className="sr-only sm:col-span-2" role="status" aria-live="polite">Salvando fornecedor…</p>}
                    <div className="grid min-w-0 gap-1.5 sm:col-span-2">
                        <label htmlFor={`${id}-legal-name`} className="font-k2d text-sm font-bold text-sidebar-text">Razão social <span aria-hidden="true">*</span></label>
                        <Input id={`${id}-legal-name`} value={values.legalName} onChange={(event) => update("legalName", event.target.value)} maxLength={150} autoComplete="organization" required disabled={saving} aria-invalid={Boolean(errors.legalName)} aria-describedby={fieldDescription("legalName", `${id}-legal-name-help`)} />
                        <p id={`${id}-legal-name-help`} className="text-xs text-history-muted">Obrigatória, até 150 caracteres.</p>
                        {errors.legalName && <p id={`${id}-legalName-error`} className="text-sm text-feedback-error" role="alert">{errors.legalName}</p>}
                    </div>

                    <div className="grid min-w-0 gap-1.5 sm:col-span-2">
                        <label htmlFor={`${id}-cnpj`} className="font-k2d text-sm font-bold text-sidebar-text">CNPJ <span aria-hidden="true">*</span></label>
                        <Input id={`${id}-cnpj`} value={values.cnpj} onChange={(event) => update("cnpj", formatSupplierCnpj(event.target.value))} maxLength={18} inputMode="numeric" autoComplete="off" required readOnly={editing} disabled={saving} aria-invalid={Boolean(errors.cnpj)} aria-describedby={fieldDescription("cnpj", `${id}-cnpj-help`)} />
                        <p id={`${id}-cnpj-help`} className="text-xs text-history-muted">{editing ? "CNPJ é único e não pode ser alterado depois do cadastro." : "Informe os 14 dígitos. O CNPJ não poderá ser alterado depois."}</p>
                        {errors.cnpj && <p id={`${id}-cnpj-error`} className="text-sm text-feedback-error" role="alert">{errors.cnpj}</p>}
                    </div>

                    <div className="grid min-w-0 gap-1.5">
                        <label htmlFor={`${id}-email`} className="font-k2d text-sm font-bold text-sidebar-text">E-mail <span className="font-normal text-history-muted">· opcional</span></label>
                        <Input id={`${id}-email`} type="email" value={values.email} onChange={(event) => update("email", event.target.value)} maxLength={150} autoComplete="email" disabled={saving} aria-invalid={Boolean(errors.email)} aria-describedby={fieldDescription("email", `${id}-email-help`)} />
                        <p id={`${id}-email-help`} className="text-xs leading-relaxed text-history-muted">Até 150 caracteres.{editing && supplier?.email ? " Para remover, a API precisa oferecer essa operação; por enquanto, mantenha ou substitua." : ""}</p>
                        {errors.email && <p id={`${id}-email-error`} className="text-sm text-feedback-error" role="alert">{errors.email}</p>}
                    </div>

                    <div className="grid min-w-0 gap-1.5">
                        <label htmlFor={`${id}-whatsapp`} className="font-k2d text-sm font-bold text-sidebar-text">WhatsApp <span className="font-normal text-history-muted">· opcional</span></label>
                        <Input id={`${id}-whatsapp`} type="tel" value={values.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} maxLength={20} autoComplete="tel" disabled={saving} aria-invalid={Boolean(errors.whatsapp)} aria-describedby={fieldDescription("whatsapp", `${id}-whatsapp-help`)} />
                        <p id={`${id}-whatsapp-help`} className="text-xs leading-relaxed text-history-muted">Até 20 caracteres.{editing && supplier?.whatsapp ? " Para remover, a API precisa oferecer essa operação; por enquanto, mantenha ou substitua." : ""}</p>
                        {errors.whatsapp && <p id={`${id}-whatsapp-error`} className="text-sm text-feedback-error" role="alert">{errors.whatsapp}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <SupplierPhotoField name={values.legalName || "Fornecedor"} currentPhotoUrl={supplier?.photoUrl} selectedFile={photo} onSelect={setPhoto} onRemovePhoto={supplier?.photoUrl ? () => { setRemovePhoto(true); setPhoto(null); } : undefined} onCancelRemoval={() => setRemovePhoto(false)} removalPending={removePhoto} disabled={saving} />
                        <p className="mt-2 text-xs leading-relaxed text-history-muted">{editing ? "Alterações na foto são aplicadas junto com os dados." : "A foto é enviada depois do cadastro, quando o fornecedor recebe um identificador."}</p>
                    </div>
                </div>

                <footer className="flex flex-wrap justify-end gap-2 border-t border-history-border bg-history-card-header px-5 py-4 sm:px-7">
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
                    <Button variant="standard" type="submit" disabled={saving}>{saving ? "Salvando…" : editing ? "Salvar alterações" : "Cadastrar fornecedor"}</Button>
                </footer>
            </form>
        </Dialog>
    );
}

export default SupplierFormDialog;
