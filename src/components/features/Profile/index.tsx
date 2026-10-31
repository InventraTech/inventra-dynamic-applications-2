import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";

import type { UserAccount } from "../../../types/auth";
import { ApiError } from "../../../services/api";
import { getCurrentUser } from "../../../services/authService";
import { clearSession, updateSessionUser } from "../../../services/authSession";
import { changeUserPassword, removeCurrentUserPhoto, updateUserName, uploadCurrentUserPhoto } from "../../../services/userService";
import { validateProfileName, validateProfilePassword, validateProfilePhoto, type ProfileFormErrors } from "../../../utils/profileValidation";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";
import UserAvatar from "../../ui/UserAvatar";
import ProfileLoadingSkeleton from "./ProfileLoadingSkeleton";

interface ProfileProps {
    onUserUpdated?: (user: UserAccount) => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    return fallback;
}

function formatDate(value: string | null): string {
    if (!value) return "Ainda não há um acesso registrado.";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Data indisponível.";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

function displayRole(accessType: string | null | undefined): string {
    if (!accessType) return "Usuário";
    const labels: Record<string, string> = {
        SUPERVISOR: "Supervisor",
        ESTOQUISTA: "Estoquista",
        COMPRADOR: "Comprador",
    };
    const normalized = accessType.toLocaleUpperCase("pt-BR");
    return labels[normalized] ?? accessType.replaceAll("_", " ").toLocaleLowerCase("pt-BR").replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function Profile({ onUserUpdated }: ProfileProps) {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserAccount | null>(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameSuccess, setNameSuccess] = useState<string | null>(null);
    const [savingName, setSavingName] = useState(false);
    const [passwordValues, setPasswordValues] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordErrors, setPasswordErrors] = useState<ProfileFormErrors>({});
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [savingPassword, setSavingPassword] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
    const [savingPhoto, setSavingPhoto] = useState(false);
    const [removingPhoto, setRemovingPhoto] = useState(false);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const removeDialogRef = useRef<HTMLDialogElement>(null);
    const photoPreviewUrlRef = useRef<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => {
            if (controller.signal.aborted) return;
            setLoadError("O carregamento do perfil demorou mais que o esperado. Tente novamente.");
            setLoading(false);
            controller.abort();
        }, 30_000);

        async function loadProfile() {
            setLoading(true);
            setLoadError(null);
            try {
                const currentUser = await getCurrentUser(controller.signal);
                if (controller.signal.aborted) return;
                setUser(currentUser);
                setName(currentUser.name);
                updateSessionUser(currentUser);
                onUserUpdated?.(currentUser);
            } catch (error: unknown) {
                if (!controller.signal.aborted) setLoadError(getErrorMessage(error, "Não foi possível carregar seu perfil. Tente novamente."));
            } finally {
                window.clearTimeout(timeoutId);
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        void loadProfile();
        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [onUserUpdated, reloadKey]);

    useEffect(() => () => {
        if (photoPreviewUrlRef.current) URL.revokeObjectURL(photoPreviewUrlRef.current);
    }, []);

    useEffect(() => {
        const dialog = removeDialogRef.current;
        if (!dialog) return;
        if (removeDialogOpen && !dialog.open) dialog.showModal();
        if (!removeDialogOpen && dialog.open) dialog.close();
    }, [removeDialogOpen]);

    async function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user || savingName) return;
        const validationError = validateProfileName(name);
        if (validationError) {
            setNameError(validationError);
            setNameSuccess(null);
            return;
        }
        if (name.trim() === user.name) {
            setNameError(null);
            setNameSuccess("Seu nome já está atualizado.");
            return;
        }

        setNameError(null);
        setNameSuccess(null);
        setSavingName(true);
        try {
            const updatedUser = await updateUserName(user.id, name.trim());
            setUser(updatedUser);
            setName(updatedUser.name);
            updateSessionUser(updatedUser);
            onUserUpdated?.(updatedUser);
            setNameSuccess("Nome atualizado com sucesso.");
        } catch (error: unknown) {
            setNameError(getErrorMessage(error, "Não foi possível atualizar seu nome. Tente novamente."));
        } finally {
            setSavingName(false);
        }
    }

    function updatePasswordValue(field: keyof typeof passwordValues, value: string) {
        setPasswordValues((current) => ({ ...current, [field]: value }));
        setPasswordErrors((current) => ({ ...current, [field]: undefined }));
        setPasswordError(null);
    }

    function updatePhotoPreview(file: File | null) {
        if (photoPreviewUrlRef.current) URL.revokeObjectURL(photoPreviewUrlRef.current);
        photoPreviewUrlRef.current = file ? URL.createObjectURL(file) : null;
        setPhotoPreviewUrl(photoPreviewUrlRef.current);
    }

    async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user || savingPassword) return;
        const errors = validateProfilePassword(passwordValues, user.hasPassword);
        setPasswordErrors(errors);
        setPasswordError(null);
        if (Object.keys(errors).length > 0) return;

        setSavingPassword(true);
        try {
            await changeUserPassword(user.id, {
                ...(user.hasPassword ? { currentPassword: passwordValues.currentPassword } : {}),
                newPassword: passwordValues.newPassword,
            });
            clearSession();
            navigate("/login", {
                replace: true,
                state: { message: "Senha alterada. Entre novamente com a nova senha." },
            });
        } catch (error: unknown) {
            setPasswordError(getErrorMessage(error, "Não foi possível alterar sua senha. Tente novamente."));
        } finally {
            setSavingPassword(false);
        }
    }

    function handlePhotoSelection(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        event.target.value = "";
        if (!file) return;
        const validationError = validateProfilePhoto(file);
        setPhotoError(validationError);
        setPhotoSuccess(null);
        updatePhotoPreview(validationError ? null : file);
        setSelectedPhoto(validationError ? null : file);
    }

    async function handlePhotoUpload() {
        if (!selectedPhoto || savingPhoto) return;
        setPhotoError(null);
        setPhotoSuccess(null);
        setSavingPhoto(true);
        try {
            const updatedUser = await uploadCurrentUserPhoto(selectedPhoto);
            setUser(updatedUser);
            updateSessionUser(updatedUser);
            onUserUpdated?.(updatedUser);
            setSelectedPhoto(null);
            updatePhotoPreview(null);
            setPhotoSuccess("Foto de perfil atualizada com sucesso.");
        } catch (error: unknown) {
            setPhotoError(getErrorMessage(error, "Não foi possível enviar sua foto. Tente novamente."));
        } finally {
            setSavingPhoto(false);
        }
    }

    async function handlePhotoRemoval() {
        if (removingPhoto) return;
        setPhotoError(null);
        setPhotoSuccess(null);
        setRemovingPhoto(true);
        try {
            const updatedUser = await removeCurrentUserPhoto();
            setUser(updatedUser);
            updateSessionUser(updatedUser);
            onUserUpdated?.(updatedUser);
            setSelectedPhoto(null);
            updatePhotoPreview(null);
            setPhotoSuccess("Foto removida. Suas iniciais serão exibidas no lugar dela.");
            setRemoveDialogOpen(false);
        } catch (error: unknown) {
            setPhotoError(getErrorMessage(error, "Não foi possível remover sua foto. Tente novamente."));
        } finally {
            setRemovingPhoto(false);
        }
    }

    function handleDialogCancel(event: SyntheticEvent<HTMLDialogElement>) {
        event.preventDefault();
        setRemoveDialogOpen(false);
    }

    if (loading) return <ProfileLoadingSkeleton />;

    if (loadError || !user) {
        return (
            <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-6" aria-labelledby="perfil-erro-titulo">
                <h2 id="perfil-erro-titulo" className="font-k2d text-xl font-bold text-sidebar-text">Não foi possível abrir seu perfil</h2>
                <Feedback severity="error">{loadError ?? "Os dados do perfil não foram retornados."}</Feedback>
                <div><Button variant="primary" type="button" onClick={() => setReloadKey((value) => value + 1)}>Tentar novamente</Button></div>
            </section>
        );
    }

    const accountCreated = formatDate(user.createdAt);
    const lastLogin = user.lastLogin ? formatDate(user.lastLogin) : "Ainda não há um acesso registrado.";

    return (
        <>
            <div className="flex min-w-0 flex-col gap-5 bg-linear-to-b from-history-background-start to-history-background-end px-4 pb-10 pt-5 sm:px-6 sm:pt-6 xl:px-8 adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
                <div className="mx-auto grid w-full max-w-7xl min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,0.72fr)] large-text:grid-cols-1">
                    <div className="flex min-w-0 flex-col gap-5">
                        <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-labelledby="perfil-foto-titulo" aria-busy={savingPhoto || removingPhoto}>
                            <h2 id="perfil-foto-titulo" className="font-k2d text-xl font-bold text-sidebar-text">Foto do perfil</h2>
                            <p className="mt-1 max-w-2xl font-k2d text-sm leading-relaxed text-history-muted">A foto aparece junto ao seu nome no Inventra e nas áreas da cozinha em que sua conta é exibida.</p>
                            <div className="mt-5 flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                                <UserAvatar
                                    className="size-24 border-2 border-history-border text-2xl"
                                    name={user.name}
                                    photoUrl={photoPreviewUrl ?? user.photoUrl}
                                    alt={photoPreviewUrl ? "Prévia da nova foto de perfil" : `Foto de perfil de ${user.name}`}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="wrap-anywhere font-k2d text-lg font-bold text-sidebar-text">{user.name}</p>
                                    <p className="mt-1 wrap-anywhere font-k2d text-sm text-history-muted">{user.email}</p>
                                    <p className="mt-2 font-k2d text-sm text-history-muted">JPEG, PNG ou WebP · até 5 MB</p>
                                    <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                                        <input ref={photoInputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={handlePhotoSelection} aria-label="Selecionar arquivo de foto de perfil" />
                                        <Button variant="icon" type="button" className="min-h-11 rounded-xl border border-history-border bg-surface px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" disabled={savingPhoto || removingPhoto} onClick={() => photoInputRef.current?.click()}>
                                            {selectedPhoto ? "Escolher outra foto" : user.photoUrl ? "Trocar foto" : "Escolher foto"}
                                        </Button>
                                        {selectedPhoto && <>
                                            <Button variant="primary" type="button" className="min-h-11 rounded-xl px-4 py-2 text-sm" disabled={savingPhoto} onClick={() => void handlePhotoUpload()}>
                                                {savingPhoto ? "Enviando…" : "Salvar foto"}
                                            </Button>
                                            <Button variant="icon" type="button" className="min-h-11 rounded-xl px-4 font-k2d text-sm font-bold text-history-muted hover:bg-history-card-header" disabled={savingPhoto} onClick={() => { setSelectedPhoto(null); updatePhotoPreview(null); setPhotoError(null); }}>
                                                Cancelar seleção
                                            </Button>
                                        </>}
                                        {user.photoUrl && !selectedPhoto && <Button variant="icon" type="button" className="min-h-11 rounded-xl border border-feedback-error/40 px-4 font-k2d text-sm font-bold text-feedback-error hover:bg-feedback-error-bg" disabled={removingPhoto || savingPhoto} onClick={() => setRemoveDialogOpen(true)}>
                                            Remover foto
                                        </Button>}
                                    </div>
                                    {photoError && <div className="mt-3"><Feedback severity="error">{photoError}</Feedback></div>}
                                    {photoSuccess && <div className="mt-3"><Feedback severity="success">{photoSuccess}</Feedback></div>}
                                    {savingPhoto && <p className="sr-only" role="status" aria-live="polite">Enviando foto de perfil…</p>}
                                    {removingPhoto && <p className="sr-only" role="status" aria-live="polite">Removendo foto de perfil…</p>}
                                </div>
                            </div>
                        </section>

                        <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-labelledby="perfil-dados-titulo">
                            <h2 id="perfil-dados-titulo" className="font-k2d text-xl font-bold text-sidebar-text">Dados pessoais</h2>
                            <p className="mt-1 font-k2d text-sm leading-relaxed text-history-muted">Altere o nome exibido na sua conta. O e-mail é gerenciado pelo cadastro e não pode ser alterado por esta tela.</p>
                            <form className="mt-5 flex min-w-0 flex-col gap-4" onSubmit={handleNameSubmit} aria-busy={savingName}>
                                <div className="flex min-w-0 flex-col gap-1.5">
                                    <label className="font-k2d text-sm font-bold text-sidebar-text" htmlFor="perfil-nome">Nome completo</label>
                                    <Input id="perfil-nome" name="name" autoComplete="name" maxLength={120} required value={name} onChange={(event) => { setName(event.target.value); setNameError(null); setNameSuccess(null); }} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "perfil-nome-erro" : "perfil-nome-ajuda"} />
                                    {nameError && <p id="perfil-nome-erro" className="font-k2d text-sm text-feedback-error" role="alert">{nameError}</p>}
                                    <p id="perfil-nome-ajuda" className="font-k2d text-xs leading-relaxed text-history-muted">Até 120 caracteres.</p>
                                </div>
                                <div className="flex min-w-0 flex-col gap-1.5">
                                    <label className="font-k2d text-sm font-bold text-sidebar-text" htmlFor="perfil-email">E-mail</label>
                                    <Input id="perfil-email" type="email" value={user.email} readOnly aria-describedby="perfil-email-ajuda" />
                                </div>
                                {nameSuccess && <Feedback severity="success">{nameSuccess}</Feedback>}
                                {savingName && <p className="sr-only" role="status" aria-live="polite">Salvando seu nome…</p>}
                                <div><Button variant="primary" type="submit" disabled={savingName || name.trim() === user.name}>{savingName ? "Salvando…" : "Salvar nome"}</Button></div>
                            </form>
                        </section>
                    </div>

                    <div className="flex min-w-0 flex-col gap-5">
                        <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-labelledby="perfil-senha-titulo">
                            <h2 id="perfil-senha-titulo" className="font-k2d text-xl font-bold text-sidebar-text">Segurança</h2>
                            <p className="mt-1 font-k2d text-sm leading-relaxed text-history-muted">{user.hasPassword ? "Altere a senha usada para entrar no Inventra." : "Sua conta foi criada com Google e ainda não tem uma senha. Defina uma para também entrar com e-mail e senha."}</p>
                            <form className="mt-5 flex min-w-0 flex-col gap-4" onSubmit={(event) => void handlePasswordSubmit(event)} aria-busy={savingPassword}>
                                {user.hasPassword && <div className="flex min-w-0 flex-col gap-1.5">
                                    <label className="font-k2d text-sm font-bold text-sidebar-text" htmlFor="perfil-senha-atual">Senha atual</label>
                                    <Input id="perfil-senha-atual" type="password" name="currentPassword" autoComplete="current-password" maxLength={100} value={passwordValues.currentPassword} onChange={(event) => updatePasswordValue("currentPassword", event.target.value)} aria-invalid={Boolean(passwordErrors.currentPassword)} aria-describedby={passwordErrors.currentPassword ? "perfil-senha-atual-erro" : undefined} />
                                    {passwordErrors.currentPassword && <p id="perfil-senha-atual-erro" className="font-k2d text-sm text-feedback-error" role="alert">{passwordErrors.currentPassword}</p>}
                                </div>}
                                <div className="flex min-w-0 flex-col gap-1.5">
                                    <label className="font-k2d text-sm font-bold text-sidebar-text" htmlFor="perfil-senha-nova">Nova senha</label>
                                    <Input id="perfil-senha-nova" type="password" name="newPassword" autoComplete="new-password" minLength={8} maxLength={100} value={passwordValues.newPassword} onChange={(event) => updatePasswordValue("newPassword", event.target.value)} aria-invalid={Boolean(passwordErrors.newPassword)} aria-describedby={passwordErrors.newPassword ? "perfil-senha-nova-erro" : "perfil-senha-ajuda"} />
                                    {passwordErrors.newPassword && <p id="perfil-senha-nova-erro" className="font-k2d text-sm text-feedback-error" role="alert">{passwordErrors.newPassword}</p>}
                                    <p id="perfil-senha-ajuda" className="font-k2d text-xs leading-relaxed text-history-muted">Use entre 8 e 100 caracteres.</p>
                                </div>
                                <div className="flex min-w-0 flex-col gap-1.5">
                                    <label className="font-k2d text-sm font-bold text-sidebar-text" htmlFor="perfil-senha-confirmar">Confirmar nova senha</label>
                                    <Input id="perfil-senha-confirmar" type="password" name="confirmPassword" autoComplete="new-password" minLength={8} maxLength={100} value={passwordValues.confirmPassword} onChange={(event) => updatePasswordValue("confirmPassword", event.target.value)} aria-invalid={Boolean(passwordErrors.confirmPassword)} aria-describedby={passwordErrors.confirmPassword ? "perfil-senha-confirmar-erro" : undefined} />
                                    {passwordErrors.confirmPassword && <p id="perfil-senha-confirmar-erro" className="font-k2d text-sm text-feedback-error" role="alert">{passwordErrors.confirmPassword}</p>}
                                </div>
                                {passwordError && <Feedback severity="error">{passwordError}</Feedback>}
                                {savingPassword && <p className="sr-only" role="status" aria-live="polite">Alterando sua senha…</p>}
                                <p className="font-k2d text-sm leading-relaxed text-history-muted">Depois da alteração, a sessão será encerrada e você entrará novamente com a nova senha.</p>
                                <div><Button variant="primary" type="submit" disabled={savingPassword}>{savingPassword ? "Alterando…" : user.hasPassword ? "Alterar senha" : "Definir senha"}</Button></div>
                            </form>
                        </section>

                        <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-labelledby="perfil-conta-titulo">
                            <h2 id="perfil-conta-titulo" className="font-k2d text-xl font-bold text-sidebar-text">Conta Inventra</h2>
                            <dl className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 large-text:grid-cols-1">
                                <div className="min-w-0 rounded-2xl bg-history-card-header p-4"><dt className="font-k2d text-sm text-history-muted">Perfil de acesso</dt><dd className="mt-1 wrap-anywhere font-k2d text-base font-bold text-sidebar-text">{displayRole(user.profile?.accessType)}</dd></div>
                                <div className="min-w-0 rounded-2xl bg-history-card-header p-4"><dt className="font-k2d text-sm text-history-muted">Cozinha</dt><dd className="mt-1 wrap-anywhere font-k2d text-base font-bold text-sidebar-text">{user.kitchen?.name ?? "Sem cozinha vinculada"}</dd></div>
                                <div className="min-w-0 rounded-2xl bg-history-card-header p-4"><dt className="font-k2d text-sm text-history-muted">Situação</dt><dd className="mt-1 wrap-anywhere font-k2d text-base font-bold text-sidebar-text">{user.active ? "Ativa" : "Inativa"}</dd></div>
                                <div className="min-w-0 rounded-2xl bg-history-card-header p-4"><dt className="font-k2d text-sm text-history-muted">Conta criada</dt><dd className="mt-1 wrap-anywhere font-k2d text-base font-bold text-sidebar-text">{accountCreated}</dd></div>
                                <div className="min-w-0 rounded-2xl bg-history-card-header p-4 sm:col-span-2 xl:col-span-1 2xl:col-span-2"><dt className="font-k2d text-sm text-history-muted">Último acesso</dt><dd className="mt-1 wrap-anywhere font-k2d text-base font-bold text-sidebar-text">{lastLogin}</dd></div>
                            </dl>
                        </section>
                    </div>
                </div>
            </div>

            <dialog
                ref={removeDialogRef}
                className="m-auto max-h-dvh w-11/12 max-w-lg overflow-y-auto rounded-3xl border border-history-border bg-surface p-0 text-sidebar-text shadow-2xl backdrop:bg-black/50"
                aria-labelledby="perfil-remover-foto-titulo"
                onCancel={handleDialogCancel}
                onClose={() => setRemoveDialogOpen(false)}
            >
                <div className="flex flex-col gap-4 p-5 sm:p-6">
                    <div>
                        <h2 id="perfil-remover-foto-titulo" className="font-k2d text-xl font-bold text-sidebar-purple">Remover foto do perfil?</h2>
                        <p className="mt-2 font-k2d text-sm leading-relaxed text-history-muted">A foto será removida da sua conta. Seu avatar voltará a mostrar suas iniciais.</p>
                    </div>
                    {photoError && <Feedback severity="error">{photoError}</Feedback>}
                    <div className="flex min-w-0 flex-wrap justify-end gap-2">
                        <Button variant="icon" type="button" className="min-h-11 rounded-xl border border-history-border px-4 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header" disabled={removingPhoto} onClick={() => setRemoveDialogOpen(false)}>Cancelar</Button>
                        <Button variant="primary" type="button" className="min-h-11 rounded-xl bg-feedback-error px-4 py-2 text-sm hover:bg-feedback-error/90" disabled={removingPhoto} onClick={() => void handlePhotoRemoval()}>{removingPhoto ? "Removendo…" : "Remover foto"}</Button>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default Profile;
