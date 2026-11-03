import type { AIDocumentsResponse, AIUploadResponse } from "../../types/ai";
import { requestAI } from "./client";

export async function getAIDocuments(signal?: AbortSignal): Promise<AIDocumentsResponse> {
    return requestAI<AIDocumentsResponse>("arquivos", { signal });
}

export async function uploadAIDocuments(files: File[], shareWithKitchen: boolean, signal?: AbortSignal): Promise<AIUploadResponse> {
    const form = new FormData();
    files.forEach((file) => form.append("arquivos", file, file.name));
    form.append("compartilhar", String(shareWithKitchen));
    return requestAI<AIUploadResponse>("arquivos", { method: "POST", body: form, signal });
}

export async function removeAIDocument(fileId: string, signal?: AbortSignal): Promise<void> {
    await requestAI<void>(`arquivos/${encodeURIComponent(fileId)}`, { method: "DELETE", signal });
}
