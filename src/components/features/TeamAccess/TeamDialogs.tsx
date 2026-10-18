import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { KitchenAccessRequest, TeamProfile, TeamUser, TeamUserFormErrors, TeamUserFormValues } from "../../../types/teamAccess";
import { validateTeamUser } from "../../../utils/teamAccessValidation";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";

interface UserAccountDialogProps {
    open: boolean;
    user: TeamUser | null;
    profiles: TeamProfile[];
    saving: boolean;
    error: string | null;
    onClose: () => void;
    onSave: (values: TeamUserFormValues) => Promise<void>;
}

const emptyValues: TeamUserFormValues = { name: "", email: "", password: "", confirmPassword: "", profileId: "" };

function UserAccountDialog({ open, user, profiles, saving, error, onClose, onSave }: UserAccountDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [values, setValues] = useState<TeamUserFormValues>(() => user
        ? { ...emptyValues, name: user.name, profileId: String(user.profile.id) }
        : emptyValues);
    const [errors, setErrors] = useState<TeamUserFormErrors>({});
    const id = useId();
    const isEditing = Boolean(user);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    function updateValue(field: keyof TeamUserFormValues, value: string) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextErrors = validateTeamUser(values, isEditing);
        setErrors(nextErrors);
        const firstInvalidField = Object.keys(nextErrors)[0];
        if (firstInvalidField) {
            document.getElementById(`${id}-${firstInvalidField}`)?.focus();
            return;
        }
        await onSave(values);
    }

    function fieldError(field: keyof TeamUserFormValues): string | undefined {
        return errors[field];
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={`${id}-titulo`}
            className="m-auto max-h-dvh w-11/12 max-w-144 overflow-y-auto rounded-3xl border border-history-border bg-surface p-0 text-sidebar-text shadow-2xl backdrop:bg-black/50"
            onClose={onClose}
        >
            <form className="flex min-w-0 flex-col gap-5 p-5 sm:p-7" onSubmit={submit} noValidate>
                <header>
                    <h2 id={`${id}-titulo`} className="font-k2d text-xl font-bold text-sidebar-purple">
                        {isEditing ? "Editar pessoa" : "Criar usuário"}
                    </h2>
                    <p className="mt-1 font-k2d text-sm leading-relaxed text-history-muted">
                        {isEditing
                            ? "Atualize o nome ou o perfil de acesso desta pessoa."
                            : "A conta será criada imediatamente para a cozinha atual. Defina uma senha inicial para compartilhar com a pessoa."}
                    </p>
                </header>
                {error && <Feedback severity="error">{error}</Feedback>}

                <div className="flex min-w-0 flex-col gap-4">
                    <div className="min-w-0">
                        <label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor={`${id}-name`}>Nome completo</label>
                        <Input
                            id={`${id}-name`}
                            autoFocus
                            variant="text"
                            value={values.name}
                            maxLength={120}
                            autoComplete="name"
                            required
                            aria-invalid={Boolean(fieldError("name"))}
                            aria-describedby={fieldError("name") ? `${id}-name-error` : undefined}
                            onChange={(event) => updateValue("name", event.target.value)}
                            placeholder="Ex.: Maria Souza"
                        />
                        {fieldError("name") && <p className="mt-1 font-k2d text-sm text-feedback-error" id={`${id}-name-error`} role="alert">{fieldError("name")}</p>}
                    </div>

                    {!isEditing && (
                        <>
                            <div className="min-w-0">
                                <label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor={`${id}-email`}>E-mail</label>
                                <Input
                                    id={`${id}-email`}
                                    variant="text"
                                    type="email"
                                    value={values.email}
                                    maxLength={150}
                                    autoComplete="email"
                                    required
                                    aria-invalid={Boolean(fieldError("email"))}
                                    aria-describedby={fieldError("email") ? `${id}-email-error` : undefined}
                                    onChange={(event) => updateValue("email", event.target.value)}
                                    placeholder="pessoa@exemplo.com"
                                />
                                {fieldError("email") && <p className="mt-1 font-k2d text-sm text-feedback-error" id={`${id}-email-error`} role="alert">{fieldError("email")}</p>}
                            </div>
                            <div className="min-w-0">
                                <label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor={`${id}-password`}>Senha inicial</label>
                                <Input
                                    id={`${id}-password`}
                                    variant="text"
                                    type="password"
                                    value={values.password}
                                    minLength={8}
                                    maxLength={100}
                                    autoComplete="new-password"
                                    required
                                    aria-invalid={Boolean(fieldError("password"))}
                                    aria-describedby={fieldError("password") ? `${id}-password-error` : `${id}-password-help`}
                                    onChange={(event) => updateValue("password", event.target.value)}
                                />
                                <p className="mt-1 font-k2d text-sm text-history-muted" id={`${id}-password-help`}>Use de 8 a 100 caracteres.</p>
                                {fieldError("password") && <p className="mt-1 font-k2d text-sm text-feedback-error" id={`${id}-password-error`} role="alert">{fieldError("password")}</p>}
                            </div>
                            <div className="min-w-0">
                                <label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor={`${id}-confirmPassword`}>Confirmar senha</label>
                                <Input
                                    id={`${id}-confirmPassword`}
                                    variant="text"
                                    type="password"
                                    value={values.confirmPassword}
                                    maxLength={100}
                                    autoComplete="new-password"
                                    required
                                    aria-invalid={Boolean(fieldError("confirmPassword"))}
                                    aria-describedby={fieldError("confirmPassword") ? `${id}-confirmPassword-error` : undefined}
                                    onChange={(event) => updateValue("confirmPassword", event.target.value)}
                                />
                                {fieldError("confirmPassword") && <p className="mt-1 font-k2d text-sm text-feedback-error" id={`${id}-confirmPassword-error`} role="alert">{fieldError("confirmPassword")}</p>}
                            </div>
                        </>
                    )}

                    <div className="min-w-0">
                        <label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor={`${id}-profileId`}>Perfil de acesso</label>
                        <select
                            id={`${id}-profileId`}
                            className="min-h-12 w-full min-w-0 rounded-login-control border border-login-field-border bg-login-field px-3.5 py-2 font-k2d text-sm text-login-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            value={values.profileId}
                            required
                            aria-invalid={Boolean(fieldError("profileId"))}
                            aria-describedby={fieldError("profileId") ? `${id}-profileId-error` : undefined}
                            onChange={(event) => updateValue("profileId", event.target.value)}
                        >
                            <option value="">Selecione um perfil</option>
                            {profiles.map((profile) => (
                                <option value={profile.id} key={profile.id}>{profile.accessType.replaceAll("_", " ")}</option>
                            ))}
                        </select>
                        {fieldError("profileId") && <p className="mt-1 font-k2d text-sm text-feedback-error" id={`${id}-profileId-error`} role="alert">{fieldError("profileId")}</p>}
                    </div>
                </div>

                <footer className="flex flex-col-reverse gap-3 border-t border-history-border pt-4 sm:flex-row sm:justify-end">
                    <Button variant="icon" type="button" className="min-h-11 rounded-xl border border-history-border px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header focus-visible:outline-focus" disabled={saving} onClick={() => dialogRef.current?.close()}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" className="min-h-11 rounded-xl px-5 py-2.5 font-k2d text-sm" disabled={saving || profiles.length === 0}>
                        {saving ? "Salvando…" : isEditing ? "Salvar alterações" : "Criar conta"}
                    </Button>
                </footer>
            </form>
        </dialog>
    );
}

interface UserStatusDialogProps {
    open: boolean;
    user: TeamUser | null;
    activate: boolean;
    busy: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

function UserStatusDialog({ open, user, activate, busy, error, onClose, onConfirm }: UserStatusDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const id = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog ref={dialogRef} aria-labelledby={`${id}-titulo`} className="m-auto w-11/12 max-w-120 rounded-3xl border border-history-border bg-surface p-0 text-sidebar-text shadow-2xl backdrop:bg-black/50" onClose={onClose}>
            <div className="flex flex-col gap-4 p-5 sm:p-7">
                <div>
                    <h2 id={`${id}-titulo`} className="font-k2d text-xl font-bold text-sidebar-purple">{activate ? "Reativar conta" : "Desativar conta"}</h2>
                    <p className="mt-2 wrap-anywhere font-k2d text-sm leading-relaxed text-history-muted">
                        {user && (activate
                            ? `A conta de ${user.name} voltará a ter acesso à plataforma.`
                            : `A conta de ${user.name} perderá acesso à plataforma. Ela continuará na lista e poderá ser reativada depois.`)}
                    </p>
                </div>
                {error && <Feedback severity="error">{error}</Feedback>}
                <div className="flex flex-col-reverse gap-3 border-t border-history-border pt-4 sm:flex-row sm:justify-end">
                    <Button variant="icon" type="button" className="min-h-11 rounded-xl border border-history-border px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header focus-visible:outline-focus" disabled={busy} onClick={() => dialogRef.current?.close()}>Cancelar</Button>
                    <Button variant="primary" type="button" className={`min-h-11 rounded-xl px-4 py-2.5 font-k2d text-sm ${activate ? "bg-feedback-success" : "bg-feedback-error"}`} disabled={busy || !user} onClick={() => void onConfirm()}>
                        {busy ? "Atualizando…" : activate ? "Reativar conta" : "Desativar conta"}
                    </Button>
                </div>
            </div>
        </dialog>
    );
}

interface RejectRequestDialogProps {
    open: boolean;
    request: KitchenAccessRequest | null;
    busy: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
}

function RejectRequestDialog({ open, request, busy, error, onClose, onConfirm }: RejectRequestDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const id = useId();
    const [reason, setReason] = useState("");

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void onConfirm(reason.trim());
    }

    return (
        <dialog ref={dialogRef} aria-labelledby={`${id}-titulo`} className="m-auto w-11/12 max-w-128 rounded-3xl border border-history-border bg-surface p-0 text-sidebar-text shadow-2xl backdrop:bg-black/50" onClose={onClose}>
            <form className="flex flex-col gap-4 p-5 sm:p-7" onSubmit={submit}>
                <div>
                    <h2 id={`${id}-titulo`} className="font-k2d text-xl font-bold text-sidebar-purple">Rejeitar pedido de acesso</h2>
                    <p className="mt-2 wrap-anywhere font-k2d text-sm leading-relaxed text-history-muted">
                        {request ? `O pedido de ${request.user.name} será marcado como rejeitado.` : "O pedido será marcado como rejeitado."} Você pode informar um motivo, mas ele é opcional.
                    </p>
                </div>
                {error && <Feedback severity="error">{error}</Feedback>}
                <div>
                    <label className="mb-1.5 block font-k2d text-sm font-bold text-sidebar-purple" htmlFor={`${id}-reason`}>Motivo (opcional)</label>
                    <textarea
                        id={`${id}-reason`}
                        className="min-h-28 w-full resize-y rounded-login-control border border-login-field-border bg-login-field px-3.5 py-3 font-k2d text-sm text-login-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        value={reason}
                        maxLength={255}
                        aria-describedby={`${id}-reason-help`}
                        onChange={(event) => setReason(event.target.value)}
                    />
                    <p className="mt-1 font-k2d text-sm text-history-muted" id={`${id}-reason-help`}>{reason.length}/255 caracteres.</p>
                </div>
                <footer className="flex flex-col-reverse gap-3 border-t border-history-border pt-4 sm:flex-row sm:justify-end">
                    <Button variant="icon" type="button" className="min-h-11 rounded-xl border border-history-border px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header focus-visible:outline-focus" disabled={busy} onClick={() => dialogRef.current?.close()}>Cancelar</Button>
                    <Button variant="primary" type="submit" className="min-h-11 rounded-xl bg-feedback-error px-4 py-2.5 font-k2d text-sm" disabled={busy}>
                        {busy ? "Rejeitando…" : "Confirmar rejeição"}
                    </Button>
                </footer>
            </form>
        </dialog>
    );
}

export { UserAccountDialog, UserStatusDialog, RejectRequestDialog };
