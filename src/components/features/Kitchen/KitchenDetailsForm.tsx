import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import kitchenIcon from "../../../assets/icons/cozinha.svg";
import infoIcon from "../../../assets/icons/info.svg";
import type { KitchenFormErrors, KitchenFormValues, KitchenResponse, UpdateKitchenRequest } from "../../../types/kitchen";
import { focusFirstInvalidField } from "../../../utils/formAccessibility";
import { validateKitchenSettings } from "../../../utils/validateKitchenSettings";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";
import KitchenSectionHeading from "./KitchenSectionHeading";

interface KitchenDetailsFormProps {
    kitchen: KitchenResponse;
    canEdit: boolean;
    saving: boolean;
    error: string | null;
    success: string | null;
    onSave: (request: UpdateKitchenRequest) => Promise<boolean>;
    onClearFeedback: () => void;
}

interface KitchenFormFieldProps {
    id: string;
    label: string;
    help: string;
    error?: string;
    children: ReactNode;
}

function KitchenFormField({ id, label, help, error, children }: KitchenFormFieldProps) {
    const helpId = `${id}-help`;
    const errorId = `${id}-error`;

    return (
        <div className="grid min-w-0 content-start gap-2">
            <label className="font-k2d text-sm font-bold text-ink sm:text-base" htmlFor={id}>{label}</label>
            {children}
            <span id={helpId} className="text-sm leading-relaxed text-history-muted">{help}</span>
            {error && <Feedback id={errorId} severity="error">{error}</Feedback>}
        </div>
    );
}

function getKitchenFormValues(kitchen: KitchenResponse): KitchenFormValues {
    return {
        name: kitchen.name,
        address: kitchen.address ?? "",
        city: kitchen.city ?? "",
        state: kitchen.state ?? "",
    };
}

function KitchenDetailsForm({ kitchen, canEdit, saving, error, success, onSave, onClearFeedback }: KitchenDetailsFormProps) {
    const [form, setForm] = useState<KitchenFormValues>(() => getKitchenFormValues(kitchen));
    const [fieldErrors, setFieldErrors] = useState<KitchenFormErrors>({});
    const originalValues = getKitchenFormValues(kitchen);
    const dirty = Object.keys(originalValues).some((field) => form[field as keyof KitchenFormValues] !== originalValues[field as keyof KitchenFormValues]);

    useEffect(() => {
        setForm(getKitchenFormValues(kitchen));
        setFieldErrors({});
    }, [kitchen.name, kitchen.address, kitchen.city, kitchen.state]);

    function updateField(field: keyof KitchenFormValues, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
        onClearFeedback();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canEdit || saving) return;

        const validation = validateKitchenSettings(form);
        setFieldErrors(validation.errors);
        if (!validation.request) {
            focusFirstInvalidField(event.currentTarget);
            return;
        }

        await onSave(validation.request);
    }

    function discardChanges() {
        setForm(originalValues);
        setFieldErrors({});
        onClearFeedback();
    }

    return (
        <section className="min-w-0 rounded-4xl bg-surface p-5 shadow-history-card sm:p-8">
            <form className="grid min-w-0 gap-7" onSubmit={(event) => void handleSubmit(event)} noValidate aria-busy={saving}>
                <KitchenSectionHeading
                    icon={kitchenIcon}
                    title="Dados da cozinha"
                    description="É assim que a cozinha aparece para quem entra no time."
                />

                <div className="grid min-w-0 gap-5">
                    <KitchenFormField id="kitchen-name" label="Nome da cozinha" help="Até 120 caracteres. Não pode ficar vazio." error={fieldErrors.name}>
                        <Input
                            id="kitchen-name"
                            name="name"
                            autoComplete="organization"
                            maxLength={120}
                            required
                            readOnly={!canEdit}
                            value={form.name}
                            onChange={(event) => updateField("name", event.target.value)}
                            aria-invalid={Boolean(fieldErrors.name)}
                            aria-describedby={`kitchen-name-help${fieldErrors.name ? " kitchen-name-error" : ""}`}
                        />
                    </KitchenFormField>

                    <KitchenFormField id="kitchen-address" label="Endereço" help="Até 255 caracteres. Apague tudo para limpar o endereço." error={fieldErrors.address}>
                        <Input
                            id="kitchen-address"
                            name="address"
                            autoComplete="street-address"
                            maxLength={255}
                            readOnly={!canEdit}
                            value={form.address}
                            onChange={(event) => updateField("address", event.target.value)}
                            aria-invalid={Boolean(fieldErrors.address)}
                            aria-describedby={`kitchen-address-help${fieldErrors.address ? " kitchen-address-error" : ""}`}
                        />
                    </KitchenFormField>

                    <div className="grid min-w-0 gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,0.22fr)] large-text:grid-cols-1">
                        <KitchenFormField id="kitchen-city" label="Cidade" help="Até 120 caracteres." error={fieldErrors.city}>
                            <Input
                                id="kitchen-city"
                                name="city"
                                autoComplete="address-level2"
                                maxLength={120}
                                readOnly={!canEdit}
                                value={form.city}
                                onChange={(event) => updateField("city", event.target.value)}
                                aria-invalid={Boolean(fieldErrors.city)}
                                aria-describedby={`kitchen-city-help${fieldErrors.city ? " kitchen-city-error" : ""}`}
                            />
                        </KitchenFormField>

                        <KitchenFormField id="kitchen-state" label="Estado (UF)" help="Duas letras." error={fieldErrors.state}>
                            <Input
                                id="kitchen-state"
                                name="state"
                                autoComplete="address-level1"
                                maxLength={2}
                                required
                                readOnly={!canEdit}
                                value={form.state}
                                onChange={(event) => updateField("state", event.target.value)}
                                aria-invalid={Boolean(fieldErrors.state)}
                                aria-describedby={`kitchen-state-help${fieldErrors.state ? " kitchen-state-error" : ""}`}
                            />
                        </KitchenFormField>
                    </div>
                </div>

                <Feedback severity="info" className="items-center">
                    <span className="inline-flex min-w-0 items-start gap-2">
                        <img src={infoIcon} alt="" aria-hidden="true" className="mt-0.5 shrink-0" />
                        <span>Se o endereço mudar, o Inventra recalcula a localização em segundo plano. A nova posição pode levar alguns instantes para aparecer.</span>
                    </span>
                </Feedback>

                {error && <Feedback severity="error">{error}</Feedback>}
                {success && <Feedback severity="success">{success}</Feedback>}
                {saving && <p className="sr-only" role="status" aria-live="polite">Salvando os dados da cozinha…</p>}

                <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 border-t border-history-border pt-5">
                    <p className="m-0 min-w-0 flex-1 text-sm leading-relaxed text-history-muted">
                        {canEdit ? "Mudou algo? Só supervisor salva. Quem é do time só consulta." : "Os dados da cozinha ficam disponíveis para consulta da equipe."}
                    </p>
                    {canEdit && (
                        <div className="flex min-w-0 flex-wrap justify-end gap-3">
                            <Button variant="outline" type="button" disabled={!dirty || saving} onClick={discardChanges}>
                                Descartar
                            </Button>
                            <Button variant="standard" type="submit" disabled={!dirty || saving}>
                                {saving ? "Salvando…" : "Salvar dados"}
                            </Button>
                        </div>
                    )}
                </div>
            </form>
        </section>
    );
}

export default KitchenDetailsForm;
