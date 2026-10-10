import type { HistoryMode, HistoryRow } from "../types/history";
import type { ProductDto, RequisitionDto, RequisitionItemDto } from "../types/api";
import { apiRequest } from "./api";
import { mapRequisitionItems } from "../components/features/History/data";

async function mapInBatches<T, Result>(
    values: T[],
    batchSize: number,
    mapValue: (value: T) => Promise<Result>,
): Promise<Result[]> {
    const results: Result[] = [];
    for (let index = 0; index < values.length; index += batchSize) {
        const batch = values.slice(index, index + batchSize);
        results.push(...await Promise.all(batch.map(mapValue)));
    }
    return results;
}

export async function getHistoryRows(
    mode: HistoryMode,
    kitchenId: number,
    signal?: AbortSignal,
): Promise<HistoryRow[]> {
    const requisitions = await apiRequest<RequisitionDto[]>(
        `/requisitions?kitchenId=${encodeURIComponent(kitchenId)}`,
        { signal },
    );

    const requestedType = mode === "purchase" ? "PURCHASE" : "CONSUMPTION";
    const relevantRequisitions = requisitions.filter((requisition) =>
        requisition.type === requestedType &&
        (mode === "purchase" || requisition.status === "APPROVED"),
    );

    const requisitionsWithItems = await mapInBatches(relevantRequisitions, 8, async (requisition) => ({
        requisition,
        items: await apiRequest<RequisitionItemDto[]>(`/requisitions/${requisition.id}/items`, { signal }),
    }));

    const productIds = [...new Set(requisitionsWithItems.flatMap(({ items }) => items.map(({ product }) => product.id)))];
    const productDetails = await mapInBatches(productIds, 8, async (productId) => {
        try {
            const product = await apiRequest<ProductDto>(`/products/${productId}`, { signal });
            return { productId, brand: product.brand?.trim() || "—" };
        } catch {
            return { productId, brand: "—" };
        }
    });
    if (signal?.aborted) throw new DOMException("A solicitação foi cancelada.", "AbortError");

    const brands = new Map<string, string>();
    productDetails.forEach(({ productId, brand }) => {
        brands.set(String(productId), brand);
    });

    return requisitionsWithItems.flatMap(({ requisition, items }) =>
        mapRequisitionItems(requisition, items, brands, mode),
    );
}
