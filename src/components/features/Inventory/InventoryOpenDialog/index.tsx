import Icon from "../../../ui/Icon";
import { useEffect, useId, useState, type FormEvent } from "react";
import Button from "../../../ui/Button/index";
import Dialog from "../../../ui/Dialog/index";
import Feedback from "../../../ui/Feedback/index";
import { validateInventoryNote } from "../../../../utils/inventoryValidation";

interface InventoryOpenDialogProps {
    open: boolean;
    saving: boolean;
    error: string | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (note: string) => Promise<boolean>;
}

export default function InventoryOpenDialog({ open, saving, error, onOpenChange, onSubmit }: InventoryOpenDialogProps) {
    const id = useId();
    const [note, setNote] = useState("");
    const [noteError, setNoteError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setNote("");
            setNoteError(null);
        }
    }, [open]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validationError = validateInventoryNote(note);
        setNoteError(validationError);
        if (validationError) return;
        if (await onSubmit(note)) onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} aria-labelledby={`${id}-title`} placement="top" className="max-w-xl">
            <form className="grid min-w-0 gap-5 p-5 sm:p-6" onSubmit={(event) => void submit(event)} noValidate aria-busy={saving}>
                <header className="flex min-w-0 items-start justify-between gap-4">
                    <div className="grid min-w-0 gap-1">
                        <h2 id={`${id}-title`} className="m-0 font-k2d text-xl font-bold text-ink sm:text-2xl">Novo inventário</h2>
                        <p className="m-0 text-sm leading-relaxed text-history-muted">Abra uma contagem física para os lotes da cozinha atual. Só pode existir um inventário aberto por vez.</p>
                    </div>
                    <Button variant="icon" type="button" className="shrink-0 rounded-full text-xl text-history-muted hover:bg-history-card-header" aria-label="Fechar diálogo" disabled={saving} onClick={() => onOpenChange(false)}><Icon name="close" className="size-4" /></Button>
                </header>

                <div className="grid min-w-0 content-start gap-1">
                    <label htmlFor={`${id}-note`} className="font-semibold text-ink">Observação <span className="font-normal text-history-muted">· opcional</span></label>
                    <textarea
                        id={`${id}-note`}
                        autoFocus
                        rows={3}
                        maxLength={255}
                        value={note}
                        onChange={(event) => { setNote(event.target.value); setNoteError(null); }}
                        className="min-h-24 min-w-0 resize-y rounded-xl border border-history-border bg-history-card-header px-3 py-2 text-ink outline-none placeholder:text-history-muted focus-visible:border-sidebar-indicator focus-visible:ring-4 focus-visible:ring-sidebar-active"
                        aria-invalid={Boolean(noteError)}
                        aria-describedby={noteError ? `${id}-error` : `${id}-help`}
                    />
                    <p id={`${id}-help`} className="m-0 text-xs leading-relaxed text-history-muted">Até 255 caracteres. Ex.: contagem mensal do almoxarifado.</p>
                    {noteError && <p id={`${id}-error`} role="alert" className="m-0 text-sm text-feedback-error">{noteError}</p>}
                </div>

                {error && <Feedback severity="error">{error}</Feedback>}
                {saving && <p className="sr-only" role="status" aria-live="polite">Abrindo inventário…</p>}
                <footer className="flex min-w-0 flex-wrap justify-end gap-2 border-t border-history-border pt-4">
                    <Button variant="outline" type="button" disabled={saving} onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button variant="standard" type="submit" disabled={saving}>
                        {saving ? "Abrindo inventário…" : "Abrir inventário"}
                    </Button>
                </footer>
            </form>
        </Dialog>
    );
}
