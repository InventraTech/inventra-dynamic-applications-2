import { useEffect, useId, useState, type ChangeEvent } from "react";
import type { Supplier } from "../../../types/suppliers";
import { validateSupplierPhoto } from "../../../utils/validateSupplier";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import SupplierAvatar from "./SupplierAvatar";

interface SupplierPhotoFieldProps {
    name: string;
    currentPhotoUrl?: string | null;
    selectedFile: File | null;
    onSelect: (file: File | null) => void;
    onRemovePhoto?: () => void;
    onCancelRemoval?: () => void;
    removalPending?: boolean;
    disabled?: boolean;
}

function SupplierPhotoField({ name, currentPhotoUrl = null, selectedFile, onSelect, onRemovePhoto, onCancelRemoval, removalPending = false, disabled = false }: SupplierPhotoFieldProps) {
    const id = useId();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const displayedPhoto = removalPending ? null : previewUrl ?? currentPhotoUrl;
    const supplierAvatar: Pick<Supplier, "legalName" | "photoUrl"> = { legalName: name, photoUrl: displayedPhoto };

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    function selectFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        event.target.value = "";
        if (!file) return;
        const message = validateSupplierPhoto(file);
        setError(message);
        if (!message) {
            onSelect(file);
            onCancelRemoval?.();
        }
    }

    function clearSelectedFile() {
        setError(null);
        onSelect(null);
    }

    return (
        <div className="grid min-w-0 gap-3" aria-labelledby={`${id}-title`}>
            <h3 id={`${id}-title`} className="font-k2d text-sm font-bold text-sidebar-text">Foto do fornecedor</h3>
            <div className="flex min-w-0 flex-wrap items-center gap-4 rounded-2xl border-2 border-dashed border-sidebar-line bg-history-card-header p-4">
                <SupplierAvatar supplier={supplierAvatar} size="medium" />
                <div className="min-w-0 flex-1">
                    <p className="font-k2d text-sm font-semibold text-sidebar-text">{selectedFile ? selectedFile.name : displayedPhoto ? "Foto cadastrada" : "Sem foto"}</p>
                    <p id={`${id}-help`} className="mt-1 text-xs leading-relaxed text-history-muted">JPEG, PNG ou WebP, até 5 MB. Sem foto, o Inventra mostra as iniciais da razão social.</p>
                    {removalPending && <p className="mt-1 text-xs font-semibold text-feedback-error">A foto será removida ao salvar as alterações.</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <label htmlFor={id} className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-history-border bg-surface px-3 py-2 font-k2d text-sm font-bold text-sidebar-purple transition-colors hover:bg-sidebar-active focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus has-disabled:cursor-not-allowed has-disabled:opacity-60">
                            {selectedFile || displayedPhoto ? "Trocar foto" : "Escolher foto"}
                            <input id={id} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} disabled={disabled} aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`} />
                        </label>
                        {selectedFile && <Button variant="ghost" type="button" onClick={clearSelectedFile} disabled={disabled} className="text-history-muted">Remover seleção</Button>}
                        {!selectedFile && displayedPhoto && onRemovePhoto && <Button variant="outline" type="button" onClick={onRemovePhoto} disabled={disabled} className="min-h-10 border-feedback-error/40 text-feedback-error hover:bg-feedback-error-bg">Remover foto</Button>}
                        {removalPending && onCancelRemoval && <Button variant="ghost" type="button" onClick={onCancelRemoval} disabled={disabled}>Manter foto</Button>}
                    </div>
                </div>
            </div>
            {error && <Feedback severity="error" id={`${id}-error`}>{error}</Feedback>}
        </div>
    );
}

export default SupplierPhotoField;
