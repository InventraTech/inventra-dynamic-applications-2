import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import type { UserAccount } from "../../../types/auth";
import passwordIcon from "../../../assets/icons/senha.svg";
import { clearSession } from "../../../services/authSession";
import { changeUserPassword } from "../../../services/userService";
import { validateProfilePassword, type ProfileFormErrors } from "../../../utils/profileValidation";
import { focusFirstInvalidField } from "../../../utils/formAccessibility";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";
import { getProfileErrorMessage } from "./profileHelpers";

interface ProfilePasswordCardProps {
    user: UserAccount;
}

type PasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string };
type PasswordField = keyof PasswordValues;

const emptyPasswordValues: PasswordValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

function getPasswordStrength(value: string): { score: number; label: string } {
    if (!value) return { score: 0, label: "A força aparece enquanto você digita." };
    let score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (value.length >= 16) score += 1;
    if (value.length >= 20 && /[^\p{L}\p{N}]/u.test(value)) score += 1;
    const labels = ["Muito curta", "Inicial", "Razoável", "Boa", "Ótima"];
    return { score, label: labels[score] };
}

function PasswordVisibilityButton({ id, visible, onToggle }: { id: string; visible: boolean; onToggle: () => void }) {
    return (
        <Button
            variant="icon"
            type="button"
            className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 rounded-lg text-history-muted hover:text-sidebar-purple"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={visible}
            aria-controls={id}
            onClick={onToggle}
        >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {visible ? <>
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.1A10.8 10.8 0 0 1 12 4.9c6.3 0 10 7.1 10 7.1a13.2 13.2 0 0 1-3.5 4.3" />
                    <path d="M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7.1 10 7.1c1.4 0 2.7-.4 3.8-.9" />
                </> : <>
                    <path d="M2.25 12s3.54-6 9.75-6 9.75 6 9.75 6-3.54 6-9.75 6-9.75-6-9.75-6Z" />
                    <circle cx="12" cy="12" r="2.6" />
                </>}
            </svg>
        </Button>
    );
}

function ProfilePasswordCard({ user }: ProfilePasswordCardProps) {
    const navigate = useNavigate();
    const [values, setValues] = useState<PasswordValues>(emptyPasswordValues);
    const [errors, setErrors] = useState<ProfileFormErrors>({});
    const [requestError, setRequestError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<PasswordField, boolean>>({ currentPassword: false, newPassword: false, confirmPassword: false });
    const strength = getPasswordStrength(values.newPassword);

    function updateValue(field: keyof PasswordValues, value: string) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
        setRequestError(null);
    }

    function clearForm() {
        setValues(emptyPasswordValues);
        setErrors({});
        setVisiblePasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
        setRequestError(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;
        const validationErrors = validateProfilePassword(values, user.hasPassword);
        setErrors(validationErrors);
        setRequestError(null);
        if (Object.keys(validationErrors).length > 0) {
            focusFirstInvalidField(event.currentTarget);
            return;
        }

        setSaving(true);
        try {
            await changeUserPassword(user.id, {
                ...(user.hasPassword ? { currentPassword: values.currentPassword } : {}),
                newPassword: values.newPassword,
            });
            clearSession();
            navigate("/login", {
                replace: true,
                state: { message: "Senha alterada. Entre novamente com a nova senha." },
            });
        } catch (error: unknown) {
            setRequestError(getProfileErrorMessage(error, "Não foi possível alterar sua senha. Tente novamente."));
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-labelledby="perfil-senha-titulo">
            <header className="flex min-w-0 items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-history-avatar">
                    <img className="size-6" src={passwordIcon} alt="" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h2 id="perfil-senha-titulo" className="font-k2d text-xl font-bold text-sidebar-text">Alterar senha</h2>
                    <p className="font-k2d text-sm leading-relaxed text-history-muted">Use uma senha que você não usa em nenhum outro lugar.</p>
                </div>
            </header>

            <form className="mt-5 flex min-w-0 flex-col gap-4" onSubmit={(event) => void handleSubmit(event)} aria-busy={saving}>
                <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3 large-text:grid-cols-1">
                    {user.hasPassword && (
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className="font-k2d text-sm font-bold text-sidebar-text" htmlFor="perfil-senha-atual">Senha atual</label>
                            <div className="relative min-w-0">
                                <Input
                                    className="pr-12"
                                    id="perfil-senha-atual"
                                    type={visiblePasswords.currentPassword ? "text" : "password"}
                                    name="currentPassword"
                                    autoComplete="current-password"
                                    maxLength={100}
                                    value={values.currentPassword}
                                    onChange={(event) => updateValue("currentPassword", event.target.value)}
                                    aria-invalid={Boolean(errors.currentPassword)}
                                    aria-describedby={errors.currentPassword ? "perfil-senha-atual-erro" : undefined}
                                />
                                <PasswordVisibilityButton
                                    id="perfil-senha-atual"
                                    visible={visiblePasswords.currentPassword}
                                    onToggle={() => setVisiblePasswords((current) => ({ ...current, currentPassword: !current.currentPassword }))}
                                />
                            </div>
                            {errors.currentPassword && <p id="perfil-senha-atual-erro" className="font-k2d text-sm text-feedback-error" role="alert">{errors.currentPassword}</p>}
                        </div>
                    )}

                    <div className="flex min-w-0 flex-col gap-1.5">
                        <label className="font-k2d text-sm font-bold text-sidebar-text" htmlFor="perfil-senha-nova">Nova senha</label>
                        <div className="relative min-w-0">
                            <Input
                                className="pr-12"
                                id="perfil-senha-nova"
                                type={visiblePasswords.newPassword ? "text" : "password"}
                                name="newPassword"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={100}
                                value={values.newPassword}
                                onChange={(event) => updateValue("newPassword", event.target.value)}
                                aria-invalid={Boolean(errors.newPassword)}
                                aria-describedby={`${errors.newPassword ? "perfil-senha-nova-erro " : ""}perfil-senha-ajuda`}
                            />
                            <PasswordVisibilityButton
                                id="perfil-senha-nova"
                                visible={visiblePasswords.newPassword}
                                onToggle={() => setVisiblePasswords((current) => ({ ...current, newPassword: !current.newPassword }))}
                            />
                        </div>
                        {errors.newPassword && <p id="perfil-senha-nova-erro" className="font-k2d text-sm text-feedback-error" role="alert">{errors.newPassword}</p>}
                        <div className="mt-1 flex gap-1.5" role="img" aria-label={`Força estimada da senha: ${strength.label}`}>
                            {Array.from({ length: 4 }, (_, index) => (
                                <span key={index} className={`h-1.5 min-w-0 flex-1 rounded-full ${index < strength.score ? "bg-sidebar-purple" : "bg-history-border"}`} />
                            ))}
                        </div>
                        <p id="perfil-senha-ajuda" className="font-k2d text-xs leading-relaxed text-history-muted">Use de 8 a 100 caracteres. Quanto mais longa, mais forte.</p>
                    </div>

                    <div className="flex min-w-0 flex-col gap-1.5">
                        <label className="font-k2d text-sm font-bold text-sidebar-text" htmlFor="perfil-senha-confirmar">Confirmar nova senha</label>
                        <div className="relative min-w-0">
                            <Input
                                className="pr-12"
                                id="perfil-senha-confirmar"
                                type={visiblePasswords.confirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={100}
                                value={values.confirmPassword}
                                onChange={(event) => updateValue("confirmPassword", event.target.value)}
                                aria-invalid={Boolean(errors.confirmPassword)}
                                aria-describedby={`${errors.confirmPassword ? "perfil-senha-confirmar-erro " : ""}perfil-senha-confirmar-ajuda`}
                            />
                            <PasswordVisibilityButton
                                id="perfil-senha-confirmar"
                                visible={visiblePasswords.confirmPassword}
                                onToggle={() => setVisiblePasswords((current) => ({ ...current, confirmPassword: !current.confirmPassword }))}
                            />
                        </div>
                        {errors.confirmPassword && <p id="perfil-senha-confirmar-erro" className="font-k2d text-sm text-feedback-error" role="alert">{errors.confirmPassword}</p>}
                        <p id="perfil-senha-confirmar-ajuda" className="font-k2d text-xs leading-relaxed text-history-muted">As duas senhas precisam ser iguais.</p>
                    </div>
                </div>

                {requestError && <Feedback severity="error">{requestError}</Feedback>}
                {saving && <p className="sr-only" role="status" aria-live="polite">Alterando sua senha…</p>}

                <div className="flex min-w-0 flex-col gap-3 border-t border-history-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-k2d text-sm leading-relaxed text-history-muted">Da próxima vez que entrar, use a senha nova.</p>
                    <div className="flex min-w-0 flex-wrap gap-2 sm:shrink-0">
                        <Button variant="outline" type="button" className="min-h-11 flex-1 sm:flex-none" disabled={saving} onClick={clearForm}>Limpar</Button>
                        <Button variant="standard" type="submit" className="min-h-11 flex-1 sm:flex-none" disabled={saving}>{saving ? "Alterando…" : user.hasPassword ? "Alterar senha" : "Definir senha"}</Button>
                    </div>
                </div>
            </form>
        </section>
    );
}

export default ProfilePasswordCard;
