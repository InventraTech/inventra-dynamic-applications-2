import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "../../../services/api";
import { createKitchen } from "../../../services/kitchenService";
import { updateSessionKitchen } from "../../../services/authSession";
import { validateKitchenSetup, type KitchenSetupErrors, type KitchenSetupValues } from "../../../utils/validateKitchenSetup";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

interface KitchenFormFieldProps {
    id: string;
    label: string;
}

function KitchenFormField({ id, label }: KitchenFormFieldProps) {
    return (
        <label className="text-login-label font-bold leading-tight text-login-brand-start" htmlFor={id}>
            {label}
        </label>
    );
}

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;
    return <p className="text-sm leading-snug text-login-error" id={id} role="alert">{message}</p>;
}

function getRequestError(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Tente novamente em instantes.";
    return error instanceof Error ? error.message : "Não foi possível criar a cozinha. Tente novamente.";
}

function KitchenSetupForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState<KitchenSetupValues>({ name: "", address: "" });
    const [fieldErrors, setFieldErrors] = useState<KitchenSetupErrors>({});
    const [requestError, setRequestError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function updateField(field: keyof KitchenSetupValues, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
        setRequestError(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validation = validateKitchenSetup(form);
        setFieldErrors(validation.errors);
        setRequestError(null);
        if (!validation.request) return;

        setIsSubmitting(true);
        try {
            const kitchen = await createKitchen(validation.request);
            const session = updateSessionKitchen({ id: kitchen.id, name: kitchen.name });
            if (!session) {
                navigate("/login", { replace: true });
                return;
            }
            navigate("/historico", { replace: true });
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                navigate("/login", { replace: true });
                return;
            }
            setRequestError(getRequestError(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section
            className="relative flex min-h-screen min-w-0 flex-1 items-center justify-center overflow-x-hidden overflow-y-auto bg-white max-lg:min-h-0 max-lg:flex-none max-lg:flex-col max-lg:items-stretch max-lg:justify-start max-lg:overflow-visible max-lg:px-6 max-lg:pb-login-mobile-form-bottom max-lg:pt-login-mobile-form-top"
            aria-label="Criar cozinha"
        >
            <div className="relative z-2 w-login-form-width max-w-login-form-max max-lg:w-full max-lg:max-w-xl">
                <form className="flex flex-col gap-login-form-gap max-lg:gap-4" onSubmit={handleSubmit} noValidate>
                    <header className="contents">
                        <p className="inline-flex w-fit shrink-0 items-center rounded-full bg-[#efe7fe] px-2.5 py-1 text-login-message font-bold leading-tight text-login-brand-end">
                            Etapa 2 de 2
                        </p>
                        <h1 className="text-login-form-title font-bold leading-tight text-login-brand-start">Agora, a sua cozinha</h1>
                        <p className="text-login-form-copy leading-snug text-login-muted">
                            Como supervisor, você cria a cozinha e convida o seu time.
                        </p>
                    </header>

                    <div className="flex min-w-0 flex-col gap-login-field-gap">
                        <KitchenFormField id="register-kitchen-name" label="Nome da cozinha" />
                        <Input
                            id="register-kitchen-name"
                            name="name"
                            autoComplete="organization"
                            placeholder="Ex.: Cozinha Escola Germinare"
                            required
                            maxLength={120}
                            value={form.name}
                            onChange={(event) => updateField("name", event.target.value)}
                            aria-invalid={Boolean(fieldErrors.name)}
                            aria-describedby={fieldErrors.name ? "register-kitchen-name-error" : undefined}
                        />
                        <FieldError id="register-kitchen-name-error" message={fieldErrors.name} />
                    </div>

                    <div className="flex min-w-0 flex-col gap-login-field-gap">
                        <KitchenFormField id="register-kitchen-address" label="Endereço" />
                        <Input
                            id="register-kitchen-address"
                            name="address"
                            autoComplete="street-address"
                            placeholder="Rua, número, bairro e cidade"
                            maxLength={255}
                            value={form.address}
                            onChange={(event) => updateField("address", event.target.value)}
                            aria-invalid={Boolean(fieldErrors.address)}
                            aria-describedby={fieldErrors.address ? "register-kitchen-address-error" : "register-kitchen-address-help"}
                        />
                        <span className="text-login-message leading-snug text-login-muted" id="register-kitchen-address-help">
                            Você fica vinculado a ela automaticamente como supervisor.
                        </span>
                        <FieldError id="register-kitchen-address-error" message={fieldErrors.address} />
                    </div>

                    {requestError && <p className="text-sm leading-snug text-login-error" role="alert">{requestError}</p>}
                    {isSubmitting && <p className="sr-only" role="status" aria-live="polite">Criando sua cozinha…</p>}

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Criando cozinha…" : "Criar cozinha"}
                    </Button>

                    <p className="flex flex-wrap items-center justify-center gap-login-access-gap text-center text-login-access text-login-muted">
                        Quer fazer isso depois?{" "}
                        <Button
                            variant="link"
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => navigate("/historico", { replace: true })}
                        >
                            Pular por enquanto
                        </Button>
                    </p>
                </form>
            </div>
            <footer className="absolute inset-x-0 bottom-[0.926%] text-center text-login-footer text-login-footer-copy/80 max-lg:static max-lg:mt-8 max-lg:text-login-mobile-footer">
                Inventra · Versão 1.0.0
            </footer>
        </section>
    );
}

export default KitchenSetupForm;
