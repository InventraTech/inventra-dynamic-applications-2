import type { ProductDto, RequisitionDto, RequisitionItemDto } from "../types/api";
import type { HistoryMode, HistoryRequest } from "../types/history";
import { apiRequest } from "./api";

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

export async function getHistoryRequests(
    mode: HistoryMode,
    kitchenId: number,
    signal?: AbortSignal,
): Promise<HistoryRequest[]> {
    const requisitions = await apiRequest<RequisitionDto[]>(
        `/requisitions?kitchenId=${encodeURIComponent(kitchenId)}`,
        { signal },
    );

    const requestedType = mode === "purchase" ? "PURCHASE" : "CONSUMPTION";
    const relevantRequisitions = requisitions.filter((requisition) => requisition.type === requestedType);

    const requisitionsWithItems = await mapInBatches(relevantRequisitions, 8, async (requisition) => ({
        requisition,
        items: await apiRequest<RequisitionItemDto[]>(`/requisitions/${requisition.id}/items`, { signal }),
    }));

    const productIds = [...new Set(requisitionsWithItems.flatMap(({ items }) => items.map(({ product }) => product.id)))];
    const productDetails = await mapInBatches(productIds, 8, async (productId) => {
        try {
            const product = await apiRequest<ProductDto>(`/products/${productId}`, { signal });
            return {
                productId,
                brand: product.brand?.trim() || "—",
                unit: product.unit?.symbol?.trim() || "",
            };
        } catch {
            return { productId, brand: "—", unit: "" };
        }
    });

    if (signal?.aborted) throw new DOMException("A solicitação foi cancelada.", "AbortError");

    const products = new Map(productDetails.map(({ productId, brand, unit }) => [productId, { brand, unit }]));
    const requests = requisitionsWithItems.map(({ requisition, items }) => ({
        ...requisition,
        items: items.map((item) => {
            const details = products.get(item.product.id);
            return {
                ...item,
                product: {
                    ...item.product,
                    brand: details?.brand ?? "—",
                    unit: details?.unit ?? "",
                },
            };
        }),
    }));

    return requests.sort((first, second) => {
        const firstDate = mode === "withdrawal" && first.status === "APPROVED" && first.approvedAt ? first.approvedAt : first.createdAt;
        const secondDate = mode === "withdrawal" && second.status === "APPROVED" && second.approvedAt ? second.approvedAt : second.createdAt;
        return new Date(secondDate).getTime() - new Date(firstDate).getTime();
    });
}
