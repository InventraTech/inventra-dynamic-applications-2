import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { ApiKitchen } from "../../../types/auth";
import type { ProductKitchenParameters, ProductRecord, ProductSupplier } from "../../../types/products";
import { ApiError } from "../../../services/api";
import { getCurrentUser } from "../../../services/authService";
import { getSession, updateSessionKitchen } from "../../../services/authSession";
import { deleteProductPhoto, getProduct, getProductKitchenParameters, getProductSuppliers } from "../../../services/products";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import ProductDetailSkeleton from "./ProductDetailSkeleton";
import ProductKitchenPanel from "./ProductKitchenPanel";
import boxIcon from "../../../assets/icons/caixa.svg";

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    return "Não foi possível carregar os detalhes do produto. Tente novamente.";
}

function ProductDetail() {
    const { productId: rawProductId } = useParams<{ productId: string }>();
    const productId = rawProductId && /^\d+$/.test(rawProductId) ? Number(rawProductId) : null;
    const location = useLocation();
    const [product, setProduct] = useState<ProductRecord | null>(null);
    const [suppliers, setSuppliers] = useState<ProductSupplier[]>([]);
    const [parameters, setParameters] = useState<ProductKitchenParameters[]>([]);
    const [kitchen, setKitchen] = useState<ApiKitchen | null>(() => getSession()?.user.kitchen ?? null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>((location.state as { message?: string } | null)?.message ?? null);
    const [retryKey, setRetryKey] = useState(0);
    const [removingPhoto, setRemovingPhoto] = useState(false);
    const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const photoDialogRef = useRef<HTMLDialogElement>(null);
    const photoTriggerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        async function loadProduct() {
            if (!productId) { setError("O identificador do produto é inválido."); setLoading(false); return; }
            setLoading(true);
            setError(null);
            try {
                const [loadedProduct, loadedSuppliers, loadedParameters, currentUser] = await Promise.all([
                    getProduct(productId, controller.signal),
                    getProductSuppliers(productId, controller.signal),
                    getProductKitchenParameters(productId, controller.signal),
                    getCurrentUser(controller.signal),
                ]);
                if (controller.signal.aborted) return;
                setProduct(loadedProduct);
                setSuppliers(loadedSuppliers);
                setParameters(loadedParameters);
                setKitchen(currentUser.kitchen);
                if (currentUser.kitchen) updateSessionKitchen(currentUser.kitchen);
            } catch (loadError: unknown) {
                if (!controller.signal.aborted) setError(getErrorMessage(loadError));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void loadProduct();
        return () => controller.abort();
    }, [productId, retryKey]);

    useEffect(() => {
        const dialog = photoDialogRef.current;
        if (!dialog) return;
        if (photoDialogOpen && !dialog.open) dialog.showModal();
        if (!photoDialogOpen && dialog.open) {
            dialog.close();
            requestAnimationFrame(() => photoTriggerRef.current?.focus());
        }
    }, [photoDialogOpen]);

    async function confirmPhotoRemoval() {
        if (!product) return;
        setRemovingPhoto(true);
        setPhotoError(null);
        try {
            const updated = await deleteProductPhoto(product.id);
            setProduct(updated);
            setNotice("Foto removida.");
            setPhotoDialogOpen(false);
        } catch (removeError: unknown) {
            setPhotoError(getErrorMessage(removeError));
        } finally {
            setRemovingPhoto(false);
        }
    }

    const currentKitchenParameters = parameters.find((item) => item.kitchen.id === kitchen?.id) ?? parameters[0] ?? null;

    if (loading) return <section className="px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3"><ProductDetailSkeleton /></section>;
    if (error || !product) return <section className="flex min-w-0 flex-col gap-4 px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3"><Feedback severity="error">{error ?? "Produto não encontrado."}</Feedback><div className="flex flex-wrap gap-2"><Button variant="icon" className="min-h-10 rounded-xl border border-history-border bg-surface px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" type="button" onClick={() => { setLoading(true); setRetryKey((current) => current + 1); }}>Tentar novamente</Button><Link className="inline-flex min-h-10 items-center rounded-xl bg-brand px-4 py-2 font-k2d text-sm font-bold text-on-brand hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/produtos">Voltar ao catálogo</Link></div></section>;

    return (
        <section className="flex min-w-0 flex-col gap-5 px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><div><Link className="text-sm font-semibold text-link underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/produtos">‹ Produtos</Link><p className="mt-2 text-sm text-history-muted">Detalhes do produto</p></div><div className="flex flex-wrap gap-2"><Link className="inline-flex min-h-10 items-center rounded-xl border border-brand px-4 py-2 font-k2d text-sm font-bold text-brand hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={`/produtos/${product.id}/editar`}>Editar produto</Link>{product.photoUrl && <Button ref={photoTriggerRef} variant="icon" className="min-h-10 rounded-xl border border-history-border bg-surface px-4 font-k2d text-sm font-bold text-feedback-error hover:bg-feedback-error-bg" type="button" onClick={() => setPhotoDialogOpen(true)}>Remover foto</Button>}</div></div>
            {notice && <Feedback severity="success">{notice}</Feedback>}
            <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
                <div className="flex min-w-0 flex-col gap-5">
                    <section className="flex min-w-0 flex-col gap-5 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7" aria-labelledby="produto-detalhe-titulo">
                        <div className="flex min-w-0 flex-wrap items-center gap-4"><img className="size-24 shrink-0 rounded-2xl bg-history-card-header object-cover" src={product.photoUrl || boxIcon} alt={product.photoUrl ? `Foto de ${product.name}` : ""} onError={(event) => { event.currentTarget.src = boxIcon; }} /><div className="min-w-0 flex-1"><h2 id="produto-detalhe-titulo" className="font-k2d text-2xl font-bold text-sidebar-text wrap-anywhere">{product.name}</h2><p className="mt-1 text-sm text-history-muted">{product.brand || "Sem marca"}</p><p className={`mt-3 inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ${product.active ? "bg-feedback-success-bg text-feedback-success" : "bg-history-card-header text-history-muted"}`}>{product.active ? "Ativo" : "Inativo"}</p></div></div>
                        <dl className="grid min-w-0 gap-3 border-t border-history-border pt-5 sm:grid-cols-2"><div className="rounded-xl bg-history-card-header p-3"><dt className="text-xs font-semibold text-history-muted">Categoria</dt><dd className="mt-1 wrap-anywhere font-semibold text-sidebar-text">{product.category?.name ?? "Sem categoria"}</dd></div><div className="rounded-xl bg-history-card-header p-3"><dt className="text-xs font-semibold text-history-muted">Unidade de medida</dt><dd className="mt-1 font-semibold text-sidebar-text">{product.unit.symbol}</dd></div><div className="rounded-xl bg-history-card-header p-3 sm:col-span-2"><dt className="text-xs font-semibold text-history-muted">Código de barras</dt><dd className="mt-1 wrap-anywhere font-semibold text-sidebar-text">{product.barcode || "Não informado"}</dd></div></dl>
                    </section>

                    <section className="flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7" aria-labelledby="fornecedores-produto-titulo">
                        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2"><div><h2 id="fornecedores-produto-titulo" className="font-k2d text-lg font-bold text-sidebar-text">Fornecedores associados</h2><p className="mt-1 text-sm leading-relaxed text-history-muted">Fornecedores e condições registrados para este produto.</p></div><Link className="inline-flex min-h-9 items-center rounded-lg border border-brand px-3 py-2 text-sm font-bold text-brand hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={`/produtos/${product.id}?fornecedor=novo`}>Vincular fornecedor</Link></div>
                        {suppliers.length === 0 ? <p className="rounded-xl bg-history-card-header p-4 text-sm text-history-muted">Nenhum fornecedor associado a este produto.</p> : <div className="min-w-0 overflow-x-auto" role="region" aria-label="Fornecedores associados ao produto" tabIndex={0}><table className="w-full min-w-120 text-left font-k2d text-sm"><thead className="bg-history-card-header text-xs text-history-muted"><tr><th className="rounded-l-xl px-3 py-2.5" scope="col">Fornecedor</th><th className="px-3 py-2.5" scope="col">Código</th><th className="px-3 py-2.5" scope="col">Preço de referência</th><th className="rounded-r-xl px-3 py-2.5" scope="col">Prazo</th></tr></thead><tbody className="divide-y divide-history-border">{suppliers.map((supplier) => <tr key={supplier.supplier.id}><th className="px-3 py-3 text-left font-semibold text-sidebar-text" scope="row">{supplier.supplier.legalName}</th><td className="px-3 py-3 text-history-muted">{supplier.supplierCode || "—"}</td><td className="px-3 py-3 text-sidebar-text">{supplier.referencePrice === null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(supplier.referencePrice)}</td><td className="px-3 py-3 text-sidebar-text">{supplier.leadTimeDays === null ? "—" : `${supplier.leadTimeDays} dias`}</td></tr>)}</tbody></table></div>}
                    </section>
                </div>

                <ProductKitchenPanel product={product} kitchen={kitchen} parameters={currentKitchenParameters} onParametersChange={setParameters} />
            </div>

            <dialog ref={photoDialogRef} className="m-auto max-h-dvh w-11/12 max-w-112 rounded-3xl border border-history-border bg-surface p-0 text-sidebar-text shadow-2xl backdrop:bg-black/50" aria-labelledby="remover-foto-titulo" onCancel={(event) => { event.preventDefault(); setPhotoDialogOpen(false); }}>
                <div className="flex flex-col gap-4 p-6"><div><h2 id="remover-foto-titulo" className="font-k2d text-xl font-bold text-sidebar-purple">Remover foto do produto?</h2><p className="mt-2 text-sm leading-relaxed text-history-muted">A imagem será removida do produto e do armazenamento de fotos.</p></div>{photoError && <Feedback severity="error">{photoError}</Feedback>}<div className="flex flex-wrap justify-end gap-2"><Button variant="icon" className="min-h-10 rounded-xl border border-history-border px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" type="button" disabled={removingPhoto} onClick={() => setPhotoDialogOpen(false)}>Cancelar</Button><Button variant="primary" className="min-h-10 rounded-xl bg-feedback-error px-4 py-2 text-sm hover:bg-feedback-error/90" type="button" disabled={removingPhoto} onClick={() => void confirmPhotoRemoval()}>{removingPhoto ? "Removendo…" : "Remover foto"}</Button></div></div>
            </dialog>
        </section>
    );
}

export default ProductDetail;
