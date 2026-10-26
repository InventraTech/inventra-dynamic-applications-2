import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";
import RequisitionTypeSelector from "./RequisitionTypeSelector";
import { createRequisition } from "../../../services/requisitions";
import type { CreateRequisitionInput, RequisitionType } from "../../../types/requisitions";
import { validateCreateRequisition } from "../../../utils/requisitionValidation";
import Breadcrumb from "../../ui/Breadcrumb";

interface RequisitionCreateFormProps {
    kitchenId: number | null;
    kitchenName: string | null;
}

function getNextStep(type: RequisitionType) {
    if (type === "PURCHASE") return "Depois, selecione produtos da cozinha e, se quiser, informe fornecedores e preços estimados.";
    if (type === "CONSUMPTION") return "Depois, selecione os produtos e quantidades que serão consumidos nesta cozinha.";
    return "Depois, adicione os produtos e quantidades. A baixa será registrada na cozinha atual.";
}

export default function RequisitionCreateForm({ kitchenId, kitchenName }: RequisitionCreateFormProps) {
    const [form, setForm] = useState<CreateRequisitionInput>({ type: "PURCHASE", origin: "", kitchenId: kitchenId ?? 0 });
    const [originError, setOriginError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    function changeType(type: RequisitionType) {
        setForm((current) => ({ ...current, type }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFeedback(null);
        const validation = validateCreateRequisition({ ...form, kitchenId: kitchenId ?? 0 });
        setOriginError(validation.errors.origin ?? null);
        if (!kitchenId) {
            setFeedback("Sua conta ainda não está vinculada a uma cozinha.");
            return;
        }
        if (Object.keys(validation.errors).length > 0) return;

        setSubmitting(true);
        try {
            const requisition = await createRequisition(validation.value);
            navigate("/requisicoes/" + requisition.id + "/editar", { state: { created: true } });
        } catch (error: unknown) {
            setFeedback(error instanceof Error ? error.message : "Não foi possível criar o rascunho. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    }

    function handleOriginChange(origin: string) {
        setForm((current) => ({ ...current, origin }));
        if (originError) setOriginError(null);
    }

    const originLabel = form.type === "TRANSFER" ? "Destino da transferência" : form.type === "CONSUMPTION" ? "Destino do consumo" : "Contexto da compra";
    const originPlaceholder = form.type === "TRANSFER" ? "Ex.: Unidade central" : form.type === "CONSUMPTION" ? "Ex.: Refeitório" : "Ex.: Reposição da semana";

    return (
        <section className="grid min-w-0 gap-4" aria-labelledby="create-requisition-heading">
            <Breadcrumb items={[{ label: "Requisições", href: "/requisicoes" }, { label: "Nova requisição" }]} backHref="/requisicoes" backLabel="Voltar para requisições" />
            <header className="grid min-w-0 gap-1">
                <h2 id="create-requisition-heading" className="m-0 font-k2d text-2xl font-bold text-ink sm:text-3xl">Nova requisição</h2>
                <p className="m-0 text-sm leading-relaxed text-history-muted">Escolha o tipo e informe o contexto. O rascunho será criado antes da inclusão dos itens.</p>
            </header>

            <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <form className="grid min-w-0 gap-5 rounded-3xl border border-history-border bg-surface p-4 shadow-history-card sm:p-6 xl:p-7" noValidate onSubmit={handleSubmit}>
                    <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sidebar-active text-brand" aria-hidden="true">1</span>
                        <div className="grid min-w-0 gap-0.5"><h3 className="m-0 font-k2d text-lg font-bold text-ink">Dados da requisição</h3><p className="m-0 text-sm text-history-muted">Defina como os produtos serão movimentados.</p></div>
                    </div>
                    <RequisitionTypeSelector value={form.type} onChange={changeType} />

                    <div className="grid min-w-0 gap-3 rounded-2xl bg-history-card-header p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:px-5">
                        <span className="w-fit rounded-full bg-sidebar-active px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand">Cozinha atual</span>
                        <span className="min-w-0 wrap-anywhere font-semibold text-ink">{kitchenName ?? "Nenhuma cozinha vinculada"}</span>
                    </div>

                    <div className="grid min-w-0 gap-2">
                        <label htmlFor="requisition-origin" className="font-semibold text-ink">{originLabel} <span aria-hidden="true">*</span></label>
                        <p id="requisition-origin-help" className="m-0 text-sm leading-relaxed text-history-muted">Informe até 20 caracteres para identificar o destino ou contexto da requisição.</p>
                        <Input
                            id="requisition-origin"
                            name="origin"
                            type="text"
                            value={form.origin}
                            maxLength={20}
                            required
                            autoComplete="off"
                            variant="text"
                            placeholder={originPlaceholder}
                            aria-invalid={originError ? true : undefined}
                            aria-describedby={originError ? "requisition-origin-help requisition-origin-error" : "requisition-origin-help"}
                            onChange={(event) => handleOriginChange(event.target.value)}
                        />
                        {originError && <p id="requisition-origin-error" className="m-0 text-sm text-feedback-error">{originError}</p>}
                    </div>
                    {feedback && <Feedback severity="error">{feedback}</Feedback>}
                    {kitchenId === null && <Feedback severity="info">É necessário vincular uma cozinha antes de iniciar uma requisição.</Feedback>}
                    <div className="flex min-w-0 flex-wrap justify-end gap-3 border-t border-history-border pt-4">
                        <Button variant="link" type="button" onClick={() => navigate("/requisicoes")}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={submitting || kitchenId === null} aria-busy={submitting} className="min-h-11 w-full rounded-xl px-5 sm:w-auto">{submitting ? "Criando rascunho…" : "Criar rascunho e continuar"}</Button>
                    </div>
                </form>

                <aside className="grid min-w-0 gap-4 xl:sticky xl:top-24">
                    <section className="grid min-w-0 gap-3 rounded-3xl border border-history-border bg-surface p-5 shadow-history-card" aria-labelledby="requisition-next-step-heading">
                        <h3 id="requisition-next-step-heading" className="m-0 font-k2d text-lg font-bold text-ink">Próxima etapa</h3>
                        <span className="w-fit rounded-full bg-sidebar-active px-3 py-1 text-xs font-semibold text-brand">Rascunho</span>
                        <p className="m-0 text-sm leading-relaxed text-history-muted">{getNextStep(form.type)}</p>
                    </section>
                    <div className="grid gap-1 rounded-2xl bg-linear-to-r from-brand-strong to-brand p-5 text-on-brand">
                        <strong className="font-k2d">A requisição começa na sua cozinha</strong>
                        <p className="m-0 text-sm leading-relaxed">Os produtos disponíveis serão limitados aos que estão vinculados à cozinha atual.</p>
                    </div>
                </aside>
            </div>
        </section>
    );
}
