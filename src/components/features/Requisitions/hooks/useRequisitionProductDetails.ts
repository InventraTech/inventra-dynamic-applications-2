import { useEffect, useState } from "react";
import { getProduct } from "../../../../services/products";
import type { ProductRecord } from "../../../../types/products";
import type { RequisitionItem } from "../../../../types/requisitions";

interface RequisitionProductDetailsState {
    loading: boolean;
    products: Record<number, ProductRecord>;
}

export default function useRequisitionProductDetails(items: RequisitionItem[]) {
    const productIds = [...new Set(items.map(({ product }) => product.id))].sort((first, second) => first - second);
    const productIdsKey = productIds.join(",");
    const [state, setState] = useState<RequisitionProductDetailsState>({ loading: false, products: {} });

    useEffect(() => {
        const ids = productIdsKey ? productIdsKey.split(",").map(Number) : [];
        if (ids.length === 0) {
            setState({ loading: false, products: {} });
            return;
        }

        const controller = new AbortController();
        const pendingIds = [...ids];
        const products: Record<number, ProductRecord> = {};
        setState({ loading: true, products: {} });

        async function loadWorker() {
            while (!controller.signal.aborted) {
                const productId = pendingIds.shift();
                if (productId === undefined) return;
                try {
                    products[productId] = await getProduct(productId, controller.signal);
                } catch {
                    if (controller.signal.aborted) return;
                }
            }
        }

        const workers = Array.from({ length: Math.min(4, ids.length) }, () => loadWorker());
        void Promise.all(workers).then(() => {
            if (!controller.signal.aborted) setState({ loading: false, products });
        });
        return () => controller.abort();
    }, [productIdsKey]);

    return state;
}
