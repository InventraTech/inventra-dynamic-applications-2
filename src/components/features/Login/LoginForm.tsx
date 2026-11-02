import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Mascote from "../../ui/Mascot";
import Feedback from "../../ui/Feedback";
import { ApiError } from "../../../services/api";
import { login } from "../../../services/authService";
import { saveSession } from "../../../services/authSession";

interface LoginNavigationState {
    from?: {
        pathname?: string;
    };
    message?: string;
}

function LoginForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [navigationMessage] = useState(() => (location.state as LoginNavigationState | null)?.message ?? null);
    const [supportNote, setSupportNote] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSubmitting) return;
        const submittedFields = new FormData(event.currentTarget);
        const submittedEmail = String(submittedFields.get("email") ?? "").trim();
        const submittedPassword = String(submittedFields.get("password") ?? "");
        setError(null);
        setSupportNote(null);
        setIsSubmitting(true);

        try {
            const response = await login(submittedEmail, submittedPassword);

            if (!response.token || !response.user) {
                throw new Error("A API retornou uma resposta de autenticação incompleta.");
            }

            saveSession(response, rememberMe);
            navigate("/dashboard", { replace: true });
        } catch (loginError) {
            if (loginError instanceof ApiError && loginError.status === 401) {
                setError(loginError.message);
            } else if (loginError instanceof ApiError) {
                setError(loginError.message);
            } else if (loginError instanceof TypeError) {
                setError("Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.");
            } else {
                setError(loginError instanceof Error ? loginError.message : "Não foi possível entrar. Tente novamente.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="relative flex min-h-screen min-w-0 flex-1 items-center justify-center bg-surface px-6 py-12 max-lg:min-h-0 max-lg:flex-none max-lg:flex-col max-lg:items-stretch max-lg:justify-start max-lg:px-6 max-lg:pb-login-mobile-form-bottom max-lg:pt-login-mobile-form-top large-text:min-h-0 large-text:items-stretch large-text:py-10 large-text:px-3" aria-label="Entrar na Inventra">
            <form className="relative z-2 flex w-login-form-width max-w-login-form-max flex-col gap-login-form-gap max-lg:w-full max-lg:max-w-xl max-lg:gap-4 large-text:w-full large-text:max-w-none" onSubmit={handleSubmit} aria-busy={isSubmitting}>
                <header className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-login-form-title font-bold leading-tight text-login-brand-start">Bem-vindo de volta</h1>
                        <p className="mt-login-form-copy-top text-login-form-copy leading-snug text-login-muted">Entre com sua conta Inventra para continuar.</p>
                    </div>
                    <Mascote className="mt-0.5 shrink-0 large-text:hidden" size="compacto" />
                </header>

                {navigationMessage && <Feedback severity="success">{navigationMessage}</Feedback>}

                <div className="flex min-w-0 flex-col gap-login-field-gap">
                    <label className="text-login-label font-bold leading-tight text-login-brand-start" htmlFor="login-email">E-mail</label>
                    <Input
                        id="login-email"
                        type="email"
                        name="email"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="seuemail@germinare.org.br"
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? "login-error" : undefined}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-login-field-gap">
                    <label className="text-login-label font-bold leading-tight text-login-brand-start" htmlFor="login-password">Senha</label>
                    <div className="relative min-w-0">
                        <Input
                            className="pr-12"
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            autoComplete="current-password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="••••••••"
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? "login-error" : undefined}
                        />
                        <Button
                            className="absolute right-3 top-1/2 size-9 -translate-y-1/2 rounded-lg text-login-muted hover:text-login-brand-end focus-visible:outline-login-brand-start"
                            variant="icon"
                            type="button"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            aria-pressed={showPassword}
                            aria-controls="login-password"
                            onClick={() => setShowPassword((visible) => !visible)}
                        >
                            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                {showPassword ? (
                                    <>
                                        <path d="M3 3l18 18" />
                                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                        <path d="M9.9 5.1A10.8 10.8 0 0 1 12 4.9c6.3 0 10 7.1 10 7.1a13.2 13.2 0 0 1-3.5 4.3" />
                                        <path d="M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7.1 10 7.1c1.4 0 2.7-.4 3.8-.9" />
                                    </>
                                ) : (
                                    <>
                                        <path d="M2.25 12s3.54-6 9.75-6 9.75 6 9.75 6-3.54 6-9.75 6-9.75-6-9.75-6Z" />
                                        <circle cx="12" cy="12" r="2.6" />
                                    </>
                                )}
                            </svg>
                        </Button>
                    </div>
                </div>

                {error && <Feedback severity="error" id="login-error">{error}</Feedback>}

                <div className="flex min-h-login-options-height flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <label className="flex min-h-11 min-w-0 cursor-pointer items-center gap-login-checkbox-gap text-login-options text-login-muted" htmlFor="login-remember">
                        <Input
                            variant="checkbox"
                            type="checkbox"
                            id="login-remember"
                            checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}
                        />
                        <span>Lembrar de mim</span>
                    </label>
                    <Button
                        className="text-login-options text-right leading-snug"
                        variant="link"
                        type="button"
                        onClick={() => setSupportNote("A recuperação de senha não está disponível pela API atual. Peça ajuda ao administrador do Inventra.")}
                    >
                        Esqueci minha senha
                    </Button>
                </div>

                <p className="sr-only" role="status">{isSubmitting ? "Entrando na sua conta…" : ""}</p>

                <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Entrando…" : "Entrar"}
                </Button>

                <div className="flex items-center justify-center gap-login-separator-gap text-login-separator text-login-placeholder" aria-hidden="true">
                    <span className="h-px flex-1 bg-login-field-border" />
                    <span>ou</span>
                    <span className="h-px flex-1 bg-login-field-border" />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-login-access-gap text-login-access text-login-muted">
                    <span>Não tem conta?</span>
                    <Link className="font-bold text-login-brand-end hover:text-login-brand-start hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-login-brand-start focus-visible:outline-offset-4" to="/cadastro">
                        Solicite acesso
                    </Link>
                </div>

                {supportNote && <Feedback>{supportNote}</Feedback>}
            </form>
        </section>
    );
}

export default LoginForm;
