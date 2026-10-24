import { useId, useState, type FormEvent } from "react";
import type { ApiKitchen } from "../../../types/auth";
import type { ProductKitchenParameters, ProductRecord } from "../../../types/products";
import { ApiError } from "../../../services/api";
import { getProductKitchenParameters, setKitchenParameters } from "../../../services/products";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";

interface ProductKitchenPanelProps {
    product: ProductRecord;
    kitchen: ApiKitchen | null;
    parameters: ProductKitchenParameters | null;
    onParametersChange: (parameters: ProductKitchenParameters[]) => void;
}

interface KitchenFormValues { minStock: string; maxStock: string; averageDailyConsumption: string }
interface KitchenFormErrors { minStock?: string; maxStock?: string; averageDailyConsumption?: string }

function numberValue(value: number | null | undefined): string {
    return value === null || value === undefined ? "" : String(value);
}

function parseOptionalAmount(value: string): number | null {
    if (!value.trim()) return null;
    return Number(value.replace(",", "."));
}

function validateAmount(value: string): boolean {
    return !value || /^\d{1,9}(?:[.,]\d{1,3})?$/.test(value.trim());
}

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    return "Não foi possível salvar os parâmetros da cozinha.";
}

function ProductKitchenPanel({ product, kitchen, parameters, onParametersChange }: ProductKitchenPanelProps) {
    const id = useId();
    const [values, setValues] = useState<KitchenFormValues>({
        minStock: numberValue(parameters?.minStock ?? 0),
        maxStock: numberValue(parameters?.maxStock),
        averageDailyConsumption: numberValue(parameters?.averageDailyConsumption),
    });
    const [errors, setErrors] = useState<KitchenFormErrors>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    function updateValue(field: keyof KitchenFormValues, value: string) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!kitchen) return;
        const nextErrors: KitchenFormErrors = {};
        if (!validateAmount(values.minStock)) nextErrors.minStock = "Use até 9 algarismos inteiros e 3 casas decimais.";
        if (!validateAmount(values.maxStock)) nextErrors.maxStock = "Use até 9 algarismos inteiros e 3 casas decimais.";
        if (!validateAmount(values.averageDailyConsumption)) nextErrors.averageDailyConsumption = "Use até 9 algarismos inteiros e 3 casas decimais.";
        const minimum = parseOptionalAmount(values.minStock) ?? 0;
        const maximum = parseOptionalAmount(values.maxStock);
        if (maximum !== null && maximum < minimum) nextErrors.maxStock = "O estoque máximo não pode ser menor que o estoque mínimo.";
        setErrors(nextErrors);
        const firstInvalid = Object.keys(nextErrors)[0];
        if (firstInvalid) { document.getElementById(`${id}-${firstInvalid}`)?.focus(); return; }

        setSaving(true);
        setError(null);
        setNotice(null);
        try {
            await setKitchenParameters(product.id, {
                kitchenId: kitchen.id,
                minStock: minimum,
                maxStock: maximum,
                averageDailyConsumption: parseOptionalAmount(values.averageDailyConsumption),
            });
            const refreshed = await getProductKitchenParameters(product.id);
            onParametersChange(refreshed);
            const updated = refreshed.find((entry) => entry.kitchen.id === kitchen.id);
            setValues({
                minStock: numberValue(updated?.minStock ?? 0),
                maxStock: numberValue(updated?.maxStock),
                averageDailyConsumption: numberValue(updated?.averageDailyConsumption),
            });
            setNotice("Parâmetros da cozinha atualizados.");
        } catch (saveError: unknown) {
            setError(getErrorMessage(saveError));
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7" aria-labelledby={`${id}-titulo`}>
            <div><h2 id={`${id}-titulo`} className="font-k2d text-lg font-bold text-sidebar-text">Parâmetros da cozinha</h2><p className="mt-1 text-sm leading-relaxed text-history-muted">Limites de estoque e consumo médio informados para a cozinha vinculada.</p></div>
            {!kitchen ? <p className="rounded-xl bg-history-card-header p-4 text-sm leading-relaxed text-history-muted">Esta conta ainda não está vinculada a uma cozinha. Os parâmetros aparecem quando houver uma cozinha associada.</p> : <>
                <p className="rounded-xl bg-sidebar-active px-3 py-2 text-sm font-semibold text-sidebar-purple">{kitchen.name}</p>
                {parameters ? <>
                    <dl className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-history-card-header p-3"><dt className="text-xs text-history-muted">Estoque mínimo</dt><dd className="mt-1 font-bold text-sidebar-text">{numberValue(parameters.minStock) || "0"} {product.unit.symbol}</dd></div><div className="rounded-xl bg-history-card-header p-3"><dt className="text-xs text-history-muted">Estoque máximo</dt><dd className="mt-1 font-bold text-sidebar-text">{numberValue(parameters.maxStock) || "Não informado"}{parameters.maxStock !== null && ` ${product.unit.symbol}`}</dd></div><div className="rounded-xl bg-history-card-header p-3"><dt className="text-xs text-history-muted">Consumo médio diário</dt><dd className="mt-1 font-bold text-sidebar-text">{numberValue(parameters.averageDailyConsumption) || "Não informado"}{parameters.averageDailyConsumption !== null && ` ${product.unit.symbol}/dia`}</dd></div><div className="rounded-xl bg-history-card-header p-3"><dt className="text-xs text-history-muted">Quantidade atual</dt><dd className="mt-1 font-bold text-sidebar-text">{numberValue(parameters.currentQuantity)} {product.unit.symbol}</dd></div></dl>
                    <div className={`rounded-xl border border-history-border border-l-4 bg-history-card-header p-3 ${parameters.lowStock ? "border-l-feedback-error" : parameters.overStock ? "border-l-feedback-info" : "border-l-feedback-success"}`}>
                        <p className={`text-sm font-bold ${parameters.lowStock ? "text-feedback-error" : parameters.overStock ? "text-feedback-info" : "text-feedback-success"}`}>
                            {parameters.lowStock ? "Abaixo do estoque mínimo" : parameters.overStock ? "Acima do estoque máximo" : "Dentro dos parâmetros"}
                        </p>
                        <p className="mt-1 text-sm text-history-muted">
                            {parameters.estimatedDaysUntilStockout === null ? "Previsão de duração indisponível." : `Estimativa de ${parameters.estimatedDaysUntilStockout} dias de estoque.`}
                        </p>
                    </div>
                </> : <p className="rounded-xl bg-history-card-header p-4 text-sm leading-relaxed text-history-muted">Ainda não há parâmetros registrados. Ao salvar, a API inicia o estoque mínimo em zero se o campo ficar vazio.</p>}

                <form className="flex min-w-0 flex-col gap-3 border-t border-history-border pt-4" onSubmit={(event) => void submit(event)} noValidate>
                    <h3 className="font-k2d text-base font-bold text-sidebar-text">Configurar limites</h3>
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                        <div className="min-w-0"><label className="mb-1 block text-sm font-semibold text-sidebar-text" htmlFor={`${id}-minStock`}>Estoque mínimo ({product.unit.symbol})</label><Input id={`${id}-minStock`} variant="text" type="number" min="0" max="999999999.999" step="0.001" inputMode="decimal" value={values.minStock} aria-invalid={Boolean(errors.minStock)} aria-describedby={errors.minStock ? `${id}-minStock-erro` : `${id}-minStock-ajuda`} onChange={(event) => updateValue("minStock", event.target.value)} /><p className="mt-1 text-xs text-history-muted" id={`${id}-minStock-ajuda`}>Mínimo zero; até 3 casas decimais.</p>{errors.minStock && <p className="mt-1 text-sm text-feedback-error" id={`${id}-minStock-erro`} role="alert">{errors.minStock}</p>}</div>
                        <div className="min-w-0"><label className="mb-1 block text-sm font-semibold text-sidebar-text" htmlFor={`${id}-maxStock`}>Estoque máximo ({product.unit.symbol})</label><Input id={`${id}-maxStock`} variant="text" type="number" min="0" max="999999999.999" step="0.001" inputMode="decimal" value={values.maxStock} aria-invalid={Boolean(errors.maxStock)} aria-describedby={errors.maxStock ? `${id}-maxStock-erro` : `${id}-maxStock-ajuda`} onChange={(event) => updateValue("maxStock", event.target.value)} /><p className="mt-1 text-xs text-history-muted" id={`${id}-maxStock-ajuda`}>Opcional; não pode ser menor que o mínimo.</p>{errors.maxStock && <p className="mt-1 text-sm text-feedback-error" id={`${id}-maxStock-erro`} role="alert">{errors.maxStock}</p>}</div>
                        <div className="min-w-0 sm:col-span-2"><label className="mb-1 block text-sm font-semibold text-sidebar-text" htmlFor={`${id}-averageDailyConsumption`}>Consumo médio diário ({product.unit.symbol}/dia)</label><Input id={`${id}-averageDailyConsumption`} variant="text" type="number" min="0" max="999999999.999" step="0.001" inputMode="decimal" value={values.averageDailyConsumption} aria-invalid={Boolean(errors.averageDailyConsumption)} aria-describedby={errors.averageDailyConsumption ? `${id}-average-erro` : `${id}-average-ajuda`} onChange={(event) => updateValue("averageDailyConsumption", event.target.value)} /><p className="mt-1 text-xs text-history-muted" id={`${id}-average-ajuda`}>Opcional. A previsão de dias é calculada pelo servidor.</p>{errors.averageDailyConsumption && <p className="mt-1 text-sm text-feedback-error" id={`${id}-average-erro`} role="alert">{errors.averageDailyConsumption}</p>}</div>
                    </div>
                    {error && <Feedback severity="error">{error}</Feedback>}{notice && <Feedback severity="success">{notice}</Feedback>}
                    <Button variant="primary" className="min-h-10 w-full rounded-xl px-4 py-2 text-sm" type="submit" disabled={saving}>{saving ? "Salvando parâmetros…" : "Salvar parâmetros"}</Button>
                </form>
            </>}
        </section>
    );
}

export default ProductKitchenPanel;
