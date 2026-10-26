import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { removeRequisitionItem } from "../../../services/requisitions";
import type { Requisition, RequisitionItem } from "../../../types/requisitions";
import { formatRequisitionCurrency } from "../../../utils/requisitionPresentation";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import ProductImage from "../../ui/ProductImage";
import useRequisitionProductDetails from "./hooks/useRequisitionProductDetails";

interface RequisitionItemsPanelProps {
    requisition: Requisition;
    items: RequisitionItem[];
    canEdit: boolean;
    onChanged: () => Promise<void> | void;
    compact?: boolean;
    embedded?: boolean;
    addItemTo?: string;
}

function ItemSubtotal({ item }: { item: RequisitionItem }) {
    return item.estimatedPrice === null
        ? <span className="text-history-muted">Preço não informado</span>
        : <strong className="text-brand">{formatRequisitionCurrency(item.estimatedPrice * item.quantity)}</strong>;
}

export default function RequisitionItemsPanel({ requisition, items, canEdit, onChanged, compact = false, embedded = false, addItemTo }: RequisitionItemsPanelProps) {
    const [removingItemId, setRemovingItemId] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ severity: "error" | "success"; message: string } | null>(null);
    const productDetails = useRequisitionProductDetails(items);
    const total = formatRequisitionCurrency(requisition.estimatedTotal);
    const heading = compact ? "Resumo do rascunho" : "Itens da requisição";

    async function handleRemove(item: RequisitionItem) {
        setFeedback(null);
        setRemovingItemId(item.id);
        try {
            await removeRequisitionItem(requisition.id, item.id);
            await onChanged();
            setFeedback({ severity: "success", message: item.product.name + " foi removido do rascunho." });
        } catch (error: unknown) {
            setFeedback({ severity: "error", message: error instanceof Error ? error.message : "Não foi possível remover o item." });
        } finally {
            setRemovingItemId(null);
        }
    }

    function removeButton(item: RequisitionItem) {
        return <Button variant="link" type="button" className="shrink-0 text-xs text-feedback-error" disabled={removingItemId !== null} onClick={() => void handleRemove(item)} aria-label={"Remover " + item.product.name + " do rascunho"}>{removingItemId === item.id ? "Removendo…" : "Remover item"}</Button>;
    }

    function productInfo(item: RequisitionItem, compactImage = false) {
        const product = productDetails.products[item.product.id];
        return (
            <span className="flex min-w-0 items-center gap-3">
                <ProductImage name={item.product.name} photoUrl={product?.photoUrl} size={compactImage ? "compact" : undefined} />
                <span className="grid min-w-0 gap-1">
                    <strong className="wrap-anywhere font-semibold text-ink">{item.product.name}</strong>
                    {!compactImage && product?.category && <span className="text-xs text-history-muted">{product.category.name}</span>}
                </span>
            </span>
        );
    }

    const compactList = (
        <ul className="grid min-w-0 list-none gap-3 p-0">
            {items.map((item) => {
                const product = productDetails.products[item.product.id];
                return (
                    <li key={item.id} className="grid min-w-0 gap-2 rounded-2xl bg-history-card-header p-3">
                        <div className="flex min-w-0 items-start gap-3">
                            <ProductImage name={item.product.name} photoUrl={product?.photoUrl} size="compact" />
                            <div className="grid min-w-0 flex-1 gap-1"><strong className="wrap-anywhere text-ink">{item.product.name}</strong><span className="wrap-anywhere text-xs text-history-muted">{item.suggestedSupplier?.legalName ?? "Sem fornecedor sugerido"}</span></div>
                            {canEdit && <Button variant="link" type="button" className="shrink-0 text-xs text-feedback-error" disabled={removingItemId !== null} onClick={() => void handleRemove(item)} aria-label={"Remover " + item.product.name + " do rascunho"}>{removingItemId === item.id ? "Removendo…" : "Remover"}</Button>}
                        </div>
                        <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2 text-sm"><span className="text-history-muted">{item.quantity}{product?.unit.symbol ? " " + product.unit.symbol : ""}</span><ItemSubtotal item={item} /></div>
                    </li>
                );
            })}
        </ul>
    );

    return (
        <section className={"grid min-w-0 gap-4 " + (embedded ? "" : "rounded-3xl bg-surface p-4 shadow-history-card sm:p-6")} aria-labelledby="requisition-items-heading">
            {!compact && (
                <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                    <h3 id="requisition-items-heading" className="m-0 font-k2d text-lg font-bold text-ink">{heading}</h3>
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <span className="rounded-full bg-sidebar-active px-3 py-1 text-sm font-semibold text-heading">{items.length} {items.length === 1 ? "item" : "itens"}</span>
                        {addItemTo && <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand bg-surface px-4 py-2 font-semibold text-brand transition-colors hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={addItemTo}><span aria-hidden="true">⊕</span>Adicionar item</Link>}
                    </div>
                </header>
            )}
            {compact && <div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><h3 id="requisition-items-heading" className="m-0 font-k2d text-lg font-bold text-ink">{heading}</h3><span className="rounded-full bg-sidebar-active px-3 py-1 text-sm font-semibold text-heading">{items.length} {items.length === 1 ? "item" : "itens"}</span></div>}
            {productDetails.loading && <p role="status" aria-live="polite" className="sr-only">Carregando fotos e unidades dos itens…</p>}
            {items.length === 0 ? <p className="m-0 rounded-xl bg-history-card-header p-4 text-sm text-history-muted">Este rascunho ainda não tem itens.</p> : compact ? compactList : (
                <>
                    <ul className="grid min-w-0 list-none gap-3 p-0 lg:hidden">
                        {items.map((item) => {
                            const product = productDetails.products[item.product.id];
                            return (
                                <li key={item.id} className="grid min-w-0 gap-3 rounded-2xl border border-history-border bg-surface p-4">
                                    <div className="flex min-w-0 items-start gap-3">{productInfo(item, true)}{canEdit && removeButton(item)}</div>
                                    <dl className="grid min-w-0 grid-cols-2 gap-3 border-y border-history-border py-3 text-sm">
                                        <div className="grid min-w-0 gap-1"><dt className="text-xs text-history-muted">Quantidade</dt><dd className="m-0 wrap-anywhere font-semibold text-ink">{item.quantity}{product?.unit.symbol ? " " + product.unit.symbol : ""}</dd></div>
                                        <div className="grid min-w-0 gap-1"><dt className="text-xs text-history-muted">Estimativa</dt><dd className="m-0 wrap-anywhere"><ItemSubtotal item={item} /></dd></div>
                                        <div className="col-span-2 grid min-w-0 gap-1"><dt className="text-xs text-history-muted">Fornecedor sugerido</dt><dd className="m-0 wrap-anywhere text-ink">{item.suggestedSupplier?.legalName ?? "Sem fornecedor"}</dd></div>
                                    </dl>
                                    {item.note && <p className="m-0 rounded-xl bg-history-card-header p-3 text-sm leading-relaxed text-history-muted">{item.note}</p>}
                                </li>
                            );
                        })}
                    </ul>
                    <div className="hidden min-w-0 overflow-x-auto lg:block" role="region" aria-label="Tabela de itens da requisição. Use as setas horizontais para ver todas as colunas." tabIndex={0}>
                        <table className="w-full min-w-max border-separate border-spacing-0 text-left text-sm text-ink">
                            <caption className="sr-only">Produtos, quantidades, fornecedores sugeridos e estimativas</caption>
                            <thead className="bg-history-card-header text-xs text-history-muted">
                                <tr><th className="px-3 py-3 font-semibold" scope="col">Produto</th><th className="px-3 py-3 font-semibold" scope="col">Quantidade</th><th className="px-3 py-3 font-semibold" scope="col">Fornecedor sugerido</th><th className="px-3 py-3 font-semibold" scope="col">Preço estimado / un.</th><th className="px-3 py-3 text-right font-semibold" scope="col">Estimativa</th></tr>
                            </thead>
                            <tbody className="divide-y divide-history-border">
                                {items.map((item) => {
                                    const product = productDetails.products[item.product.id];
                                    return (
                                        <Fragment key={item.id}>
                                            <tr>
                                                <th className="min-w-56 px-3 py-4 text-left font-normal" scope="row">{productInfo(item)}</th>
                                                <td className="whitespace-nowrap px-3 py-4">{item.quantity}{product?.unit.symbol ? " " + product.unit.symbol : ""}</td>
                                                <td className="max-w-56 px-3 py-4 wrap-anywhere text-history-muted">{item.suggestedSupplier?.legalName ?? "Sem fornecedor"}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-history-muted">{item.estimatedPrice === null ? "Não informado" : formatRequisitionCurrency(item.estimatedPrice) + (product?.unit.symbol ? " / " + product.unit.symbol : "")}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right font-semibold text-brand"><ItemSubtotal item={item} /></td>
                                            </tr>
                                            {(item.note || canEdit) && <tr><td colSpan={5} className="px-3 pb-3"><div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl bg-history-card-header px-3 py-2 text-sm"><span className="min-w-0 wrap-anywhere text-history-muted">{item.note || "Sem observação para este item."}</span>{canEdit && removeButton(item)}</div></td></tr>}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                            <tfoot className="border-t border-history-border">
                                <tr><td colSpan={4} className="px-3 py-4 font-semibold text-history-muted">{items.length} {items.length === 1 ? "item" : "itens"} · estimativa da requisição</td><td className="whitespace-nowrap px-3 py-4 text-right font-k2d text-xl font-bold text-brand">{total}</td></tr>
                            </tfoot>
                        </table>
                    </div>
                    <div className="grid gap-1 border-t border-history-border pt-4 lg:hidden"><span className="text-sm text-history-muted">Estimativa da requisição</span><strong className="wrap-anywhere font-k2d text-2xl font-bold text-brand">{total}</strong><span className="text-xs leading-relaxed text-history-muted">Valor previsto; não representa pagamento.</span></div>
                </>
            )}
            {compact && items.length > 0 && <div className="grid gap-1 border-t border-history-border pt-4"><span className="text-sm text-history-muted">Estimativa da requisição</span><strong className="wrap-anywhere font-k2d text-2xl font-bold text-brand">{total}</strong><span className="text-xs leading-relaxed text-history-muted">Valor previsto; não representa pagamento.</span></div>}
            {feedback && <Feedback severity={feedback.severity}>{feedback.message}</Feedback>}
        </section>
    );
}
