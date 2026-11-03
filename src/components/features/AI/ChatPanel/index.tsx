import Icon from "../../../ui/Icon";
import { memo, useEffect, useRef, useState } from "react";

import type { AIArtifact, AIMessageView, AIPendingAction, AIUploadResult } from "../../../../types/ai";
import mascotHead from "../../../../assets/images/mascote-cabeca.svg";
import Button from "../../../ui/Button";
import Feedback from "../../../ui/Feedback";
import StatusBadge from "../../../ui/StatusBadge";
import { useAccessibility } from "../../../../context/accessibility";
import { getAIAudioFileName, maxAIQuestionLength, supportedAIAudioRecorderTypes, validateAIDocumentSelection, validateAIQuestion } from "../../../../utils/aiValidation";
import MarkdownMessage from "../MarkdownMessage/index";
import ThinkingIndicator from "../ThinkingIndicator/index";

interface ChatPanelProps {
    messages: AIMessageView[];
    conversationTitle: string;
    disabled: boolean;
    ownedDocumentCount: number;
    loading: boolean;
    readOnly: boolean;
    recording: boolean;
    error: string | null;
    uploadResults: AIUploadResult[];
    onSendMessage: (question: string, files?: File[]) => Promise<void>;
    onSendAudio: (audio: Blob, fileName: string) => Promise<void>;
    onStop: () => void;
    onRecordingChange: (recording: boolean) => void;
    onReviewAction: (action: AIPendingAction) => void;
}

const chartPalette = ["var(--color-brand)", "var(--color-feedback-success)", "var(--color-feedback-info)", "var(--color-login-gold)", "var(--color-history-muted)", "var(--color-feedback-error)"];
const quickPrompts = [
    "Quais lotes vencem nos próximos 7 dias?",
    "Quais produtos estão abaixo do estoque mínimo?",
    "Quais são os lotes ativos da cozinha?",
    "Quais requisições aguardam análise?",
    "Quais alertas ainda não foram lidos?",
];

function fingerprint(value: string): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function createPieGradient(data: number[]): string {
    const total = data.reduce((sum, value) => sum + Math.max(0, value), 0);
    let accumulated = 0;
    return data.map((value, index) => {
        const start = total === 0 ? 0 : accumulated / total * 100;
        accumulated += Math.max(0, value);
        const end = total === 0 ? 0 : accumulated / total * 100;
        return `${chartPalette[index % chartPalette.length]} ${start}% ${end}%`;
    }).join(", ");
}

function withUniqueKeys<T>(items: T[], getIdentity: (item: T) => string): Array<{ item: T; key: string }> {
    const occurrences = new Map<string, number>();
    return items.map((item) => {
        const identity = fingerprint(getIdentity(item));
        const occurrence = occurrences.get(identity) ?? 0;
        occurrences.set(identity, occurrence + 1);
        return { item, key: `${identity}-${occurrence}` };
    });
}

function formatArtifactCell(value: string | number | null | undefined, key: string, label: string): string {
    if (value === null || value === undefined || value === "") return "—";
    const normalizedKey = `${key} ${label}`.toLocaleLowerCase("pt-BR");
    if (typeof value === "string" && /^(\d{4})-(\d{2})-(\d{2})(?:t.*)?$/i.test(value)) {
        const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
        if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat("pt-BR").format(date);
    }
    if (normalizedKey.includes("status") || normalizedKey.includes("situa")) {
        const statusLabels: Record<string, string> = { ACTIVE: "Ativo", INACTIVE: "Inativo", CANCELLED: "Cancelado", CANCELED: "Cancelado", EXPIRED: "Vencido", PENDING: "Pendente" };
        return statusLabels[String(value).toLocaleUpperCase("pt-BR")] ?? String(value);
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        if (/pre[cç]o|valor|custo|price|amount/i.test(normalizedKey)) return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
        return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value);
    }
    return String(value);
}

function actionTitle(action: AIPendingAction): string {
    const operation = action.operation.toLocaleLowerCase("pt-BR").replaceAll("_", " ").trim();
    const productEntry = Object.entries(action.parameters).find(([key, value]) => /produto|product|item|nome/i.test(key) && (typeof value === "string" || typeof value === "number"));
    const productName = productEntry ? String(productEntry[1]) : "";
    let label = operation || "Ação proposta";
    if (/consum|baixa/.test(label)) label = "Registrar consumo";
    else if (/entrada|receb/.test(label)) label = "Registrar entrada";
    else if (/requis|compra/.test(label)) label = "Criar requisição";
    else if (/transfer/.test(label)) label = "Registrar transferência";
    return productName ? `${label} de ${productName}` : label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}

function actionMetrics(action: AIPendingAction): Array<{ label: string; value: string }> {
    const candidates = [
        { label: "Quantidade", pattern: /^(quantity|quantidade|amount|consumption|consumo)$/i },
        { label: "Saldo atual", pattern: /^(currentbalance|currentstock|saldoatual|saldoantes|estoqueatual|stockbefore)$/i },
        { label: "Saldo previsto após", pattern: /^(projectedbalance|projectedstock|saldoprevisto|saldodepois|estoqueprevisto|stockafter)$/i },
    ];
    return candidates.flatMap(({ label, pattern }) => {
        const entry = Object.entries(action.parameters).find(([key, value]) => pattern.test(key.replaceAll(/[_\s-]/g, "")) && (typeof value === "string" || typeof value === "number"));
        return entry ? [{ label, value: String(entry[1]) }] : [];
    });
}

function pendingActionStatus(status: string): { label: string; tone: "warning" | "success" | "danger" | "info" | "neutral" } {
    switch (status.toLocaleUpperCase("pt-BR")) {
        case "AGUARDANDO_APROVACAO": return { label: "Aguardando decisão", tone: "warning" };
        case "APROVADA_PENDENTE_INTEGRACAO": return { label: "Integração pendente", tone: "warning" };
        case "EM_EXECUCAO": return { label: "Em execução", tone: "info" };
        case "CONCLUIDA": return { label: "Concluída", tone: "success" };
        case "RECUSADA": return { label: "Recusada", tone: "danger" };
        case "FALHOU": return { label: "Falhou", tone: "danger" };
        case "RESULTADO_INCERTO": return { label: "Resultado incerto", tone: "warning" };
        case "EXPIRADA": return { label: "Expirada", tone: "neutral" };
        default: return { label: status || "Status indisponível", tone: "neutral" };
    }
}

interface ArtifactViewProps {
    artifact: AIArtifact;
}

function ArtifactView({ artifact }: ArtifactViewProps) {
    if (artifact.type === "table") {
        const rows = withUniqueKeys(artifact.rows, (row) => artifact.columns.map((column) => `${column.key}:${String(row[column.key] ?? "")}`).join("\u001f"));
        return (
            <section className="mt-4 min-w-0 overflow-hidden rounded-2xl border border-sidebar-divider bg-surface" aria-label="Resultado da consulta">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-history-border px-4 py-3">
                    <h3 className="font-k2d text-sm font-bold text-ink">Resultado da consulta</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {artifact.mocked ? <StatusBadge tone="warning" label="Dados ilustrativos" /> : null}
                        {artifact.source ? <span className="font-k2d text-xs text-history-muted">Fonte: {artifact.source}</span> : null}
                    </div>
                </header>
                <div className="min-w-0 overflow-x-auto" role="region" aria-label="Tabela retornada pelo assistente" tabIndex={0}>
                    <table className="w-full min-w-max border-collapse text-left font-k2d text-sm">
                        <thead className="bg-history-card-header text-history-muted"><tr>{artifact.columns.map((column) => <th key={column.key} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">{column.label}</th>)}</tr></thead>
                        <tbody>{rows.map(({ item: row, key }) => <tr key={key} className="border-t border-history-border last:border-b-0">{artifact.columns.map((column) => <td key={column.key} className="max-w-72 px-4 py-3 text-ink">{formatArtifactCell(row[column.key], column.key, column.label)}</td>)}</tr>)}</tbody>
                    </table>
                </div>
                {artifact.note ? <p className="border-t border-history-border px-4 py-3 font-k2d text-xs leading-relaxed text-history-muted">{artifact.note}</p> : null}
                {artifact.mocked ? <p className="border-t border-history-border px-4 py-2 font-k2d text-xs text-history-status-observation-text">Resultado demonstrativo; não representa alteração real no estoque.</p> : null}
            </section>
        );
    }

    const data = artifact.datasets[0]?.data ?? [];
    const total = data.reduce((sum, value) => sum + Math.max(0, value), 0);
    const gradient = createPieGradient(data);
    const labels = withUniqueKeys(artifact.labels, (label) => label);
    const datasets = withUniqueKeys(artifact.datasets, (dataset) => `${dataset.label}:${dataset.data.join(",")}`);
    const allValues = artifact.datasets.flatMap((dataset) => artifact.labels.map((_, index) => dataset.data[index] ?? 0));
    const minimum = Math.min(0, ...allValues);
    const maximum = Math.max(0, ...allValues);
    const range = maximum - minimum || 1;
    const zeroPosition = (0 - minimum) / range * 100;

    return (
        <figure className="mt-4 rounded-2xl border border-history-border bg-history-card-header p-4">
            <figcaption className="mb-4 font-k2d text-sm font-bold text-ink">{artifact.datasets[0]?.label || "Resultado"}</figcaption>
            {artifact.chart_type === "pie" ? (
                <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
                    <div className="mx-auto grid size-36 place-items-center rounded-full" style={{ backgroundImage: `conic-gradient(${gradient || "var(--color-history-border) 0% 100%"})` }} role="img" aria-label={`Gráfico de participação com ${artifact.labels.length} categorias`}><span className="size-20 rounded-full bg-surface" aria-hidden="true" /></div>
                    <ul className="grid gap-2 sm:grid-cols-2">{labels.map(({ item: label, key }, index) => {
                        const value = data[index] ?? 0;
                        const safeValue = Math.max(0, value);
                        const percent = total > 0 ? Math.round(safeValue / total * 100) : 0;
                        return <li key={key} className="flex min-w-0 items-start gap-2 font-k2d text-sm"><span className="mt-1 size-3 shrink-0 rounded-sm" style={{ backgroundColor: chartPalette[index % chartPalette.length] }} aria-hidden="true" /><span className="min-w-0"><span className="block font-semibold text-ink">{label}</span><span className="text-history-muted">{value.toLocaleString("pt-BR")} {artifact.unit ?? ""} · {percent}%</span></span></li>;
                    })}</ul>
                </div>
            ) : (
                <>
                    {datasets.length > 1 ? <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Séries do gráfico">{datasets.map(({ item: dataset, key }, index) => <li key={key} className="flex items-center gap-2 font-k2d text-xs text-history-muted"><span className="size-2.5 rounded-full" style={{ backgroundColor: chartPalette[index % chartPalette.length] }} aria-hidden="true" />{dataset.label || `Série ${index + 1}`}</li>)}</ul> : null}
                    <ul className="space-y-3">{labels.map(({ item: label, key }, labelIndex) => <li key={key} className="grid gap-2 border-t border-history-border pt-3 font-k2d text-xs sm:grid-cols-[minmax(6rem,10rem)_minmax(0,1fr)] sm:items-center sm:text-sm"><span className="min-w-0 font-semibold text-ink" title={label}>{label}</span><div className="min-w-0 space-y-2">{datasets.map(({ item: dataset, key: datasetKey }, datasetIndex) => {
                        const value = dataset.data[labelIndex] ?? 0;
                        const valuePosition = (value - minimum) / range * 100;
                        const left = Math.min(zeroPosition, valuePosition);
                        const width = Math.abs(valuePosition - zeroPosition);
                        return <div key={datasetKey} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div className="relative h-3 overflow-hidden rounded-full bg-surface" role="img" aria-label={`${label}: ${dataset.label || `série ${datasetIndex + 1}`} ${value.toLocaleString("pt-BR")} ${artifact.unit ?? ""}`}><span className="absolute inset-y-0 w-px bg-history-muted/60" style={{ left: `${zeroPosition}%` }} aria-hidden="true" /><span className="absolute inset-y-0 min-w-0.5 rounded-full" style={{ left: `${left}%`, width: `${width}%`, backgroundColor: chartPalette[datasetIndex % chartPalette.length] }} aria-hidden="true" /></div><span className="min-w-20 text-right font-semibold text-ink">{value.toLocaleString("pt-BR")} {artifact.unit ?? ""}</span></div>;
                    })}</div></li>)}</ul>
                </>
            )}
            {artifact.note ? <p className="mt-3 font-k2d text-xs text-history-muted">{artifact.note}</p> : null}
            {artifact.mocked ? <p className="mt-2 font-k2d text-xs font-semibold text-history-status-observation-text">Resultado demonstrativo, sem alteração real no estoque.</p> : null}
        </figure>
    );
}

interface MessageProps {
    message: AIMessageView;
    onReviewAction: (action: AIPendingAction) => void;
}

const Message = memo(function Message({ message, onReviewAction }: MessageProps) {
    const isHuman = message.role === "human";
    return (
        <article className={`flex min-w-0 gap-3 ${isHuman ? "justify-end" : "justify-start"}`} aria-label={isHuman ? "Sua mensagem" : "Resposta do assistente"}>
            {!isHuman ? <img className="mt-1 size-7 shrink-0 object-contain sm:size-8" src={mascotHead} alt="Caixito" /> : null}
            <div className={`min-w-0 ${isHuman ? "max-w-full sm:max-w-3xl" : "w-full max-w-screen-xl"}`}>
                {!isHuman && message.steps?.length ? <section className="mb-3 rounded-2xl border border-sidebar-divider bg-sidebar-active p-4" aria-label="Etapas da resposta">
                    <h3 className="font-k2d text-sm font-bold text-sidebar-purple">Etapas da resposta</h3>
                    <ol className="mt-3 space-y-2">
                        {message.steps.map((step) => {
                            const complete = step.status === "fim";
                            return <li key={step.id} className="flex min-w-0 items-center gap-3 font-k2d text-sm">
                                <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${complete ? "border-feedback-success text-feedback-success" : "border-brand text-brand"}`} aria-hidden="true">{complete ? <Icon name="check" className="size-4" /> : <span className="size-2 motion-safe:animate-pulse rounded-full bg-brand" />}</span>
                                <span className="min-w-0 flex-1 text-ink">{step.texto}</span>
                                <span className={`shrink-0 text-xs font-semibold ${complete ? "text-feedback-success" : "text-sidebar-purple"}`}>{complete ? "Concluída" : "Em andamento"}</span>
                            </li>;
                        })}
                    </ol>
                </section> : null}
                {message.content ? <div className={`rounded-3xl px-4 py-3 shadow-history-card sm:px-5 ${isHuman ? "bg-brand text-on-brand" : "border border-history-border bg-surface text-ink"}`}>{isHuman ? <p className="whitespace-pre-wrap wrap-anywhere font-k2d text-sm leading-relaxed sm:text-base">{message.content}</p> : <MarkdownMessage content={message.content} />}</div> : null}
                {message.artifacts && withUniqueKeys(message.artifacts, (artifact) => JSON.stringify(artifact)).map(({ item: artifact, key }) => <ArtifactView key={`${message.id}-${key}`} artifact={artifact} />)}
            {message.pendingActions?.map((action) => {
                const status = pendingActionStatus(action.status);
                const waiting = action.status.toLocaleUpperCase("pt-BR") === "AGUARDANDO_APROVACAO" && !action.uncertain;
                const metrics = actionMetrics(action);
                return <section key={action.id} className="mt-4 rounded-3xl border border-sidebar-divider bg-history-card-header p-4 sm:p-5" aria-label="Proposta de ação">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sidebar-active text-sidebar-purple" aria-hidden="true">▦</span><h3 className="min-w-0 font-k2d text-base font-bold text-ink">{actionTitle(action)}</h3></div><StatusBadge tone={action.uncertain ? "warning" : status.tone} label={action.uncertain ? "Confirme a situação" : status.label} /></div>
                    <p className="mt-3 font-k2d text-sm leading-relaxed text-history-muted">{action.justification || "Confira os dados antes de decidir. A proposta ainda não alterou o estoque."}</p>
                    {metrics.length ? <dl className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{metrics.map((metric) => <div key={metric.label} className="rounded-2xl bg-surface px-4 py-3"><dt className="font-k2d text-xs text-history-muted">{metric.label}</dt><dd className="mt-1 font-k2d text-lg font-bold text-ink">{metric.value}</dd></div>)}</dl> : null}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="font-k2d text-xs text-sidebar-purple">A ação só é executada depois da sua aprovação.</p><Button variant="primary" type="button" onClick={() => onReviewAction(action)}>{waiting ? "Revisar e decidir" : "Ver detalhes"}</Button></div>
                    {action.result?.message ? <Feedback severity={action.result.ok ? "success" : "error"} className="mt-3">{action.result.message}</Feedback> : null}
                    {action.execution_error ? <Feedback severity="error" className="mt-3">{action.execution_error}</Feedback> : null}
                </section>
            })}
            {message.outcome === "segura" ? <p className="mt-3 font-k2d text-xs text-history-muted">A consulta foi bloqueada por segurança. Nenhuma alteração foi aplicada.</p> : null}
            </div>
        </article>
    );
});

interface ComposerProps {
    disabled: boolean;
    ownedDocumentCount: number;
    readOnly: boolean;
    loading: boolean;
    recording: boolean;
    onSend: (question: string, files: File[]) => Promise<void>;
    onSendAudio: (audio: Blob, fileName: string) => Promise<void>;
    onStop: () => void;
    onRecordingChange: (recording: boolean) => void;
}

interface ComposerState {
    draft: string;
    files: File[];
    feedbackError: string | null;
    questionError: string | null;
}

function Composer({ disabled, ownedDocumentCount, readOnly, loading, recording, onSend, onSendAudio, onStop, onRecordingChange }: ComposerProps) {
    const [composer, setComposer] = useState<ComposerState>({ draft: "", files: [], feedbackError: null, questionError: null });
    const { draft, files, feedbackError, questionError } = composer;
    const inputRef = useRef<HTMLInputElement>(null);
    const composerRef = useRef<HTMLTextAreaElement>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const canRecord = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined" && supportedAIAudioRecorderTypes.some((type) => MediaRecorder.isTypeSupported(type));
    const isComposerDisabled = disabled || readOnly || loading;

    useEffect(() => () => {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
        streamRef.current?.getTracks().forEach((track) => track.stop());
    }, []);

    async function toggleRecording() {
        setComposer((current) => ({ ...current, feedbackError: null }));
        if (recorderRef.current?.state === "recording") {
            recorderRef.current.stop();
            onRecordingChange(false);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mimeType = supportedAIAudioRecorderTypes.find((type) => MediaRecorder.isTypeSupported(type));
            if (!mimeType) throw new Error("Este navegador não oferece um formato de áudio compatível.");
            const recorder = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];
            recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
            recorder.onerror = () => setComposer((current) => ({ ...current, feedbackError: "Não foi possível gravar o áudio. Tente novamente." }));
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
                stream.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
                recorderRef.current = null;
                if (blob.size > 10 * 1024 * 1024) setComposer((current) => ({ ...current, feedbackError: "O áudio ultrapassa o limite de 10 MB." }));
                else if (blob.size) {
                    const fileName = getAIAudioFileName(blob.type);
                    if (fileName) void onSendAudio(blob, fileName);
                    else setComposer((current) => ({ ...current, feedbackError: "O navegador gerou um áudio em formato não aceito pelo serviço." }));
                }
            };
            recorderRef.current = recorder;
            recorder.start();
            onRecordingChange(true);
        } catch {
            setComposer((current) => ({ ...current, feedbackError: "Não foi possível acessar o microfone. Verifique a permissão do navegador." }));
            onRecordingChange(false);
        }
    }

    function addFiles(selected: FileList | null) {
        if (!selected) return;
        const nextFiles = [...files, ...Array.from(selected)].filter((file, index, allFiles) => allFiles.findIndex((candidate) => candidate.name === file.name && candidate.size === file.size && candidate.lastModified === file.lastModified) === index);
        const validationError = validateAIDocumentSelection(nextFiles, ownedDocumentCount);
        if (validationError) {
            setComposer((current) => ({ ...current, feedbackError: validationError }));
            return;
        }
        setComposer((current) => ({ ...current, files: nextFiles, feedbackError: null }));
    }

    async function submit() {
        if (disabled || readOnly || loading) return;
        const validation = validateAIQuestion(draft);
        if (validation.error) {
            setComposer((current) => ({ ...current, questionError: validation.error }));
            return;
        }
        if (!validation.value && !files.length) return;
        const submitted = validation.value;
        const selectedFiles = files;
        setComposer((current) => ({ ...current, draft: "", files: [], feedbackError: null, questionError: null }));
        if (inputRef.current) inputRef.current.value = "";
        if (composerRef.current) composerRef.current.style.height = "";
        await onSend(submitted, selectedFiles);
    }

    function resizeComposer(textarea: HTMLTextAreaElement) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
    }

    return (
        <div className="shrink-0 border-t border-history-border bg-surface p-2 sm:p-3">
            {readOnly ? <p className="mb-3 rounded-xl bg-history-card-header px-3 py-2 font-k2d text-sm text-history-muted">Esta conversa é do histórico e está somente para leitura.</p> : null}
            {feedbackError ? <Feedback severity="error" className="mb-3">{feedbackError}</Feedback> : null}
            {files.length ? <ul className="mb-3 flex flex-wrap gap-2" aria-label="Arquivos anexados">{files.map((file) => <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex max-w-full items-center gap-2 rounded-full bg-history-card-header px-3 py-1.5 font-k2d text-xs"><span className="max-w-48 truncate">{file.name}</span><button type="button" className="rounded-full px-1 font-bold text-feedback-error focus-visible:outline-2 focus-visible:outline-focus" onClick={() => setComposer((current) => ({ ...current, files: current.files.filter((candidate) => candidate !== file) }))} aria-label={`Remover ${file.name}`}><Icon name="close" className="size-4" /></button></li>)}</ul> : null}
            <div className="ai-composer flex min-w-0 items-center gap-2 rounded-2xl border-2 border-brand bg-history-card-header p-1.5 transition-colors focus-within:ring-2 focus-within:ring-focus/25 sm:gap-3 sm:p-2">
                <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.xlsx,.pptx,.csv,.txt,.md,.png,.jpg,.jpeg,.webp" className="sr-only" onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} aria-label="Selecionar arquivos para enviar à conversa" />
                <Button variant="icon" type="button" onClick={() => inputRef.current?.click()} disabled={isComposerDisabled} className="size-9 shrink-0 rounded-full bg-surface text-sidebar-purple hover:bg-sidebar-active" aria-label="Anexar documentos"><svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.65 5.65l-9.2 9.2a2 2 0 0 1-2.82-2.83l8.48-8.48" /></svg></Button>
                <label className="sr-only" htmlFor="ai-composer">Mensagem para o assistente</label>
                <textarea ref={composerRef} id="ai-composer" maxLength={maxAIQuestionLength} aria-invalid={Boolean(questionError)} aria-describedby={questionError ? "ai-composer-help ai-composer-error" : "ai-composer-help"} rows={1} value={draft} onChange={(event) => { setComposer((current) => ({ ...current, draft: event.target.value, questionError: null })); resizeComposer(event.currentTarget); }} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(); } }} disabled={isComposerDisabled} placeholder={readOnly ? "Conversa somente para leitura" : disabled ? "Assistente indisponível para esta conta" : "Pergunte sobre estoque, lotes, validade ou requisições…"} className="ai-composer-input max-h-28 min-h-9 min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2 py-1.5 font-k2d text-sm leading-6 text-ink outline-none shadow-none placeholder:text-history-muted focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed sm:text-base" />
                {canRecord ? <Button variant="icon" type="button" onClick={() => void toggleRecording()} disabled={isComposerDisabled} className={`size-9 shrink-0 rounded-full ${recording ? "bg-feedback-error-bg text-feedback-error" : "bg-surface text-sidebar-purple hover:bg-sidebar-active"}`} aria-label={recording ? "Parar gravação de áudio" : "Gravar pergunta por áudio"} aria-pressed={recording}>{recording ? <span aria-hidden="true">■</span> : <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8" /></svg>}</Button> : null}
                {loading ? <Button variant="outline" type="button" onClick={onStop} className="min-h-9 shrink-0 px-3 py-1.5">Parar</Button> : <Button variant="primary" type="button" onClick={() => void submit()} disabled={isComposerDisabled || (!draft.trim() && !files.length)} className="min-h-9 shrink-0 px-4 py-1.5">Enviar</Button>}
            </div>
            {questionError ? <p id="ai-composer-error" className="mt-2 text-sm text-feedback-error" role="alert">{questionError}</p> : null}
            <p id="ai-composer-help" className="sr-only">Enter envia a mensagem; Shift mais Enter insere uma quebra de linha. A mensagem pode ter até {maxAIQuestionLength.toLocaleString("pt-BR")} caracteres. Você pode anexar até dez arquivos de até dez megabytes cada.</p>
            {loading ? <p className="sr-only" role="status" aria-live="polite">O assistente está respondendo.</p> : null}
        </div>
    );
}

export default function ChatPanel({ messages, conversationTitle, disabled, ownedDocumentCount, loading, readOnly, recording, error, uploadResults, onSendMessage, onSendAudio, onStop, onRecordingChange, onReviewAction }: ChatPanelProps) {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { settings } = useAccessibility();
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const shouldReduceMotion = settings.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        container.scrollTo({ top: container.scrollHeight, behavior: shouldReduceMotion ? "instant" : "smooth" });
    }, [messages, settings.reduceMotion]);
    return (
        <section aria-label="Conversa com o assistente IA" className="flex min-h-80 min-w-0 flex-col overflow-hidden rounded-3xl bg-surface shadow-history-card 2xl:h-full 2xl:min-h-0 large-text:h-auto large-text:overflow-visible">
            <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-history-border px-4 py-3 sm:px-5">
                <h2 className="min-w-0 truncate font-k2d text-lg font-bold text-ink sm:text-xl">{conversationTitle}</h2>
                <StatusBadge label={readOnly ? "Histórico" : "Conversa atual"} tone="info" />
            </header>
            <div ref={messagesContainerRef} role="region" tabIndex={0} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 sm:p-4 2xl:p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" aria-label="Mensagens da conversa">
                {!messages.length ? (
                    <div className="flex min-h-80 flex-col items-center justify-center px-2 py-4 text-center 2xl:min-h-full 2xl:py-2">
                        <img className="mb-3 size-16 max-w-full object-contain sm:size-20" src={mascotHead} alt="" aria-hidden="true" />
                        <h2 className="font-k2d text-xl font-bold text-sidebar-purple sm:text-2xl">Oi, eu sou o IAI.</h2>
                        <p className="mt-2 max-w-3xl font-k2d text-sm leading-relaxed text-history-muted sm:text-base">Eu consulto o estoque, os lotes, a validade, as requisições e os documentos da sua cozinha. Ações que alteram dados sempre pedem sua confirmação.</p>
                        <div className="mt-4 flex max-w-4xl flex-wrap justify-center gap-2">{quickPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => void onSendMessage(prompt)} disabled={disabled || loading || readOnly} className="rounded-full border border-sidebar-divider bg-sidebar-active px-3 py-1.5 font-k2d text-xs font-semibold text-sidebar-purple transition-colors hover:bg-history-card-header focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm">{prompt}</button>)}</div>
                    </div>
                ) : null}
                {messages.map((message) => <Message key={message.id} message={message} onReviewAction={onReviewAction} />)}
                {loading ? <ThinkingIndicator responding={Boolean(messages.at(-1)?.content.trim())} /> : null}
                {error ? <Feedback severity="error">{error}</Feedback> : null}
                {uploadResults.length ? <section aria-label="Resultado dos documentos enviados" className="space-y-2">{uploadResults.map((result) => <Feedback key={result.arquivo_id || `${result.nome}-${result.codigo}-${result.status}-${result.tipo}`} severity={result.status === "indexado" ? "success" : "error"}><strong>{result.nome}:</strong> {result.mensagem || (result.status === "indexado" ? "Documento indexado para consulta." : "O arquivo não foi indexado.")}</Feedback>)}</section> : null}
            </div>
            <Composer disabled={disabled} ownedDocumentCount={ownedDocumentCount} readOnly={readOnly} loading={loading} recording={recording} onSend={onSendMessage} onSendAudio={onSendAudio} onStop={onStop} onRecordingChange={onRecordingChange} />
        </section>
    );
}
