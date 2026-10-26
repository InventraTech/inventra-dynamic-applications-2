import { useEffect, useId, useState } from "react";
import { searchProductsForKitchen } from "../../../../services/products";
import type { ProductRecord } from "../../../../types/products";
import Feedback from "../../../ui/Feedback";
import SearchField from "../../../ui/SearchField";

interface KitchenProductPickerProps {
    kitchenId: number;
    onSelect: (product: ProductRecord) => void;
}

interface ProductState {
    loading: boolean;
    error: string | null;
    products: ProductRecord[];
}

export default function KitchenProductPicker({ kitchenId, onSelect }: KitchenProductPickerProps) {
    const searchId = useId();
    const [state, setState] = useState<ProductState>({ loading: false, error: null, products: [] });
    const [search, setSearch] = useState("");
    const [retryToken, setRetryToken] = useState(0);

    useEffect(() => {
        const normalizedSearch = search.trim();
        if (normalizedSearch.length < 2) {
            setState({ loading: false, error: null, products: [] });
            return;
        }

        const controller = new AbortController();
        setState({ loading: true, error: null, products: [] });
        const timeout = window.setTimeout(() => {
            searchProductsForKitchen({ name: normalizedSearch, page: 0, size: 100, active: true }, kitchenId, false, controller.signal)
            .then((products) => {
                if (!controller.signal.aborted) setState({ loading: false, error: null, products });
            })
            .catch((error: unknown) => {
                if (!controller.signal.aborted) setState({ loading: false, error: error instanceof Error ? error.message : "Não foi possível consultar os produtos vinculados à cozinha.", products: [] });
            });
        }, 300);
        return () => { window.clearTimeout(timeout); controller.abort(); };
    }, [kitchenId, retryToken, search]);

    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    const visibleProducts = state.products.filter((product) => [product.name, product.brand ?? ""].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedSearch)));

    return (
        <div className="grid min-w-0 gap-3">
            <label htmlFor={searchId} className="font-semibold text-ink">Produto da cozinha <span aria-hidden="true">*</span></label>
            <SearchField id={searchId} label="Buscar produto vinculado à cozinha" placeholder="Buscar produto da cozinha" value={search} onChange={(event) => setSearch(event.target.value)} />
            {search.trim().length < 2 && <p className="text-sm text-history-muted">Digite pelo menos duas letras para buscar produtos ativos vinculados a esta cozinha.</p>}
            {state.loading && <p role="status" aria-live="polite" className="text-sm text-history-muted">Carregando produtos vinculados à cozinha…</p>}
            {state.error && <div className="grid gap-2"><Feedback severity="error">{state.error}</Feedback><button type="button" className="justify-self-start font-semibold text-brand underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" onClick={() => setRetryToken((current) => current + 1)}>Tentar buscar novamente</button></div>}
            {!state.loading && !state.error && visibleProducts.length === 0 && <p className="rounded-xl bg-history-card-header p-3 text-sm text-history-muted">{state.products.length ? "Nenhum produto encontrado para esta busca." : "Não há produtos ativos vinculados a esta cozinha."}</p>}
            {!state.loading && !state.error && visibleProducts.length > 0 && (
                <ul className="grid max-h-72 min-w-0 list-none gap-2 overflow-y-auto p-0" aria-label="Produtos disponíveis nesta cozinha">
                    {visibleProducts.map((product) => (
                        <li key={product.id}>
                            <button type="button" className="grid min-h-12 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-history-border bg-surface px-3 py-2 text-left text-ink transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" onClick={() => onSelect(product)}>
                                <span className="min-w-0"><span className="block font-semibold wrap-anywhere">{product.name}</span><span className="block text-sm text-history-muted">{product.brand || "Sem marca"} · {product.unit.symbol}</span></span>
                                <span className="font-semibold text-brand">Adicionar</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
