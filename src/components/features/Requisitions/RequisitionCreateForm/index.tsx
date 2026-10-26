import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../ui/Button";
import Feedback from "../../../ui/Feedback";
import Input from "../../../ui/Input";
import RequisitionTypeSelector from "../RequisitionTypeSelector";
import { createRequisition } from "../../../../services/requisitions";
import type { CreateRequisitionInput, RequisitionType } from "../../../../types/requisitions";
import { validateCreateRequisition } from "../../../../utils/requisitionValidation";

interface RequisitionCreateFormProps {
    kitchenId: number | null;
    kitchenName: string | null;
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
            navigate(`/requisicoes/${requisition.id}`, { state: { created: true } });
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

    return (
        <section className="grid min-w-0 gap-5" aria-labelledby="create-requisition-heading">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
                <div className="min-w-0"><h2 id="create-requisition-heading" className="font-k2d text-2xl font-bold text-ink">Nova requisição</h2><p className="text-sm text-history-muted">Escolha o tipo e informe o contexto para criar um rascunho.</p></div>
                <Button variant="link" type="button" onClick={() => navigate("/requisicoes")}>← Voltar à lista</Button>
            </div>
            <form className="grid min-w-0 gap-5 rounded-3xl bg-surface p-4 shadow-history-card sm:p-6" noValidate onSubmit={handleSubmit}>
                <RequisitionTypeSelector value={form.type} onChange={changeType} />
                <div className="grid min-w-0 gap-3 rounded-2xl bg-history-card-header p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                    <span className="text-xs font-bold uppercase tracking-wide text-brand">Cozinha atual</span>
                    <span className="min-w-0 wrap-anywhere font-semibold text-ink">{kitchenName ?? "Nenhuma cozinha vinculada"}</span>
                </div>
                <div className="grid min-w-0 gap-2">
                    <label htmlFor="requisition-origin" className="font-semibold text-ink">Origem ou destino <span aria-hidden="true">*</span></label>
                    <p id="requisition-origin-help" className="text-sm leading-relaxed text-history-muted">Para transferência, informe o destino. Nos demais tipos, descreva a origem ou o contexto da solicitação. Limite de 20 caracteres.</p>
                    <Input
                        id="requisition-origin"
                        name="origin"
                        type="text"
                        value={form.origin}
                        maxLength={20}
                        required
                        autoComplete="off"
                        variant="text"
                        placeholder={form.type === "TRANSFER" ? "Ex.: Unidade central" : "Ex.: Refeitório"}
                        aria-invalid={originError ? true : undefined}
                        aria-describedby={originError ? "requisition-origin-help requisition-origin-error" : "requisition-origin-help"}
                        onChange={(event) => handleOriginChange(event.target.value)}
                    />
                    {originError && <p id="requisition-origin-error" className="text-sm text-feedback-error">{originError}</p>}
                </div>
                {feedback && <Feedback severity="error">{feedback}</Feedback>}
                {kitchenId === null && <Feedback severity="info">É necessário vincular uma cozinha antes de iniciar uma requisição.</Feedback>}
                <div className="flex min-w-0 flex-wrap justify-end gap-3 border-t border-history-border pt-4">
                    <Button variant="link" type="button" onClick={() => navigate("/requisicoes")}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={submitting || kitchenId === null} aria-busy={submitting} className="min-h-11 rounded-xl px-5">{submitting ? "Criando rascunho…" : "Criar rascunho"}</Button>
                </div>
            </form>
        </section>
    );
}
