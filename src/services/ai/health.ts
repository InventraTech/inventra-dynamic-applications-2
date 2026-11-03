import type { AIHealth } from "../../types/ai";
import { requestAI } from "./client";

export async function getAIHealth(signal?: AbortSignal): Promise<AIHealth> {
    return requestAI<AIHealth>("health", { authenticated: false, signal });
}
