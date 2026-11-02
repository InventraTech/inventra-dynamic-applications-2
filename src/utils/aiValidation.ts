const maxFilesPerUpload = 10;
const maxFileSizeBytes = 10 * 1024 * 1024;
const maxOwnedDocuments = 50;
export const maxAIQuestionLength = 4000;
export const maxAIApprovalReasonLength = 1000;

export interface AIQuestionValidationResult {
    value: string;
    error: string | null;
}

export const supportedAIDocumentExtensions = new Set([
    "pdf",
    "docx",
    "xlsx",
    "pptx",
    "csv",
    "txt",
    "md",
    "png",
    "jpg",
    "jpeg",
    "webp",
]);

export const supportedAIAudioRecorderTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg",
    "audio/mp4",
] as const;

export function validateAIQuestion(question: string): AIQuestionValidationResult {
    const value = question.replaceAll("\u0000", "").trim();
    if (value.length > maxAIQuestionLength) {
        return { value, error: `A mensagem deve ter no máximo ${maxAIQuestionLength.toLocaleString("pt-BR")} caracteres.` };
    }
    return { value, error: null };
}

export function validateAIApprovalReason(reason: string): AIQuestionValidationResult {
    const value = reason.replaceAll("\u0000", "").trim();
    if (value.length > maxAIApprovalReasonLength) {
        return { value, error: `O motivo deve ter no máximo ${maxAIApprovalReasonLength.toLocaleString("pt-BR")} caracteres.` };
    }
    return { value, error: null };
}

export function validateAIDocumentSelection(files: File[], ownedDocumentCount: number): string | null {
    if (files.length > maxFilesPerUpload) return "Selecione no máximo 10 arquivos por envio.";
    if (ownedDocumentCount + files.length > maxOwnedDocuments) return "O envio ultrapassaria o limite de 50 documentos próprios.";

    const unsupported = files.find((file) => {
        const extension = file.name.split(".").at(-1)?.toLocaleLowerCase("pt-BR") ?? "";
        return !supportedAIDocumentExtensions.has(extension);
    });
    if (unsupported) return `${unsupported.name} tem um formato que não pode ser enviado.`;

    const oversized = files.find((file) => file.size > maxFileSizeBytes);
    if (oversized) return `${oversized.name} ultrapassa o limite de 10 MB.`;

    return null;
}

export function getAIAudioFileName(mimeType: string): string | null {
    const normalized = mimeType.toLocaleLowerCase("pt-BR");
    if (normalized.includes("webm")) return "mensagem.webm";
    if (normalized.includes("ogg")) return "mensagem.ogg";
    if (normalized.includes("mp4")) return "mensagem.m4a";
    return null;
}
