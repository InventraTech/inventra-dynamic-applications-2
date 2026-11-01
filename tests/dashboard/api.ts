import { alerts, batches, counts, inventories, items, links, parameters, stock, suppliers } from "./fixtures";

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) { super(message); this.status = status; }
}

// Test-only replacement for apiRequest. No network request is ever made by this page.
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const mode = new URLSearchParams(window.location.search).get("state");
    options.signal?.throwIfAborted();
    await new Promise(resolve => setTimeout(resolve, mode === "loading" ? 30_000 : 80));
    options.signal?.throwIfAborted();
    if (mode === "error" || (mode === "partial" && path.startsWith("/products/2/suppliers"))) throw new ApiError("Falha simulada exclusivamente para validação.", 503);
    if (mode === "empty") return [] as T;
    const url = new URL(path, "http://validation.invalid");
    if (url.pathname === "/stock-batches") return batches as T;
    if (url.pathname === "/alerts") return alerts as T;
    if (url.pathname === "/requisitions") return (await import("./fixtures")).requisitions as T;
    if (url.pathname === "/inventories") return inventories as T;
    if (url.pathname === "/suppliers") return suppliers.filter(row => row.active === (url.searchParams.get("active") === "true")) as T;
    if (url.pathname === "/kitchens/7/stock") return stock as T;
    const match = /^\/(products|inventories|requisitions)\/(\d+)\/(suppliers|kitchen-parameters|counts|items)$/.exec(url.pathname);
    if (match) {
        const records = match[3] === "suppliers" ? links : match[3] === "kitchen-parameters" ? parameters : match[3] === "counts" ? counts : items;
        return (records[Number(match[2])] ?? []) as T;
    }
    throw new ApiError(`Rota de validação não prevista: ${url.pathname}`, 404);
}
