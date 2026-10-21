import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { ProductCategory, ProductUnit } from "../../../types/products";
import { ApiError } from "../../../services/api";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";
import SearchField from "../../ui/SearchField";

export type ProductReferenceKind = "category" | "unit";
export type ProductReference = ProductCategory | ProductUnit;

interface ProductReferencePanelProps {
    kind: ProductReferenceKind;
    items: ProductReference[];
    loading: boolean;
    onSave: (id: number | null, primary: string, description: string) => Promise<void>;
    onDelete: (item: ProductReference) => Promise<void>;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    return "Não foi possível salvar. Tente novamente.";
}

function getPrimary(item: ProductReference, kind: ProductReferenceKind): string {
    return kind === "category" ? (item as ProductCategory).name : (item as ProductUnit).symbol;
}

function ProductReferencePanel({ kind, items, loading, onSave, onDelete }: ProductReferencePanelProps) {
    const id = `referencia-${kind}`;
    const title = kind === "category" ? "Categorias" : "Unidades de medida";
    const primaryLabel = kind === "category" ? "Nome da categoria" : "Símbolo";
    const primaryMaxLength = kind === "category" ? 80 : 10;
    const descriptionMaxLength = kind === "category" ? 255 : 60;
    const [query, setQuery] = useState("");
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<ProductReference | null>(null);
    const [primary, setPrimary] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<ProductReference | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (pendingDelete && !dialog.open) dialog.showModal();
        if (!pendingDelete && dialog.open) {
            dialog.close();
            requestAnimationFrame(() => deleteTriggerRef.current?.focus());
        }
    }, [pendingDelete]);

    const visibleItems = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
        if (!normalizedQuery) return items;
        return items.filter((item) => `${getPrimary(item, kind)} ${item.description}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
    }, [items, kind, query]);

    function startCreate() {
        setEditing(null);
        setPrimary("");
        setDescription("");
        setFormError(null);
        setCreating(true);
    }

    function startEdit(item: ProductReference) {
        setEditing(item);
        setPrimary(getPrimary(item, kind));
        setDescription(item.description ?? "");
        setFormError(null);
        setCreating(true);
    }

    function closeForm() {
        setCreating(false);
        setEditing(null);
        setFormError(null);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedPrimary = primary.trim();
        if (!trimmedPrimary) { setFormError(`Informe ${kind === "category" ? "o nome da categoria" : "o símbolo da unidade"}.`); document.getElementById(`${id}-primary`)?.focus(); return; }
        if (trimmedPrimary.length > primaryMaxLength) { setFormError(`Este campo pode ter até ${primaryMaxLength} caracteres.`); document.getElementById(`${id}-primary`)?.focus(); return; }
        if (kind === "unit" && !description.trim()) { setFormError("Informe a descrição da unidade."); document.getElementById(`${id}-description`)?.focus(); return; }
        if (description.trim().length > descriptionMaxLength) { setFormError(`A descrição pode ter até ${descriptionMaxLength} caracteres.`); document.getElementById(`${id}-description`)?.focus(); return; }
        setSaving(true);
        setFormError(null);
        setError(null);
        setNotice(null);
        try {
            await onSave(editing?.id ?? null, trimmedPrimary, description.trim());
            setNotice(`${kind === "category" ? "Categoria" : "Unidade"} ${editing ? "atualizada" : "criada"}.`);
            closeForm();
        } catch (saveError: unknown) {
            setFormError(getErrorMessage(saveError));
        } finally {
            setSaving(false);
        }
    }

    async function confirmDelete() {
        if (!pendingDelete) return;
        setDeleting(true);
        setError(null);
        setNotice(null);
        try {
            await onDelete(pendingDelete);
            setNotice(`${kind === "category" ? "Categoria" : "Unidade"} excluída.`);
            setPendingDelete(null);
        } catch (deleteError: unknown) {
            setError(getErrorMessage(deleteError));
        } finally {
            setDeleting(false);
        }
    }

    return (
        <section className="flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5" aria-labelledby={`${id}-titulo`}>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><div><h2 id={`${id}-titulo`} className="font-k2d text-lg font-bold text-sidebar-text">{title}</h2><p className="mt-1 text-sm text-history-muted">{items.length} {items.length === 1 ? "registro" : "registros"}</p></div><Button variant="icon" type="button" className="min-h-10 min-w-0 rounded-xl bg-brand px-3 font-k2d text-sm font-bold text-on-brand hover:bg-brand-strong" onClick={startCreate}>+ Nova {kind === "category" ? "categoria" : "unidade"}</Button></div>
            {error && <Feedback severity="error">{error}</Feedback>}{notice && <Feedback severity="success">{notice}</Feedback>}
            <SearchField className="w-full" label={`Buscar ${title.toLocaleLowerCase("pt-BR")}`} placeholder={`Buscar ${kind === "category" ? "categoria" : "unidade"}`} value={query} onChange={(event) => setQuery(event.target.value)} />
            {loading ? <p className="rounded-xl bg-history-card-header p-4 text-sm text-history-muted" role="status" aria-live="polite">Carregando {title.toLocaleLowerCase("pt-BR")}…</p> : visibleItems.length === 0 ? <p className="rounded-xl bg-history-card-header p-4 text-sm leading-relaxed text-history-muted">{query ? "Nenhum resultado para esta busca." : `Ainda não há ${title.toLocaleLowerCase("pt-BR")} cadastradas.`}</p> : <ul className="flex min-w-0 flex-col divide-y divide-history-border">{visibleItems.map((item) => <li className="flex min-w-0 flex-wrap items-center gap-3 py-3" key={item.id}><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-active font-k2d text-sm font-bold text-sidebar-purple" aria-hidden="true">{getPrimary(item, kind).slice(0, 2)}</span><span className="min-w-0 flex-1"><span className="block wrap-anywhere font-semibold text-sidebar-text">{getPrimary(item, kind)}</span><span className="block wrap-anywhere text-sm text-history-muted">{item.description || "Sem descrição"}</span></span><span className="flex gap-1"><Button variant="icon" type="button" aria-label={`Editar ${kind === "category" ? "categoria" : "unidade"} ${getPrimary(item, kind)}`} className="min-h-9 min-w-9 rounded-lg px-2 text-sm font-bold text-link hover:bg-sidebar-active" onClick={() => startEdit(item)}>Editar</Button><Button ref={deleteTriggerRef} variant="icon" type="button" aria-label={`Excluir ${kind === "category" ? "categoria" : "unidade"} ${getPrimary(item, kind)}`} className="min-h-9 min-w-9 rounded-lg px-2 text-sm font-bold text-feedback-error hover:bg-feedback-error-bg" onClick={(event) => { deleteTriggerRef.current = event.currentTarget; setPendingDelete(item); }}>Excluir</Button></span></li>)}</ul>}

            {creating && <form className="flex min-w-0 flex-col gap-3 rounded-2xl border-2 border-dashed border-sidebar-line bg-history-card-header p-4" onSubmit={(event) => void submit(event)} noValidate>
                <h3 className="font-k2d font-bold text-sidebar-text">{editing ? `Editar ${kind === "category" ? "categoria" : "unidade"}` : `Nova ${kind === "category" ? "categoria" : "unidade"}`}</h3>
                {formError && <Feedback severity="error">{formError}</Feedback>}
                <div className="min-w-0"><label className="mb-1 block text-sm font-semibold text-sidebar-text" htmlFor={`${id}-primary`}>{primaryLabel}</label><Input id={`${id}-primary`} variant="text" value={primary} maxLength={primaryMaxLength} autoFocus required onChange={(event) => setPrimary(event.target.value)} /></div>
                <div className="min-w-0"><label className="mb-1 block text-sm font-semibold text-sidebar-text" htmlFor={`${id}-description`}>Descrição {kind === "unit" && <span className="text-feedback-error">(obrigatória)</span>}</label><Input id={`${id}-description`} variant="text" value={description} maxLength={descriptionMaxLength} required={kind === "unit"} placeholder={kind === "category" ? "Ex.: Grãos e cereais" : "Ex.: Quilograma"} onChange={(event) => setDescription(event.target.value)} /></div>
                <div className="flex flex-wrap gap-2"><Button variant="icon" type="button" className="min-h-9 min-w-0 rounded-lg border border-history-border px-3 font-k2d text-sm font-bold text-sidebar-purple hover:bg-surface" disabled={saving} onClick={closeForm}>Cancelar</Button><Button variant="primary" type="submit" className="min-h-9 rounded-lg px-4 py-2 text-sm" disabled={saving}>{saving ? "Salvando…" : editing ? "Salvar alterações" : `Salvar ${kind === "category" ? "categoria" : "unidade"}`}</Button></div>
            </form>}

            <dialog ref={dialogRef} className="m-auto max-h-dvh w-11/12 max-w-112 rounded-3xl border border-history-border bg-surface p-0 text-sidebar-text shadow-2xl backdrop:bg-black/50" aria-labelledby={`${id}-excluir-titulo`} onCancel={(event) => { event.preventDefault(); setPendingDelete(null); }}>
                {pendingDelete && <div className="flex flex-col gap-4 p-6"><div><h3 id={`${id}-excluir-titulo`} className="font-k2d text-xl font-bold text-sidebar-purple">Excluir {kind === "category" ? "categoria" : "unidade"}?</h3><p className="mt-2 text-sm leading-relaxed text-history-muted">Confirme a exclusão de “{getPrimary(pendingDelete, kind)}”. Se houver produtos vinculados, o back-end pode recusar a operação.</p></div>{error && <Feedback severity="error">{error}</Feedback>}<div className="flex flex-wrap justify-end gap-2"><Button variant="icon" type="button" className="min-h-10 min-w-0 rounded-xl border border-history-border px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" disabled={deleting} onClick={() => setPendingDelete(null)}>Cancelar</Button><Button variant="primary" type="button" className="min-h-10 rounded-xl bg-feedback-error px-4 py-2 text-sm hover:bg-feedback-error/90" disabled={deleting} onClick={() => void confirmDelete()}>{deleting ? "Excluindo…" : "Excluir"}</Button></div></div>}
            </dialog>
        </section>
    );
}

export default ProductReferencePanel;
