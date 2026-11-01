import { useId } from "react";
import type { Supplier } from "../../../types/suppliers";
import { formatSupplierCnpj } from "../../../utils/validateSupplier";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import Feedback from "../../ui/Feedback";
import SupplierAvatar from "./SupplierAvatar";
import SupplierPhotoField from "./SupplierPhotoField";
import SupplierStatusBadge from "./SupplierStatusBadge";

interface SupplierDetailDialogProps {
    open: boolean;
    supplier: Supplier | null;
    canManage: boolean;
    photoFile: File | null;
    photoBusy: boolean;
    photoError: string | null;
    photoNotice: string | null;
    loading: boolean;
    loadError: string | null;
    onOpenChange: (open: boolean) => void;
    onEdit: (supplier: Supplier) => void;
    onChangeStatus: (supplier: Supplier) => void;
    onSelectPhoto: (file: File | null) => void;
    onUploadPhoto: () => void;
    onRemovePhoto: () => void;
}

function formatCreatedAt(createdAt: string): string {
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime())
        ? "Data indisponível"
        : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function SupplierDetailDialog({ open, supplier, canManage, photoFile, photoBusy, photoError, photoNotice, loading, loadError, onOpenChange, onEdit, onChangeStatus, onSelectPhoto, onUploadPhoto, onRemovePhoto }: SupplierDetailDialogProps) {
    const id = useId();
    const whatsappDigits = supplier?.whatsapp?.replace(/\D/g, "") ?? "";

    return (
        <Dialog open={open && Boolean(supplier)} onOpenChange={onOpenChange} aria-labelledby={`${id}-title`} placement="top" className="max-w-3xl">
            {supplier && <div className="flex max-h-[calc(100dvh-2rem)] min-w-0 flex-col">
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-history-border px-5 py-5 sm:px-7">
                    <div className="min-w-0">
                        <h2 id={`${id}-title`} className="font-k2d text-xl font-bold text-sidebar-text">Detalhes do fornecedor</h2>
                        <p className="mt-1 text-sm text-history-muted">Cadastro compartilhado entre cozinhas.</p>
                    </div>
                    <Button variant="icon" type="button" onClick={() => onOpenChange(false)} aria-label="Fechar detalhes" className="size-10 rounded-full bg-history-card-header text-history-muted">×</Button>
                </header>

                <div className="grid min-h-0 min-w-0 flex-1 gap-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
                    {loading && <p className="text-sm text-history-muted" role="status" aria-live="polite">Atualizando os dados do fornecedor…</p>}
                    {loadError && <Feedback severity="info">Os dados detalhados não puderam ser atualizados. As informações da lista continuam disponíveis. {loadError}</Feedback>}
                    <section className="flex min-w-0 flex-wrap items-center gap-4 rounded-3xl bg-history-card-header p-4 sm:p-5" aria-label="Identificação do fornecedor">
                        <SupplierAvatar supplier={supplier} size="large" />
                        <div className="min-w-0 flex-1">
                            <h3 className="wrap-anywhere font-k2d text-lg font-bold text-sidebar-text">{supplier.legalName}</h3>
                            <p className="mt-1 wrap-anywhere text-sm text-history-muted">CNPJ {formatSupplierCnpj(supplier.cnpj) || supplier.cnpj}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <SupplierStatusBadge active={supplier.active} />
                                <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-sidebar-active px-3 py-1 font-k2d text-xs font-bold text-sidebar-purple">
                                    CNPJ não muda
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-3 sm:grid-cols-2" aria-label="Contato do fornecedor">
                        <div className="min-w-0 rounded-2xl border border-history-border p-4">
                            <p className="text-xs text-history-muted">E-mail</p>
                            {supplier.email ? <a className="mt-1 block min-w-0 wrap-anywhere font-k2d text-sm font-semibold text-sidebar-text underline decoration-sidebar-line underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href={`mailto:${supplier.email}`}>{supplier.email}</a> : <p className="mt-1 text-sm text-history-muted">Não informado</p>}
                        </div>
                        <div className="min-w-0 rounded-2xl border border-history-border p-4">
                            <p className="text-xs text-history-muted">WhatsApp</p>
                            {supplier.whatsapp ? whatsappDigits ? <a className="mt-1 block wrap-anywhere font-k2d text-sm font-semibold text-sidebar-text underline decoration-sidebar-line underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer">{supplier.whatsapp}</a> : <p className="mt-1 wrap-anywhere text-sm font-semibold text-sidebar-text">{supplier.whatsapp}</p> : <p className="mt-1 text-sm text-history-muted">Não informado</p>}
                        </div>
                        <div className="rounded-2xl border border-history-border p-4 sm:col-span-2">
                            <p className="text-xs text-history-muted">Cadastrado em</p>
                            <p className="mt-1 font-k2d text-sm font-semibold text-sidebar-text">{formatCreatedAt(supplier.createdAt)}</p>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-3" aria-label="Foto do fornecedor">
                        <SupplierPhotoField
                            name={supplier.legalName}
                            currentPhotoUrl={supplier.photoUrl}
                            selectedFile={photoFile}
                            onSelect={onSelectPhoto}
                            onRemovePhoto={canManage && supplier.photoUrl && !photoFile ? onRemovePhoto : undefined}
                            disabled={!canManage || photoBusy}
                        />
                        {photoError && <Feedback severity="error">{photoError}</Feedback>}
                        {photoNotice && <Feedback severity="success">{photoNotice}</Feedback>}
                        {canManage && photoFile && <Button variant="standard" type="button" onClick={onUploadPhoto} disabled={photoBusy} className="justify-self-start">{photoBusy ? "Enviando foto…" : "Enviar foto"}</Button>}
                        {photoBusy && <p className="sr-only" role="status" aria-live="polite">Salvando foto do fornecedor…</p>}
                    </section>

                    <Feedback severity="info">Este fornecedor não é vinculado automaticamente a uma cozinha ou produto. O vínculo com produtos é feito na tela de Produtos.</Feedback>
                </div>

                <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-history-border bg-history-card-header px-5 py-4 sm:px-7">
                    {canManage ? (
                        <Button variant="outline" type="button" onClick={() => onChangeStatus(supplier)} disabled={photoBusy} className={supplier.active ? "border-feedback-error/40 text-feedback-error hover:bg-feedback-error-bg" : "border-feedback-success/40 text-feedback-success hover:bg-feedback-success-bg"}>
                            {supplier.active ? "Desativar fornecedor" : "Reativar fornecedor"}
                        </Button>
                    ) : <span className="text-xs text-history-muted">Edição, foto e situação são exclusivas de supervisor.</span>}
                    <div className="ml-auto flex flex-wrap justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Fechar</Button>
                        {canManage && <Button variant="standard" type="button" onClick={() => onEdit(supplier)}>Editar fornecedor</Button>}
                    </div>
                </footer>
            </div>}
        </Dialog>
    );
}

export default SupplierDetailDialog;
