import { useDeferredValue, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { ProductCategory, ProductRecord, ProductStatusFilter } from "../../../types/products";
import { ApiError } from "../../../services/api";
import { getProductCategories } from "../../../services/categories";
import { searchProductsForKitchen, setProductActive } from "../../../services/products";
import { getCurrentUser } from "../../../services/authService";
import { updateSessionKitchen } from "../../../services/authSession";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Mascot from "../../ui/Mascot";
import SearchField from "../../ui/SearchField";
import ProductCatalogSkeleton from "./ProductCatalogSkeleton";
import boxIcon from "../../../assets/icons/caixa.svg";

const PAGE_SIZE = 20;

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    return "Não foi possível carregar o catálogo. Tente novamente.";
}

function ProductStatus({ active }: { active: boolean }) {
    return <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-feedback-success-bg text-feedback-success" : "bg-history-card-header text-history-muted"}`}>
        <span className={`size-2 rounded-full ${active ? "bg-feedback-success" : "bg-history-muted"}`} aria-hidden="true" />
        {active ? "Ativo" : "Inativo"}
    </span>;
}

function ProductCatalog() {
    const [catalogProducts, setCatalogProducts] = useState<ProductRecord[] | null>(null);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("name") ?? "";
    const deferredQuery = useDeferredValue(query);
    const [categoryId, setCategoryId] = useState("");
    const [status, setStatus] = useState<ProductStatusFilter>("all");
    const [page, setPage] = useState(0);
    const [completedLoadKey, setCompletedLoadKey] = useState<string | null>(null);
    const [loadFailure, setLoadFailure] = useState<{ key: string; message: string } | null>(null);
    const [categoryFailure, setCategoryFailure] = useState<{ key: number; message: string } | null>(null);
    const [kitchenMissingKey, setKitchenMissingKey] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);
    const [statusTarget, setStatusTarget] = useState<{ product: ProductRecord; active: boolean } | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const statusDialog = useRef<HTMLDialogElement>(null);
    const statusTrigger = useRef<HTMLButtonElement | null>(null);
    const kitchenScope = useRef<{ id: number; canReadStock: boolean } | null | undefined>(undefined);

    const loadKey = `${deferredQuery}:${categoryId}:${status}:${retryKey}`;
    const loading = completedLoadKey !== loadKey;
    const error = categoryFailure?.key === retryKey ? categoryFailure.message : loadFailure?.key === loadKey ? loadFailure.message : null;
    const totalElements = catalogProducts?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
    const pageData = catalogProducts === null ? null : {
        content: catalogProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
        totalElements,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
    };

    useEffect(() => {
        const controller = new AbortController();
        getProductCategories(controller.signal).then(setCategories).catch((loadError: unknown) => {
            if (!controller.signal.aborted) setCategoryFailure({ key: retryKey, message: getErrorMessage(loadError) });
        });
        return () => controller.abort();
    }, [retryKey]);

    useEffect(() => {
        const controller = new AbortController();
        async function loadKitchenCatalog() {
            let scope = kitchenScope.current;
            if (scope === undefined) {
                const currentUser = await getCurrentUser(controller.signal);
                if (controller.signal.aborted) return;
                if (currentUser.kitchen) updateSessionKitchen(currentUser.kitchen);
                const accessType = currentUser.profile.accessType;
                const normalizedAccessType = accessType.toLocaleUpperCase("pt-BR");
                scope = currentUser.kitchen
                    ? { id: currentUser.kitchen.id, canReadStock: normalizedAccessType === "SUPERVISOR" || normalizedAccessType === "ESTOQUISTA" }
                    : null;
                kitchenScope.current = scope;
            }

            if (!scope) {
                setCatalogProducts([]);
                setKitchenMissingKey(loadKey);
                return;
            }

            setKitchenMissingKey(null);
            const result = await searchProductsForKitchen({
                name: deferredQuery,
                ...(categoryId ? { categoryId: Number(categoryId) } : {}),
                ...(status === "all" ? {} : { active: status === "active" }),
                page: 0,
                size: PAGE_SIZE,
            }, scope.id, scope.canReadStock, controller.signal);
            if (!controller.signal.aborted) setCatalogProducts(result);
        }

        void loadKitchenCatalog()
            .catch((loadError: unknown) => {
                if (!controller.signal.aborted) {
                    setKitchenMissingKey(null);
                    setLoadFailure({ key: loadKey, message: getErrorMessage(loadError) });
                }
            })
            .finally(() => { if (!controller.signal.aborted) setCompletedLoadKey(loadKey); });
        return () => controller.abort();
    }, [categoryId, deferredQuery, loadKey, retryKey, status]);

    useEffect(() => {
        const dialog = statusDialog.current;
        if (!dialog) return;
        if (statusTarget && !dialog.open) dialog.showModal();
        if (!statusTarget && dialog.open) dialog.close();
    }, [statusTarget]);

    function changeFilter(change: () => void) {
        setPage(0);
        change();
    }

    function openStatusDialog(product: ProductRecord, active: boolean, trigger: HTMLButtonElement) {
        statusTrigger.current = trigger;
        setStatusTarget({ product, active });
    }

    async function confirmStatus() {
        if (!statusTarget) return;
        setUpdatingId(statusTarget.product.id);
        setActionError(null);
        try {
            await setProductActive(statusTarget.product.id, statusTarget.active);
            setNotice(`Produto ${statusTarget.active ? "ativado" : "desativado"}.`);
            setStatusTarget(null);
            setRetryKey((current) => current + 1);
            requestAnimationFrame(() => statusTrigger.current?.focus());
        } catch (actionError: unknown) {
            setActionError(getErrorMessage(actionError));
        } finally {
            setUpdatingId(null);
        }
    }

    const products = pageData?.content ?? [];
    const statusOptions: Array<{ id: ProductStatusFilter; label: string }> = [
        { id: "all", label: "Todos" }, { id: "active", label: "Ativos" }, { id: "inactive", label: "Inativos" },
    ];

    return (
        <section className="flex min-w-0 flex-col gap-5 px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3" aria-busy={loading}>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {statusOptions.map((option) => <button key={option.id} type="button" aria-pressed={status === option.id} onClick={() => changeFilter(() => setStatus(option.id))} className={`min-h-10 rounded-full border px-4 py-2 font-k2d text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${status === option.id ? "border-brand bg-brand text-on-brand" : "border-history-border bg-surface text-history-muted hover:bg-history-card-header"}`}>{option.label}</button>)}
                    <label className="sr-only" htmlFor="produto-categoria">Filtrar por categoria</label>
                    <select id="produto-categoria" className="min-h-10 min-w-35 rounded-full border border-history-border bg-surface px-3 font-k2d text-sm text-sidebar-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={categoryId} onChange={(event) => changeFilter(() => setCategoryId(event.target.value))}>
                        <option value="">Todas as categorias</option>
                        {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
                    </select>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <SearchField className="w-full shadow-history-card sm:w-72" label="Buscar produtos" placeholder="Buscar produto por nome" value={query} onChange={(event) => { const value = event.target.value; changeFilter(() => setSearchParams(value.trim() ? { name: value } : {}, { replace: true })); }} />
                    <Link className="inline-flex min-h-10 items-center justify-center rounded-full bg-brand px-4 py-2 font-k2d text-sm font-bold text-on-brand hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/produtos/novo">Novo produto</Link>
                </div>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 text-sm text-history-muted">
                <p>{loading ? "Atualizando catálogo…" : `${pageData?.totalElements ?? 0} ${pageData?.totalElements === 1 ? "produto" : "produtos"}`}</p>
                <Link className="font-bold text-link underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/produtos/categorias-unidades">Categorias e unidades</Link>
            </div>

            {notice && <Feedback severity="success">{notice}</Feedback>}
            {error && <Feedback severity="error">{error}</Feedback>}
            {error && <Button variant="icon" className="min-h-10 w-fit rounded-full border border-history-border bg-surface px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" type="button" onClick={() => setRetryKey((current) => current + 1)}>Tentar novamente</Button>}

            {loading ? <ProductCatalogSkeleton /> : error ? null : kitchenMissingKey === loadKey ? (
                <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-3xl bg-surface p-7 text-center shadow-history-card">
                    <h2 className="font-k2d text-xl font-bold text-sidebar-text">Sua conta ainda não está vinculada a uma cozinha</h2>
                    <p className="max-w-110 text-sm leading-relaxed text-history-muted">O catálogo exibe apenas produtos associados à cozinha da sua conta. Peça ao administrador para vinculá-la.</p>
                </div>
            ) : products.length === 0 ? (
                <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-3xl bg-surface p-7 text-center shadow-history-card">
                    <Mascot size="compacto" className="w-20" />
                    <h2 className="font-k2d text-xl font-bold text-sidebar-text">{query || categoryId || status !== "all" ? "Nenhum produto encontrado" : "Seu catálogo ainda está vazio"}</h2>
                    <p className="max-w-110 text-sm leading-relaxed text-history-muted">{query || categoryId || status !== "all" ? "Tente ajustar os filtros ou limpar a busca." : "Cadastre o primeiro produto para começar a organizar o catálogo da cozinha."}</p>
                    {query || categoryId || status !== "all" ? <Button variant="icon" className="min-h-10 rounded-full border border-history-border px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" type="button" onClick={() => { setSearchParams({}, { replace: true }); setCategoryId(""); setStatus("all"); setPage(0); }}>Limpar filtros</Button> : <Link className="inline-flex min-h-10 items-center rounded-full bg-brand px-4 py-2 font-k2d text-sm font-bold text-on-brand hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/produtos/novo">Cadastrar produto</Link>}
                </div>
            ) : (
                <div className="min-w-0 rounded-3xl bg-surface p-3 shadow-history-card sm:p-5">
                    <div className="min-w-0 overflow-x-auto" role="region" aria-label="Tabela de produtos. Em telas estreitas, deslize horizontalmente para ver todas as colunas." tabIndex={0}>
                        <table className="w-full min-w-200 border-collapse text-left font-k2d text-sm">
                            <thead className="bg-history-card-header text-xs text-history-muted"><tr><th className="rounded-l-xl px-4 py-3 font-semibold" scope="col">Produto</th><th className="px-4 py-3 font-semibold" scope="col">Categoria</th><th className="px-4 py-3 font-semibold" scope="col">Unidade</th><th className="px-4 py-3 font-semibold" scope="col">Código de barras</th><th className="px-4 py-3 font-semibold" scope="col">Situação</th><th className="rounded-r-xl px-4 py-3 font-semibold" scope="col"><span className="sr-only">Ações</span></th></tr></thead>
                            <tbody className="divide-y divide-history-border">
                                {products.map((product) => <tr className="group hover:bg-history-card-header/60" key={product.id}>
                                    <th className="px-4 py-3 text-left font-normal" scope="row"><Link className="flex min-w-52 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={`/produtos/${product.id}`}><img className="size-11 shrink-0 rounded-xl bg-history-card-header object-cover" src={product.photoUrl || boxIcon} alt={product.photoUrl ? `Foto de ${product.name}` : ""} onError={(event) => { event.currentTarget.src = boxIcon; }} /><span className="min-w-0"><span className="block font-bold text-sidebar-text">{product.name}</span><span className="block text-xs text-history-muted">{product.brand || "Sem marca"}</span></span></Link></th>
                                    <td className="px-4 py-3 text-sidebar-text">{product.category?.name ?? "Sem categoria"}</td><td className="px-4 py-3 text-sidebar-text">{product.unit.symbol}</td><td className="px-4 py-3 text-history-muted">{product.barcode || "—"}</td><td className="px-4 py-3"><ProductStatus active={product.active} /></td>
                                    <td className="px-4 py-3"><div className="flex items-center gap-1.5"><Link className="inline-flex min-h-9 items-center rounded-lg px-2.5 text-sm font-bold text-link hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus" to={`/produtos/${product.id}/editar`}>Editar</Link><button type="button" className="inline-flex min-h-9 items-center rounded-lg px-2.5 text-sm font-bold text-sidebar-purple hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus disabled:opacity-60" disabled={updatingId === product.id} onClick={(event) => openStatusDialog(product, !product.active, event.currentTarget)}>{product.active ? "Desativar" : "Ativar"}</button></div></td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-history-border px-2 pt-4 text-sm text-history-muted">
                        <p>Mostrando {pageData ? page * PAGE_SIZE + 1 : 0}–{pageData ? page * PAGE_SIZE + products.length : 0} de {pageData?.totalElements ?? 0}</p>
                        <div className="flex items-center gap-2"><Button variant="icon" className="min-h-9 min-w-9 rounded-lg border border-history-border px-2 text-sidebar-purple disabled:opacity-50" type="button" disabled={pageData?.first ?? true} onClick={() => setPage((current) => Math.max(0, current - 1))} aria-label="Página anterior">‹</Button><span aria-live="polite">Página {page + 1} de {Math.max(1, pageData?.totalPages ?? 1)}</span><Button variant="icon" className="min-h-9 min-w-9 rounded-lg border border-history-border px-2 text-sidebar-purple disabled:opacity-50" type="button" disabled={pageData?.last ?? true} onClick={() => setPage((current) => current + 1)} aria-label="Próxima página">›</Button><label className="sr-only" htmlFor="produtos-por-pagina">Produtos por página</label><select id="produtos-por-pagina" className="min-h-9 rounded-lg border border-history-border bg-surface px-2 text-sidebar-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" value={PAGE_SIZE} disabled aria-label="Quantidade por página"> <option value={PAGE_SIZE}>{PAGE_SIZE} por página</option></select></div>
                    </div>
                </div>
            )}

            <dialog ref={statusDialog} className="m-auto max-h-dvh w-11/12 max-w-112 rounded-3xl border border-history-border bg-surface p-0 text-sidebar-text shadow-2xl backdrop:bg-black/50" aria-labelledby="confirmar-situacao-titulo" onClose={() => { setStatusTarget(null); requestAnimationFrame(() => statusTrigger.current?.focus()); }} onCancel={() => setStatusTarget(null)}>
                {statusTarget && <div className="flex flex-col gap-4 p-6"><div><h2 id="confirmar-situacao-titulo" className="font-k2d text-xl font-bold text-sidebar-purple">{statusTarget.active ? "Ativar produto?" : "Desativar produto?"}</h2><p className="mt-2 text-sm leading-relaxed text-history-muted">{statusTarget.active ? `“${statusTarget.product.name}” voltará a aparecer entre os produtos ativos.` : `“${statusTarget.product.name}” deixará de aparecer entre os produtos ativos.`}</p></div>{actionError && <Feedback severity="error">{actionError}</Feedback>}<div className="flex flex-wrap justify-end gap-2"><Button variant="icon" className="min-h-10 rounded-xl border border-history-border px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" type="button" disabled={updatingId !== null} onClick={() => setStatusTarget(null)}>Cancelar</Button><Button variant="primary" className={statusTarget.active ? "min-h-10 rounded-xl px-4 py-2 text-sm" : "min-h-10 rounded-xl bg-feedback-error px-4 py-2 text-sm hover:bg-feedback-error/90"} type="button" disabled={updatingId !== null} onClick={() => void confirmStatus()}>{updatingId !== null ? "Salvando…" : statusTarget.active ? "Ativar produto" : "Desativar produto"}</Button></div></div>}
            </dialog>
        </section>
    );
}

export default ProductCatalog;
