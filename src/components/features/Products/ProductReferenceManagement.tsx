import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProductCategory, ProductUnit } from "../../../types/products";
import { ApiError } from "../../../services/api";
import { createCategory, deleteCategory, getProductCategories, updateCategory } from "../../../services/categories";
import { createUnit, deleteUnit, getProductUnits, updateUnit } from "../../../services/units";
import Feedback from "../../ui/Feedback";
import ProductReferencePanel, { type ProductReference, type ProductReferenceKind } from "./ProductReferencePanel";

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    return "Não foi possível carregar categorias e unidades.";
}

function ProductReferenceManagement() {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [units, setUnits] = useState<ProductUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        async function loadReferences() {
            setLoading(true);
            setError(null);
            try {
                const [loadedCategories, loadedUnits] = await Promise.all([
                    getProductCategories(controller.signal),
                    getProductUnits(controller.signal),
                ]);
                if (controller.signal.aborted) return;
                setCategories(loadedCategories);
                setUnits(loadedUnits);
            } catch (loadError: unknown) {
                if (!controller.signal.aborted) setError(getErrorMessage(loadError));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void loadReferences();
        return () => controller.abort();
    }, [retryKey]);

    async function save(kind: ProductReferenceKind, id: number | null, primary: string, description: string) {
        if (kind === "category") {
            const input = { name: primary, description };
            const saved = id === null ? await createCategory(input) : await updateCategory(id, input);
            setCategories((current) => id === null ? [...current, saved].sort((first, second) => first.name.localeCompare(second.name, "pt-BR")) : current.map((item) => item.id === saved.id ? saved : item).sort((first, second) => first.name.localeCompare(second.name, "pt-BR")));
            return;
        }
        const input = { symbol: primary, description };
        const saved = id === null ? await createUnit(input) : await updateUnit(id, input);
        setUnits((current) => id === null ? [...current, saved].sort((first, second) => first.symbol.localeCompare(second.symbol, "pt-BR")) : current.map((item) => item.id === saved.id ? saved : item).sort((first, second) => first.symbol.localeCompare(second.symbol, "pt-BR")));
    }

    async function remove(kind: ProductReferenceKind, item: ProductReference) {
        if (kind === "category") {
            await deleteCategory(item.id);
            setCategories((current) => current.filter((category) => category.id !== item.id));
            return;
        }
        await deleteUnit(item.id);
        setUnits((current) => current.filter((unit) => unit.id !== item.id));
    }

    return (
        <section className="flex min-w-0 flex-col gap-5 px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3"><div><Link className="text-sm font-semibold text-link underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/produtos">‹ Produtos</Link><h2 className="mt-2 font-k2d text-2xl font-bold text-sidebar-text">Categorias e unidades</h2><p className="mt-1 text-sm leading-relaxed text-history-muted">Opções usadas para classificar e descrever as unidades dos produtos.</p></div></div>
            {error && <div className="flex min-w-0 flex-col gap-3"><Feedback severity="error">{error}</Feedback><button className="min-h-10 w-fit rounded-xl border border-history-border bg-surface px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" type="button" onClick={() => { setLoading(true); setRetryKey((current) => current + 1); }}>Tentar novamente</button></div>}
            <div className="grid min-w-0 items-start gap-5 xl:grid-cols-2">
                <ProductReferencePanel kind="category" items={categories} loading={loading} onSave={(id, primary, description) => save("category", id, primary, description)} onDelete={(item) => remove("category", item)} />
                <ProductReferencePanel kind="unit" items={units} loading={loading} onSave={(id, primary, description) => save("unit", id, primary, description)} onDelete={(item) => remove("unit", item)} />
            </div>
        </section>
    );
}

export default ProductReferenceManagement;
