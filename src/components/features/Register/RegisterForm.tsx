import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { inventraIcons } from "../../../assets/icons/inventra-v2";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { ApiError } from "../../../services/api";
import { register } from "../../../services/authService";
import { saveSession } from "../../../services/authSession";
import {
    validateRegistration,
    type RegistrationErrors,
    type RegistrationFormValues,
} from "../../../utils/validateRegistration";

interface RegistrationFormState extends RegistrationFormValues {
    acceptedTerms: boolean;
}

const INITIAL_FORM: RegistrationFormState = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessType: "SUPERVISOR",
    acceptedTerms: false,
};

interface RegistrationFieldProps {
    id: string;
    label: string;
}

function RegistrationField({ id, label }: RegistrationFieldProps) {
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

function EyeIcon({ visible }: { visible: boolean }) {
    return (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="2.6" />
            {!visible && <path d="m4 4 16 16" strokeLinecap="round" />}
        </svg>
    );
}

function getPasswordStrength(password: string): number {
    if (password.length < 8) return 0;

    const variety = [/[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^a-zA-Z0-9]/.test(password)]
        .filter(Boolean).length;
    const lengthScore = password.length >= 28 ? 3 : password.length >= 20 ? 2 : password.length >= 12 ? 1 : 0;

    return Math.min(4, 1 + lengthScore + (variety >= 3 ? 1 : 0));
}

function PasswordStrength({ password }: { password: string }) {
    const strength = getPasswordStrength(password);

    return (
        <div className="flex flex-col gap-login-field-gap" id="register-password-help" aria-live="polite">
            <div className="flex gap-login-field-gap" aria-hidden="true">
                {[0, 1, 2, 3].map((segment) => (
                    <span
                        className={`h-1.5 flex-1 rounded-full ${segment < strength ? "bg-[#0d8302]" : "bg-[#e4def0]"}`}
                        key={segment}
                    />
                ))}
            </div>
            <p className="text-login-message leading-snug text-login-muted">
                Use de 8 a 100 caracteres. Quanto mais longa, mais forte.
            </p>
        </div>
    );
}

function PasswordInput({
    id,
    name,
    label,
    value,
    visible,
    onChange,
    onToggleVisibility,
    error,
    showStrength = false,
}: {
    id: string;
    name: string;
    label: string;
    value: string;
    visible: boolean;
    onChange: (value: string) => void;
    onToggleVisibility: () => void;
    error?: string;
    showStrength?: boolean;
}) {
    const errorId = `${id}-error`;
    const helpId = showStrength ? "register-password-help" : `${id}-help`;
    const describedBy = [helpId, error ? errorId : ""].filter(Boolean).join(" ");

    return (
        <div className="flex min-w-0 flex-col gap-login-field-gap">
            <RegistrationField id={id} label={label} />
            <div className="relative min-w-0">
                <Input
                    className="pr-12"
                    id={id}
                    name={name}
                    type={visible ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={100}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                />
                <Button
                    className="absolute right-3 top-1/2 size-9 -translate-y-1/2 !p-0 text-login-brand-end"
                    variant="icon"
                    type="button"
                    aria-label={visible ? `Ocultar ${label.toLocaleLowerCase("pt-BR")}` : `Mostrar ${label.toLocaleLowerCase("pt-BR")}`}
                    aria-pressed={visible}
                    aria-controls={id}
                    onClick={onToggleVisibility}
                >
                    <EyeIcon visible={visible} />
                </Button>
            </div>
            {showStrength && <PasswordStrength password={value} />}
            {!showStrength && <span className="sr-only" id={helpId}>A senha deve ter de 8 a 100 caracteres.</span>}
            <FieldError id={errorId} message={error} />
        </div>
    );
}

function RegistrationProgress() {
    return (
        <p className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#efe7fe] px-2.5 py-1 text-login-message font-bold leading-tight text-login-brand-end">
            <img className="h-5 w-auto shrink-0 object-contain" src={inventraIcons.supervisor} alt="" aria-hidden="true" />
            Etapa 1 de 2 · Conta de supervisor
        </p>
    );
}

function getRequestError(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Tente novamente em instantes.";
    return error instanceof Error ? error.message : "Não foi possível criar a conta. Tente novamente.";
}

function RegisterForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState<RegistrationFormState>(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState<RegistrationErrors>({});
    const [termsError, setTermsError] = useState<string | null>(null);
    const [requestError, setRequestError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    function updateField<K extends keyof RegistrationFormValues>(field: K, value: RegistrationFormValues[K]) {
        setForm((current) => ({ ...current, [field]: value }));
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
        setRequestError(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validation = validateRegistration({ ...form, accessType: "SUPERVISOR" });
        setFieldErrors(validation.errors);
        setRequestError(null);
        setTermsError(form.acceptedTerms ? null : "Aceite os termos para continuar.");

        if (!validation.request || !form.acceptedTerms) return;

        setIsSubmitting(true);
        let accountCreated = false;
        try {
            const response = await register(validation.request);
            accountCreated = true;
            if (!response.token || !response.user) {
                throw new Error("A API criou a conta, mas retornou uma resposta de autenticação incompleta.");
            }

            saveSession(response);
            navigate("/cadastro/cozinha", { replace: true });
        } catch (registrationError) {
            setRequestError(accountCreated
                ? "Sua conta foi criada, mas não foi possível iniciar a sessão. Entre com ela para continuar."
                : getRequestError(registrationError));
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleTermsChange(acceptedTerms: boolean) {
        setForm((current) => ({ ...current, acceptedTerms }));
        setTermsError(null);
        setRequestError(null);
    }

    return (
        <section
            className="relative flex min-h-screen min-w-0 flex-1 items-center justify-center overflow-x-hidden overflow-y-auto bg-white px-6 max-lg:min-h-0 max-lg:flex-none max-lg:flex-col max-lg:items-stretch max-lg:justify-start max-lg:overflow-visible max-lg:px-6 max-lg:pb-login-mobile-form-bottom max-lg:pt-login-mobile-form-top"
            aria-label="Criar conta de supervisor"
        >
            <div className="relative z-2 w-login-form-width max-w-login-form-max max-lg:w-full max-lg:max-w-xl">
                <form className="flex flex-col gap-login-form-gap max-lg:gap-4" onSubmit={handleSubmit} noValidate>
                    <header>
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                            <h1 className="min-w-0 flex-1 text-login-form-title font-bold leading-tight text-login-brand-start">Crie sua conta</h1>
                            <RegistrationProgress />
                        </div>
                        <p className="mt-login-form-copy-top text-login-form-copy leading-snug text-login-muted">
                            Crie sua conta de supervisor. Depois você monta a sua cozinha.
                        </p>
                    </header>

                    <div className="flex min-w-0 flex-col gap-login-field-gap">
                        <RegistrationField id="register-name" label="Nome completo" />
                        <Input
                            id="register-name"
                            name="name"
                            autoComplete="name"
                            placeholder="Ex.: Eduardo Passos"
                            required
                            maxLength={120}
                            value={form.name}
                            onChange={(event) => updateField("name", event.target.value)}
                            aria-invalid={Boolean(fieldErrors.name)}
                            aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
                        />
                        <FieldError id="register-name-error" message={fieldErrors.name} />
                    </div>

                    <div className="flex min-w-0 flex-col gap-login-field-gap">
                        <RegistrationField id="register-email" label="E-mail" />
                        <Input
                            id="register-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            placeholder="seuemail@exemplo.com"
                            required
                            maxLength={150}
                            value={form.email}
                            onChange={(event) => updateField("email", event.target.value)}
                            aria-invalid={Boolean(fieldErrors.email)}
                            aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
                        />
                        <FieldError id="register-email-error" message={fieldErrors.email} />
                    </div>

                    <PasswordInput
                        id="register-password"
                        name="password"
                        label="Senha"
                        value={form.password}
                        visible={showPassword}
                        onChange={(value) => updateField("password", value)}
                        onToggleVisibility={() => setShowPassword((visible) => !visible)}
                        error={fieldErrors.password}
                        showStrength
                    />

                    <PasswordInput
                        id="register-confirm-password"
                        name="confirmPassword"
                        label="Confirmar senha"
                        value={form.confirmPassword}
                        visible={showConfirmPassword}
                        onChange={(value) => updateField("confirmPassword", value)}
                        onToggleVisibility={() => setShowConfirmPassword((visible) => !visible)}
                        error={fieldErrors.confirmPassword}
                    />

                    <div className="flex flex-col gap-1">
                        <label className="flex w-fit cursor-pointer items-start gap-login-checkbox-gap text-login-options leading-snug text-login-muted" htmlFor="register-terms">
                            <Input
                                className="!mt-0.5"
                                variant="checkbox"
                                id="register-terms"
                                name="acceptedTerms"
                                type="checkbox"
                                required
                                checked={form.acceptedTerms}
                                onChange={(event) => handleTermsChange(event.target.checked)}
                                aria-invalid={Boolean(termsError)}
                                aria-describedby={termsError ? "register-terms-error" : undefined}
                            />
                            <span>Li e aceito os termos de uso e a política de privacidade.</span>
                        </label>
                        <FieldError id="register-terms-error" message={termsError ?? undefined} />
                    </div>

                    {requestError && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm leading-snug text-login-error" role="alert">{requestError}</p>
                            {requestError.includes("Entre com ela") && (
                                <Link className="w-fit font-bold text-login-brand-end underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-login-brand-start focus-visible:outline-offset-4" to="/login">
                                    Ir para entrar
                                </Link>
                            )}
                        </div>
                    )}

                    {isSubmitting && <p className="sr-only" role="status" aria-live="polite">Criando sua conta…</p>}

                    <Button variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Criando conta…" : "Criar conta"}
                    </Button>

                    <p className="text-center text-login-access text-login-muted">
                        Já tem conta? <Link className="font-bold text-login-brand-end underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-login-brand-start focus-visible:outline-offset-4" to="/login">Entrar</Link>
                    </p>
                </form>
            </div>
        </section>
    );
}

export default RegisterForm;
