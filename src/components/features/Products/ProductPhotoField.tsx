import { useId } from "react";
import type { ChangeEvent } from "react";
import boxIcon from "../../../assets/icons/caixa.svg";

interface ProductPhotoFieldProps {
    preview: string | null;
    fileName: string | null;
    error: string | null;
    onSelect: (file: File | null) => void;
}

function ProductPhotoField({ preview, fileName, error, onSelect }: ProductPhotoFieldProps) {
    const id = useId();

    function selectFile(event: ChangeEvent<HTMLInputElement>) {
        onSelect(event.target.files?.[0] ?? null);
        event.target.value = "";
    }

    return (
        <section className="flex min-w-0 flex-col gap-3 rounded-3xl bg-surface p-5 shadow-history-card" aria-labelledby={`${id}-titulo`}>
            <div>
                <h2 id={`${id}-titulo`} className="font-k2d text-lg font-bold text-sidebar-text">Foto do produto</h2>
                <p className="mt-1 text-sm leading-relaxed text-history-muted">Opcional. A foto é enviada separadamente após salvar os dados do produto.</p>
            </div>
            <div className="flex min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-sidebar-line bg-history-card-header p-5 text-center">
                <img className="size-24 rounded-2xl bg-surface object-contain p-2" src={preview || boxIcon} alt={preview ? "Prévia da foto selecionada" : ""} />
                {fileName ? <p className="max-w-full wrap-anywhere text-sm font-semibold text-sidebar-text">{fileName}</p> : <p className="text-sm text-history-muted">Arraste uma imagem para cá ou escolha um arquivo.</p>}
                <label htmlFor={id} className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-brand bg-surface px-4 py-2 font-k2d text-sm font-bold text-brand hover:bg-sidebar-active focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
                    Escolher foto
                    <input id={id} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} aria-describedby={error ? `${id}-erro` : `${id}-ajuda`} />
                </label>
                <p id={`${id}-ajuda`} className="text-xs leading-relaxed text-history-muted">JPEG, PNG ou WebP. O servidor valida o conteúdo do arquivo.</p>
                {error && <p id={`${id}-erro`} className="text-sm font-semibold text-feedback-error" role="alert">{error}</p>}
            </div>
        </section>
    );
}

export default ProductPhotoField;
