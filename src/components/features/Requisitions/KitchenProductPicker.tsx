import { useEffect, useId, useState } from "react";
import { searchProductsForKitchen } from "../../../services/products";
import type { ProductRecord } from "../../../types/products";
import Feedback from "../../ui/Feedback";
import SearchField from "../../ui/SearchField";
import Button from "../../ui/Button";
import ProductImage from "../../ui/ProductImage";
import searchIcon from "../../../assets/icons/busca.svg";

interface KitchenProductPickerProps {
    kitchenId: number;
    onSelect: (product: ProductRecord) => void;
    selectedProduct: ProductRecord | null;
    onClearSelection: () => void;
}

interface ProductState {
    loading: boolean;
    error: string | null;
    products: ProductRecord[];
}

export default function KitchenProductPicker({ kitchenId, onSelect, selectedProduct, onClearSelection }: KitchenProductPickerProps) {
    const searchId = useId();
    const [state, setState] = useState<ProductState>({ loading: false, error: null, products: [] });
    const [search, setSearch] = useState("");
    const [retryToken, setRetryToken] = useState(0);

    useEffect(() => {
        if (selectedProduct) {
            setSearch("");
            setState({ loading: false, error: null, products: [] });
            return;
        }

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
    }, [kitchenId, retryToken, search, selectedProduct]);

    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    const visibleProducts = state.products.filter((product) => [product.name, product.brand ?? ""].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedSearch)));

    return (
        <div className="grid min-w-0 gap-3">
            <label htmlFor={searchId} className="font-semibold text-ink">Produto da cozinha <span aria-hidden="true">*</span></label>
            {selectedProduct ? (
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-brand bg-history-card-header p-3">
                    <ProductImage name={selectedProduct.name} photoUrl={selectedProduct.photoUrl} size="compact" />
                    <span className="grid min-w-0 flex-1 gap-1"><strong className="wrap-anywhere text-ink">{selectedProduct.name}</strong><span className="text-sm text-history-muted">{selectedProduct.category?.name ?? "Sem categoria"} · unidade cadastrada: {selectedProduct.unit.symbol}</span></span>
                    <Button variant="icon" type="button" className="size-11 rounded-full text-brand hover:bg-sidebar-active" onClick={onClearSelection} aria-label="Escolher outro produto"><img src={searchIcon} alt="" aria-hidden="true" className="size-5" /></Button>
                </div>
            ) : <SearchField id={searchId} label="Buscar produto vinculado à cozinha" placeholder="Buscar produto da cozinha" value={search} onChange={(event) => setSearch(event.target.value)} />}
            {!selectedProduct && search.trim().length < 2 && <p className="text-sm text-history-muted">A busca mostra apenas produtos ativos vinculados a esta cozinha. Digite pelo menos duas letras.</p>}
            {!selectedProduct && state.loading && <p role="status" aria-live="polite" className="text-sm text-history-muted">Carregando produtos vinculados à cozinha…</p>}
            {!selectedProduct && state.error && <div className="grid gap-2"><Feedback severity="error">{state.error}</Feedback><button type="button" className="justify-self-start font-semibold text-brand underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" onClick={() => setRetryToken((current) => current + 1)}>Tentar buscar novamente</button></div>}
            {!selectedProduct && !state.loading && !state.error && visibleProducts.length === 0 && search.trim().length >= 2 && <p className="rounded-xl bg-history-card-header p-3 text-sm text-history-muted">{state.products.length ? "Nenhum produto encontrado para esta busca." : "Não há produtos ativos vinculados a esta cozinha."}</p>}
            {!selectedProduct && !state.loading && !state.error && visibleProducts.length > 0 && (
                <ul className="grid max-h-72 min-w-0 list-none gap-2 overflow-y-auto p-0" aria-label="Produtos disponíveis nesta cozinha">
                    {visibleProducts.map((product) => (
                        <li key={product.id}>
                            <button type="button" className="grid min-h-12 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-history-border bg-surface px-3 py-2 text-left text-ink transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" onClick={() => onSelect(product)}>
                                <span className="flex min-w-0 items-center gap-3"><ProductImage name={product.name} photoUrl={product.photoUrl} size="compact" /><span className="grid min-w-0 gap-1"><span className="font-semibold wrap-anywhere">{product.name}</span><span className="text-sm text-history-muted">{product.category?.name ?? product.brand ?? "Sem categoria"} · {product.unit.symbol}</span></span></span>
                                <span className="font-semibold text-brand">Adicionar</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
