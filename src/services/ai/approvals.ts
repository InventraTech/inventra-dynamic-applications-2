import type { AIApproval, AIApprovalDecisionInput, AIApprovalListResponse } from "../../types/ai";
import { requestAI } from "./client";

export interface AIApprovalListOptions {
    status?: string;
    offset?: number;
    limit?: number;
}

export async function getAIApprovalInbox(signal?: AbortSignal): Promise<AIApprovalListResponse> {
    return requestAI<AIApprovalListResponse>("approvals/inbox", { signal });
}

export async function getAIApprovals(options: AIApprovalListOptions = {}, signal?: AbortSignal): Promise<AIApprovalListResponse> {
    const query = new URLSearchParams({ offset: String(options.offset ?? 0), limit: String(options.limit ?? 20) });
    if (options.status) query.set("status", options.status);
    return requestAI<AIApprovalListResponse>(`approvals?${query.toString()}`, { signal });
}

export async function getAIApproval(id: string, signal?: AbortSignal): Promise<AIApproval> {
    return requestAI<AIApproval>(`approvals/${encodeURIComponent(id)}`, { signal });
}

export async function decideAIApproval(id: string, input: AIApprovalDecisionInput, signal?: AbortSignal): Promise<AIApproval> {
    return requestAI<AIApproval>(`approvals/${encodeURIComponent(id)}/decision`, {
        method: "POST",
        body: JSON.stringify(input),
        signal,
    });
}

export async function executeAIApproval(id: string, signal?: AbortSignal): Promise<AIApproval> {
    return requestAI<AIApproval>(`approvals/${encodeURIComponent(id)}/execute`, { method: "POST", signal });
}
