import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ProductCategory, ProductFormErrors, ProductInput, ProductRecord, ProductUnit } from "../../../types/products";
import { ApiError } from "../../../services/api";
import { getProductCategories } from "../../../services/categories";
import { getProductUnits } from "../../../services/units";
import { createProduct, getProduct, lookupProductBarcode, updateProduct, uploadProductPhoto } from "../../../services/products";
import { validateProduct, validateProductPhoto } from "../../../utils/productValidation";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";
import ProductEditorSkeleton from "./ProductEditorSkeleton";
import ProductPhotoField from "./ProductPhotoField";

interface ProductEditorProps { mode: "create" | "edit" }
interface ProductFormState { name: string; brand: string; categoryId: string; unitId: string; barcode: string }

const emptyValues: ProductFormState = { name: "", brand: "", categoryId: "", unitId: "", barcode: "" };

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    return fallback;
}

function ProductEditor({ mode }: ProductEditorProps) {
    const navigate = useNavigate();
    const { productId: rawProductId } = useParams<{ productId: string }>();
    const productId = rawProductId && /^\d+$/.test(rawProductId) ? Number(rawProductId) : null;
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [units, setUnits] = useState<ProductUnit[]>([]);
    const [product, setProduct] = useState<ProductRecord | null>(null);
    const [values, setValues] = useState<ProductFormState>(emptyValues);
    const [errors, setErrors] = useState<ProductFormErrors>({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [lookingUp, setLookingUp] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        async function loadForm() {
            setLoading(true);
            setLoadError(null);
            try {
                if (mode === "edit" && !productId) throw new Error("O identificador do produto é inválido.");
                const [loadedCategories, loadedUnits, loadedProduct] = await Promise.all([
                    getProductCategories(controller.signal),
                    getProductUnits(controller.signal),
                    mode === "edit" && productId ? getProduct(productId, controller.signal) : Promise.resolve(null),
                ]);
                if (controller.signal.aborted) return;
                setCategories(loadedCategories);
                setUnits(loadedUnits);
                setProduct(loadedProduct);
                if (loadedProduct) setValues({
                    name: loadedProduct.name,
                    brand: loadedProduct.brand ?? "",
                    categoryId: loadedProduct.category ? String(loadedProduct.category.id) : "",
                    unitId: String(loadedProduct.unit.id),
                    barcode: loadedProduct.barcode ?? "",
                });
            } catch (error: unknown) {
                if (!controller.signal.aborted) setLoadError(getErrorMessage(error, "Não foi possível preparar o formulário do produto."));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void loadForm();
        return () => controller.abort();
    }, [mode, productId]);

    const previewUrl = useMemo(() => selectedPhoto ? URL.createObjectURL(selectedPhoto) : product?.photoUrl ?? null, [product?.photoUrl, selectedPhoto]);
    useEffect(() => () => { if (selectedPhoto && previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl); }, [previewUrl, selectedPhoto]);

    function updateValue(field: keyof ProductFormState, value: string) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
        setFormError(null);
    }

    function inputValue(): ProductInput {
        return { name: values.name, brand: values.brand, categoryId: values.categoryId ? Number(values.categoryId) : null, unitId: Number(values.unitId), barcode: values.barcode };
    }

    function focusFirstInvalid(nextErrors: ProductFormErrors) {
        const firstInvalid = Object.keys(nextErrors)[0];
        if (firstInvalid) document.getElementById(`produto-${firstInvalid}`)?.focus();
    }

    async function searchBarcode() {
        const barcode = values.barcode.trim();
        if (!barcode) {
            setErrors((current) => ({ ...current, barcode: "Informe o código de barras antes de consultar." }));
            document.getElementById("produto-barcode")?.focus();
            return;
        }
        setLookingUp(true);
        setFormError(null);
        try {
            const result = await lookupProductBarcode(barcode);
            if (result.name || result.brand) {
                setValues((current) => ({ ...current, name: result.name || current.name, brand: result.brand || current.brand }));
                setNotice("Encontramos dados para este código. Revise os campos e escolha uma foto para enviá-la ao Inventra.");
            } else {
                setNotice("A consulta não encontrou nome ou marca para preencher. Você pode continuar manualmente.");
            }
        } catch (error: unknown) {
            setFormError(error instanceof ApiError && error.status === 404 ? "Nenhum produto foi encontrado para esse código de barras." : getErrorMessage(error, "Não foi possível consultar o código de barras."));
        } finally {
            setLookingUp(false);
        }
    }

    async function savePhoto(savedProduct: ProductRecord) {
        if (!selectedPhoto) return;
        const photoValidationError = validateProductPhoto(selectedPhoto);
        if (photoValidationError) { setPhotoError(photoValidationError); return; }
        setPhotoError(null);
        try {
            await uploadProductPhoto(savedProduct.id, selectedPhoto);
            navigate(`/produtos/${savedProduct.id}`, { state: { message: "Produto salvo com a foto." } });
        } catch (error: unknown) {
            setProduct(savedProduct);
            setPhotoError(getErrorMessage(error, "O produto foi salvo, mas a foto não foi enviada."));
            setNotice("Os dados do produto foram salvos. Tente enviar a foto novamente ou continue sem ela.");
        }
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validation = validateProduct(inputValue());
        const nextErrors = { ...validation.errors };
        setNotice(null);
        setFormError(null);
        if (mode === "edit" && product) {
            if (product.category && !validation.values.categoryId) nextErrors.categoryId = "A API não permite remover uma categoria já associada. Selecione outra categoria para substituí-la.";
            if (product.brand?.trim() && !validation.values.brand) nextErrors.brand = "A API não permite remover a marca por este formulário. Informe uma nova marca ou mantenha a atual.";
            if (product.barcode?.trim() && !validation.values.barcode) nextErrors.barcode = "A API não permite remover o código de barras por este formulário. Informe um novo código ou mantenha o atual.";
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) { focusFirstInvalid(nextErrors); return; }
        setSaving(true);
        try {
            const saved = mode === "edit" && productId
                ? await updateProduct(productId, validation.values)
                : product ?? await createProduct(validation.values);
            setProduct(saved);
            if (selectedPhoto) await savePhoto(saved);
            else navigate(`/produtos/${saved.id}`, { state: { message: mode === "edit" ? "Produto atualizado." : "Produto criado." } });
        } catch (error: unknown) {
            setFormError(getErrorMessage(error, "Não foi possível salvar o produto. Revise os dados e tente novamente."));
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <section className="px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3"><ProductEditorSkeleton /></section>;
    if (loadError || (mode === "edit" && !product)) return <section className="flex min-w-0 flex-col gap-4 px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3"><Feedback severity="error">{loadError ?? "Produto não encontrado."}</Feedback><Link className="w-fit font-bold text-link underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/produtos">Voltar ao catálogo</Link></section>;

    return (
        <section className="flex min-w-0 flex-col gap-5 px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3"><div><Link className="text-sm font-semibold text-link underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={product ? `/produtos/${product.id}` : "/produtos"}>‹ Voltar</Link><h2 className="mt-2 font-k2d text-2xl font-bold text-sidebar-text">{mode === "edit" ? "Editar produto" : "Novo produto"}</h2><p className="mt-1 text-sm text-history-muted">Os dados são enviados ao catálogo da cozinha atual.</p></div></div>
            {formError && <Feedback severity="error">{formError}</Feedback>}
            {notice && <Feedback severity="info">{notice}</Feedback>}
            <form className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(17rem,0.8fr)]" onSubmit={submit} noValidate>
                <section className="flex min-w-0 flex-col gap-5 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7" aria-labelledby="dados-produto-titulo">
                    <div><h3 id="dados-produto-titulo" className="font-k2d text-lg font-bold text-sidebar-text">Dados do produto</h3><p className="mt-1 text-sm leading-relaxed text-history-muted">O nome e a unidade são obrigatórios. Os demais campos são opcionais.</p></div>

                    <div className="min-w-0"><label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor="produto-name">Nome do produto</label><Input id="produto-name" variant="text" value={values.name} maxLength={150} required autoComplete="off" placeholder="Ex.: Arroz integral" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "produto-name-erro" : undefined} onChange={(event) => updateValue("name", event.target.value)} />{errors.name && <p className="mt-1 text-sm text-feedback-error" id="produto-name-erro" role="alert">{errors.name}</p>}</div>

                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                        <div className="min-w-0"><label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor="produto-brand">Marca <span className="font-normal text-history-muted">(opcional)</span></label><Input id="produto-brand" variant="text" value={values.brand} maxLength={80} autoComplete="off" placeholder="Ex.: Tio João" aria-invalid={Boolean(errors.brand)} aria-describedby={errors.brand ? "produto-brand-erro" : undefined} onChange={(event) => updateValue("brand", event.target.value)} />{errors.brand && <p className="mt-1 text-sm text-feedback-error" id="produto-brand-erro" role="alert">{errors.brand}</p>}{mode === "edit" && product?.brand && <p className="mt-1 text-xs leading-relaxed text-history-muted">A API permite substituir a marca, mas não oferece uma operação para apagá-la.</p>}</div>
                        <div className="min-w-0"><label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor="produto-categoryId">Categoria <span className="font-normal text-history-muted">(opcional)</span></label><select id="produto-categoryId" className="min-h-login-input-height w-full rounded-login-control border border-login-field-border bg-login-field px-login-input-x py-2 font-k2d text-login-input text-login-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-feedback-error" value={values.categoryId} aria-invalid={Boolean(errors.categoryId)} aria-describedby={errors.categoryId ? "produto-category-erro" : undefined} onChange={(event) => updateValue("categoryId", event.target.value)}><option value="">Sem categoria</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>{errors.categoryId && <p className="mt-1 text-sm text-feedback-error" id="produto-category-erro" role="alert">{errors.categoryId}</p>}{mode === "edit" && product?.category && <p className="mt-1 text-xs leading-relaxed text-history-muted">A API permite trocar a categoria, mas não oferece uma operação para removê-la.</p>}</div>
                    </div>

                    <div className="grid min-w-0 items-end gap-4 sm:grid-cols-2">
                        <div className="min-w-0"><label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor="produto-unitId">Unidade de medida</label><select id="produto-unitId" className="min-h-login-input-height w-full rounded-login-control border border-login-field-border bg-login-field px-login-input-x py-2 font-k2d text-login-input text-login-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-feedback-error" value={values.unitId} required aria-invalid={Boolean(errors.unitId)} aria-describedby={errors.unitId ? "produto-unit-erro" : undefined} onChange={(event) => updateValue("unitId", event.target.value)}><option value="">Selecione uma unidade</option>{units.map((unit) => <option value={unit.id} key={unit.id}>{unit.symbol} · {unit.description}</option>)}</select>{errors.unitId && <p className="mt-1 text-sm text-feedback-error" id="produto-unit-erro" role="alert">{errors.unitId}</p>}{units.length === 0 && <p className="mt-1 text-xs text-history-muted">Cadastre uma unidade na área de categorias e unidades.</p>}</div>
                        <div className="min-w-0"><label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor="produto-barcode">Código de barras <span className="font-normal text-history-muted">(opcional)</span></label><div className="flex min-w-0 gap-2"><Input id="produto-barcode" variant="text" value={values.barcode} maxLength={50} inputMode="numeric" autoComplete="off" placeholder="Digite ou escaneie o código" aria-invalid={Boolean(errors.barcode)} aria-describedby={errors.barcode ? "produto-barcode-erro" : "produto-barcode-ajuda"} onChange={(event) => updateValue("barcode", event.target.value)} /><Button variant="icon" className="min-h-11 shrink-0 rounded-xl border border-history-border bg-surface px-3 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header disabled:opacity-60" type="button" disabled={lookingUp || !values.barcode.trim()} onClick={() => void searchBarcode()}>{lookingUp ? "Buscando…" : "Consultar"}</Button></div>{errors.barcode && <p className="mt-1 text-sm text-feedback-error" id="produto-barcode-erro" role="alert">{errors.barcode}</p>}{!errors.barcode && <p className="mt-1 text-xs text-history-muted" id="produto-barcode-ajuda">O código é validado pela API ao salvar. A consulta pode preencher nome e marca.</p>}{mode === "edit" && product?.barcode && <p className="mt-1 text-xs leading-relaxed text-history-muted">A API permite substituir o código, mas não oferece uma operação para apagá-lo.</p>}</div>
                    </div>

                    <div className="flex min-w-0 flex-wrap gap-2 border-t border-history-border pt-5"><Button variant="icon" className="min-h-11 rounded-xl border border-history-border px-5 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" type="button" onClick={() => navigate(product ? `/produtos/${product.id}` : "/produtos")}>Cancelar</Button><Button variant="primary" className="min-h-11 rounded-xl px-5 py-2.5 text-sm" type="submit" disabled={saving || units.length === 0}>{saving ? "Salvando…" : mode === "edit" ? "Salvar alterações" : "Salvar produto"}</Button></div>
                </section>
                <div className="flex min-w-0 flex-col gap-4">
                    <ProductPhotoField preview={previewUrl} fileName={selectedPhoto?.name ?? null} error={photoError} onSelect={(file) => { setSelectedPhoto(file); setPhotoError(null); }} />
                    {photoError && product && selectedPhoto && <div className="flex flex-wrap gap-2 rounded-2xl border border-feedback-error/40 bg-feedback-error-bg p-4"><Button variant="icon" type="button" className="min-h-10 rounded-xl bg-brand px-4 font-k2d text-sm font-bold text-on-brand hover:bg-brand-strong" disabled={saving} onClick={() => void savePhoto(product)}>Tentar enviar foto novamente</Button><Button variant="icon" type="button" className="min-h-10 rounded-xl border border-history-border bg-surface px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" onClick={() => navigate(`/produtos/${product.id}`, { state: { message: "Produto salvo sem atualizar a foto." } })}>Continuar sem foto</Button></div>}
                </div>
            </form>
        </section>
    );
}

export default ProductEditor;
