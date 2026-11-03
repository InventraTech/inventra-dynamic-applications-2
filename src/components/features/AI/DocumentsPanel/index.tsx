import { useRef, useState } from "react";

import type { AIDocument, AIUploadResult } from "../../../../types/ai";
import Button from "../../../ui/Button";
import Dialog from "../../../ui/Dialog";
import Feedback from "../../../ui/Feedback";
import Loading from "../../../ui/Loading";
import StatusBadge from "../../../ui/StatusBadge";
import { supportedAIDocumentExtensions, validateAIDocumentSelection } from "../../../../utils/aiValidation";

interface DocumentsPanelProps {
    documents: AIDocument[];
    uploadResults: AIUploadResult[];
    loading: boolean;
    error: string | null;
    isSupervisor: boolean;
    ownedDocumentCount: number;
    onBack: () => void;
    onRefresh: () => Promise<void>;
    onUpload: (files: File[], shareWithKitchen: boolean) => Promise<boolean>;
    onDelete: (fileId: string) => Promise<boolean>;
}

interface DocumentUploadState {
    files: File[];
    shareWithKitchen: boolean;
    selectionError: string | null;
    isDragging: boolean;
}

interface DocumentDeletionState {
    document: AIDocument | null;
    isSubmitting: boolean;
    error: string | null;
}

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Data indisponível" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function DocumentsPanel({ documents, uploadResults, loading, error, isSupervisor, ownedDocumentCount, onBack, onRefresh, onUpload, onDelete }: DocumentsPanelProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploadState, setUploadState] = useState<DocumentUploadState>({ files: [], shareWithKitchen: false, selectionError: null, isDragging: false });
    const [deletionState, setDeletionState] = useState<DocumentDeletionState>({ document: null, isSubmitting: false, error: null });
    const { files: selectedFiles, shareWithKitchen, selectionError, isDragging } = uploadState;
    const { document: documentToDelete, isSubmitting: isDeleting, error: deleteError } = deletionState;

    function selectFiles(fileList: FileList | null) {
        if (!fileList) return;
        const files = Array.from(fileList).filter((file, index, allFiles) => allFiles.findIndex((candidate) => candidate.name === file.name && candidate.size === file.size && candidate.lastModified === file.lastModified) === index);
        const validationError = validateAIDocumentSelection(files, ownedDocumentCount);
        if (validationError) {
            setUploadState((current) => ({ ...current, selectionError: validationError }));
            return;
        }
        setUploadState((current) => ({ ...current, files, selectionError: null }));
    }

    async function submitFiles() {
        if (!selectedFiles.length || loading) return;
        const files = selectedFiles;
        try {
            const uploaded = await onUpload(files, shareWithKitchen);
            if (uploaded) {
                setUploadState((current) => ({ ...current, files: [], selectionError: null }));
                if (inputRef.current) inputRef.current.value = "";
            }
        } catch {
            setUploadState((current) => ({ ...current, selectionError: "Não foi possível enviar os arquivos. Confira a conexão e tente novamente." }));
        }
    }

    async function confirmDelete() {
        if (!documentToDelete) return;
        setDeletionState((current) => ({ ...current, isSubmitting: true, error: null }));
        try {
            const deleted = await onDelete(documentToDelete.arquivo_id);
            if (deleted) setDeletionState((current) => ({ ...current, document: null }));
            else setDeletionState((current) => ({ ...current, error: "Não foi possível remover o documento. Confira a conexão e tente novamente." }));
        } catch {
            setDeletionState((current) => ({ ...current, error: "Não foi possível remover o documento. Confira a conexão e tente novamente." }));
        } finally {
            setDeletionState((current) => ({ ...current, isSubmitting: false }));
        }
    }

    return (
        <section aria-labelledby="ai-documents-title" className="min-w-0 rounded-3xl bg-surface p-4 shadow-history-card sm:p-6 2xl:h-full 2xl:min-h-0 2xl:overflow-y-auto 2xl:overscroll-contain large-text:h-auto large-text:overflow-visible">
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-4">
                <div><h2 id="ai-documents-title" className="font-k2d text-xl font-bold text-ink">Documentos da cozinha</h2><p className="mt-1 max-w-3xl font-k2d text-sm leading-relaxed text-history-muted">Envie arquivos para o Caixito consultar nas próximas conversas. O serviço informa individualmente se cada documento foi indexado.</p></div>
                <div className="flex flex-wrap items-center gap-2"><Button variant="standard" type="button" onClick={onBack} className="gap-2 rounded-xl px-4 py-2"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6M9 12h12" /></svg>Voltar à conversa</Button><span className="rounded-full bg-sidebar-active px-3 py-1.5 font-k2d text-sm font-bold text-sidebar-purple">{ownedDocumentCount} / 50 próprios</span></div>
            </div>

            <div
                className={`mt-5 shrink-0 rounded-2xl border border-dashed p-4 transition-colors sm:p-5 ${isDragging ? "border-brand bg-sidebar-active" : "border-sidebar-divider bg-history-card-header"}`}
                onDragEnter={(event) => { event.preventDefault(); setUploadState((current) => ({ ...current, isDragging: true })); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setUploadState((current) => ({ ...current, isDragging: false })); }}
                onDrop={(event) => { event.preventDefault(); setUploadState((current) => ({ ...current, isDragging: false })); selectFiles(event.dataTransfer.files); }}
            >
                <input ref={inputRef} type="file" multiple accept={[...supportedAIDocumentExtensions].map((extension) => `.${extension}`).join(",")} className="sr-only" onChange={(event) => { selectFiles(event.target.files); event.target.value = ""; }} aria-label="Selecionar documentos para o assistente" aria-describedby={selectionError ? "ai-document-upload-help ai-document-upload-error" : "ai-document-upload-help"} />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><h3 className="font-k2d font-semibold text-ink">Adicionar documentos</h3><p id="ai-document-upload-help" className="mt-1 font-k2d text-sm text-history-muted">{isDragging ? "Solte os arquivos para adicioná-los." : "Arraste arquivos para esta área ou escolha no dispositivo. Até 10 arquivos por envio e 10 MB por arquivo."}</p></div>
                    <Button variant="outline" type="button" onClick={() => inputRef.current?.click()} disabled={loading || ownedDocumentCount >= 50}>Escolher arquivos</Button>
                </div>
                {selectedFiles.length ? <ul className="mt-4 flex flex-wrap gap-2" aria-label="Arquivos selecionados">{selectedFiles.map((file) => <li key={`${file.name}-${file.size}-${file.lastModified}`} className="rounded-full bg-surface px-3 py-1.5 font-k2d text-xs text-ink">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</li>)}</ul> : null}
                {isSupervisor ? <label className="mt-4 flex w-fit cursor-pointer items-center gap-3 font-k2d text-sm text-ink"><input type="checkbox" checked={shareWithKitchen} onChange={(event) => setUploadState((current) => ({ ...current, shareWithKitchen: event.target.checked }))} className="size-4 accent-brand" />Compartilhar com os membros da cozinha</label> : null}
                <p className="mt-3 font-k2d text-xs text-history-muted">A lista também pode incluir arquivos compartilhados por outros membros; o limite de 50 conta somente os documentos próprios.</p>
                {selectionError ? <div id="ai-document-upload-error" className="mt-3"><Feedback severity="error">{selectionError}</Feedback></div> : null}
                {selectedFiles.length ? <Button variant="standard" type="button" onClick={() => void submitFiles()} disabled={loading} className="mt-4">{loading ? "Enviando…" : "Enviar para o assistente"}</Button> : null}
            </div>

            {error ? <Feedback severity="error" className="mt-4 shrink-0">{error}</Feedback> : null}
            {uploadResults.length ? <div className="mt-4 space-y-2" aria-label="Resultado do envio de arquivos">{uploadResults.map((result) => <Feedback key={result.arquivo_id || `${result.nome}-${result.codigo}-${result.status}-${result.tipo}`} severity={result.status === "indexado" ? "success" : "error"}><strong>{result.nome} · {result.status}:</strong> {result.mensagem || result.aviso || "O serviço não retornou detalhes adicionais."}</Feedback>)}</div> : null}

            <div className="mt-6 flex shrink-0 flex-wrap items-center justify-between gap-3"><h3 className="font-k2d text-lg font-bold text-ink">Arquivos disponíveis</h3><Button variant="ghost" type="button" onClick={() => void onRefresh()} disabled={loading}>Atualizar lista</Button></div>
            <div className="mt-3" aria-busy={loading}>
                {loading && documents.length === 0 ? <div className="py-8"><Loading loadingText="Carregando documentos" /></div> : null}
                {!loading && !error && documents.length === 0 ? <div className="rounded-2xl bg-history-card-header p-6 text-center"><p className="font-k2d font-semibold text-ink">Nenhum documento enviado</p><p className="mt-1 font-k2d text-sm text-history-muted">Os arquivos adicionados aparecerão aqui com seu status de compartilhamento.</p></div> : null}
                {documents.length ? <ul className="divide-y divide-history-border overflow-hidden rounded-2xl border border-history-border">{documents.map((document) => <li key={document.arquivo_id} className="flex min-w-0 flex-col gap-3 bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sidebar-active font-k2d font-bold text-sidebar-purple" aria-hidden="true">▤</span><div className="min-w-0"><p className="truncate font-k2d font-semibold text-ink" title={document.nome}>{document.nome}</p><p className="mt-1 font-k2d text-xs text-history-muted">{document.tipo || "Arquivo"} · {document.trechos} trechos · enviado em {formatDate(document.enviado_em)}</p><div className="mt-2 flex flex-wrap gap-2"><StatusBadge tone={document.compartilhado ? "info" : "neutral"} label={document.compartilhado ? "Compartilhado com a cozinha" : "Somente para você"} /><StatusBadge tone={document.dono ? "brand" : "neutral"} label={document.dono ? "Seu documento" : "Compartilhado por um membro"} /></div></div></div>
                {document.dono ? <Button variant="subtle-danger" type="button" onClick={() => setDeletionState((current) => ({ ...current, document, error: null }))} disabled={loading}>Remover</Button> : null}
                </li>)}</ul> : null}
            </div>

            <Dialog open={documentToDelete !== null} onOpenChange={(open) => { if (!open && !isDeleting) setDeletionState((current) => ({ ...current, document: null, error: null })); }} aria-labelledby="ai-delete-document-title" aria-describedby="ai-delete-document-description" className="p-5 sm:p-6">
                <h2 id="ai-delete-document-title" className="font-k2d text-xl font-bold text-ink">Remover documento?</h2>
                <p id="ai-delete-document-description" className="mt-2 font-k2d text-sm leading-relaxed text-history-muted">{documentToDelete?.nome} será removido da base de consulta. Essa ação não pode ser desfeita.</p>
                {deleteError ? <Feedback severity="error" className="mt-4">{deleteError}</Feedback> : null}
                <div className="mt-5 flex flex-wrap justify-end gap-2"><Button variant="outline" type="button" onClick={() => setDeletionState((current) => ({ ...current, error: null, document: null }))} disabled={isDeleting}>Manter documento</Button><Button variant="subtle-danger" type="button" onClick={() => void confirmDelete()} disabled={isDeleting}>{isDeleting ? "Removendo…" : "Remover documento"}</Button></div>
            </Dialog>
        </section>
    );
}
