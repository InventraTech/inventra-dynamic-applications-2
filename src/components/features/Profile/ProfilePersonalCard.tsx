import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type SyntheticEvent } from "react";

import type { UserAccount } from "../../../types/auth";
import accountIcon from "../../../assets/icons/conta.svg";
import infoIcon from "../../../assets/icons/info.svg";
import { removeCurrentUserPhoto, updateUserName, uploadCurrentUserPhoto } from "../../../services/userService";
import { updateSessionUser } from "../../../services/authSession";
import { validateProfileName, validateProfilePhoto } from "../../../utils/profileValidation";
import { focusFirstInvalidField } from "../../../utils/formAccessibility";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import Input from "../../ui/Input";
import UserAvatar from "../../ui/UserAvatar";
import { getProfileErrorMessage } from "./profileHelpers";

interface ProfilePersonalCardProps {
    user: UserAccount;
    onUserUpdated: (user: UserAccount) => void;
}

function ProfilePersonalCard({ user, onUserUpdated }: ProfilePersonalCardProps) {
    const [name, setName] = useState(user.name);
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameSuccess, setNameSuccess] = useState<string | null>(null);
    const [savingName, setSavingName] = useState(false);
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

    useEffect(() => setName(user.name), [user.name]);

    useEffect(() => () => {
        if (photoPreviewUrlRef.current) URL.revokeObjectURL(photoPreviewUrlRef.current);
    }, []);

    useEffect(() => {
        const dialog = removeDialogRef.current;
        if (!dialog) return;
        if (removeDialogOpen && !dialog.open) dialog.showModal();
        if (!removeDialogOpen && dialog.open) dialog.close();
    }, [removeDialogOpen]);

    function updatePhotoPreview(file: File | null) {
        if (photoPreviewUrlRef.current) URL.revokeObjectURL(photoPreviewUrlRef.current);
        photoPreviewUrlRef.current = file ? URL.createObjectURL(file) : null;
        setPhotoPreviewUrl(photoPreviewUrlRef.current);
    }

    async function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (savingName) return;
        const validationError = validateProfileName(name);
        if (validationError) {
            setNameError(validationError);
            setNameSuccess(null);
            focusFirstInvalidField(event.currentTarget);
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
            updateSessionUser(updatedUser);
            onUserUpdated(updatedUser);
            setNameSuccess("Nome atualizado com sucesso.");
        } catch (error: unknown) {
            setNameError(getProfileErrorMessage(error, "Não foi possível atualizar seu nome. Tente novamente."));
        } finally {
            setSavingName(false);
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
            updateSessionUser(updatedUser);
            onUserUpdated(updatedUser);
            setSelectedPhoto(null);
            updatePhotoPreview(null);
            setPhotoSuccess("Foto de perfil atualizada com sucesso.");
        } catch (error: unknown) {
            setPhotoError(getProfileErrorMessage(error, "Não foi possível enviar sua foto. Tente novamente."));
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
            updateSessionUser(updatedUser);
            onUserUpdated(updatedUser);
            setSelectedPhoto(null);
            updatePhotoPreview(null);
            setPhotoSuccess("Foto removida. Suas iniciais serão exibidas no lugar dela.");
            setRemoveDialogOpen(false);
        } catch (error: unknown) {
            setPhotoError(getProfileErrorMessage(error, "Não foi possível remover sua foto. Tente novamente."));
        } finally {
            setRemovingPhoto(false);
        }
    }

    function handleDialogCancel(event: SyntheticEvent<HTMLDialogElement>) {
        event.preventDefault();
        setRemoveDialogOpen(false);
    }

    function discardNameChanges() {
        setName(user.name);
        setNameError(null);
        setNameSuccess(null);
    }

    function discardPhotoSelection() {
        setSelectedPhoto(null);
        updatePhotoPreview(null);
        setPhotoError(null);
        setPhotoSuccess(null);
    }

    return (
        <>
            <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-labelledby="perfil-dados-titulo" aria-busy={savingName || savingPhoto || removingPhoto}>
                <header className="flex min-w-0 items-center gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-history-avatar">
                        <img className="size-6" src={accountIcon} alt="" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 id="perfil-dados-titulo" className="font-k2d text-xl font-bold text-sidebar-text">Seus dados</h2>
                        <p className="font-k2d text-sm leading-relaxed text-history-muted">É assim que o seu time te vê no Inventra.</p>
                    </div>
                </header>

                <div className="mt-5 grid min-w-0 gap-5 sm:grid-cols-[7rem_minmax(0,1fr)] large-text:grid-cols-1">
                    <div className="flex min-w-0 flex-row items-center gap-4 sm:flex-col sm:items-center">
                        <div className="flex shrink-0 flex-col items-center gap-1">
                            <UserAvatar
                                className="size-20 rounded-3xl bg-brand text-2xl text-on-brand"
                                name={user.name}
                                photoUrl={photoPreviewUrl ?? user.photoUrl}
                                alt={photoPreviewUrl ? "Prévia da nova foto de perfil" : user.photoUrl ? `Foto de perfil de ${user.name}` : `Iniciais de ${user.name}`}
                            />
                            <p className="font-k2d text-xs text-history-muted">{user.photoUrl || photoPreviewUrl ? "Foto do perfil" : "Suas iniciais"}</p>
                        </div>
                        <div className="flex min-w-0 flex-wrap gap-2 sm:w-full sm:flex-col">
                            <input
                                ref={photoInputRef}
                                className="sr-only"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                                onChange={handlePhotoSelection}
                                aria-label="Selecionar arquivo de foto de perfil"
                            />
                            <Button
                                variant="outline"
                                type="button"
                                className="min-h-11 px-2 text-xs sm:w-full"
                                disabled={savingPhoto || removingPhoto}
                                onClick={() => photoInputRef.current?.click()}
                            >
                                {selectedPhoto ? "Escolher outra" : user.photoUrl ? "Alterar foto" : "Adicionar foto"}
                            </Button>
                            {selectedPhoto && (
                                <>
                                    <Button variant="standard" type="button" className="min-h-11 px-2 text-xs sm:w-full" disabled={savingPhoto} onClick={() => void handlePhotoUpload()}>
                                        {savingPhoto ? "Enviando…" : "Salvar foto"}
                                    </Button>
                                    <Button variant="ghost" type="button" className="min-h-11 px-2 text-xs text-sidebar-purple sm:w-full" disabled={savingPhoto} onClick={discardPhotoSelection}>
                                        Cancelar seleção
                                    </Button>
                                </>
                            )}
                            {user.photoUrl && !selectedPhoto && (
                                <Button variant="subtle-danger" type="button" className="min-h-11 px-2 text-xs sm:w-full" disabled={removingPhoto || savingPhoto} onClick={() => setRemoveDialogOpen(true)}>
                                    Remover foto
                                </Button>
                            )}
                        </div>
                    </div>

                    <form className="flex min-w-0 flex-col gap-4" onSubmit={(event) => void handleNameSubmit(event)} aria-busy={savingName}>
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className="font-k2d text-sm font-bold text-sidebar-text" htmlFor="perfil-nome">Nome completo</label>
                            <Input
                                id="perfil-nome"
                                name="name"
                                autoComplete="name"
                                maxLength={120}
                                required
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setNameError(null);
                                    setNameSuccess(null);
                                }}
                                aria-invalid={Boolean(nameError)}
                                aria-describedby={nameError ? "perfil-nome-erro" : "perfil-nome-ajuda"}
                            />
                            {nameError && <p id="perfil-nome-erro" className="font-k2d text-sm text-feedback-error" role="alert">{nameError}</p>}
                            <p id="perfil-nome-ajuda" className="font-k2d text-xs leading-relaxed text-history-muted">O nome novo aparece na barra de cima assim que você salvar.</p>
                        </div>

                        <div className="flex min-w-0 items-start gap-2 rounded-xl bg-history-card-header px-3 py-2 font-k2d text-sm leading-relaxed text-history-muted">
                            <img className="mt-0.5 size-4 shrink-0" src={infoIcon} alt="" aria-hidden="true" />
                            <p>Quando não houver foto, suas iniciais acompanham o nome.</p>
                        </div>

                        {photoError && <Feedback severity="error">{photoError}</Feedback>}
                        {photoSuccess && <Feedback severity="success">{photoSuccess}</Feedback>}
                        {nameSuccess && <Feedback severity="success">{nameSuccess}</Feedback>}
                        {savingPhoto && <p className="sr-only" role="status" aria-live="polite">Enviando foto de perfil…</p>}
                        {removingPhoto && <p className="sr-only" role="status" aria-live="polite">Removendo foto de perfil…</p>}
                        {savingName && <p className="sr-only" role="status" aria-live="polite">Salvando seu nome…</p>}

                        <div className="flex min-w-0 flex-col gap-3 border-t border-history-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-k2d text-sm leading-relaxed text-history-muted">Mudou o nome? É só salvar. O e-mail continua o mesmo.</p>
                            <div className="flex min-w-0 flex-wrap gap-2 sm:shrink-0">
                                <Button variant="outline" type="button" className="min-h-11 flex-1 sm:flex-none" disabled={savingName || name === user.name} onClick={discardNameChanges}>
                                    Descartar
                                </Button>
                                <Button variant="standard" type="submit" className="min-h-11 flex-1 sm:flex-none" disabled={savingName || name.trim() === user.name}>
                                    {savingName ? "Salvando…" : "Salvar nome"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            <dialog
                ref={removeDialogRef}
                className="m-auto max-h-dvh w-11/12 max-w-lg overflow-y-auto rounded-3xl border border-history-border bg-surface p-0 text-sidebar-text shadow-2xl backdrop:bg-black/50"
                aria-labelledby="perfil-remover-foto-titulo"
                aria-describedby="perfil-remover-foto-descricao"
                onCancel={handleDialogCancel}
                onClose={() => setRemoveDialogOpen(false)}
            >
                <div className="flex flex-col gap-4 p-5 sm:p-6">
                    <div>
                        <h2 id="perfil-remover-foto-titulo" className="font-k2d text-xl font-bold text-sidebar-purple">Remover foto do perfil?</h2>
                        <p id="perfil-remover-foto-descricao" className="mt-2 font-k2d text-sm leading-relaxed text-history-muted">A foto será removida da sua conta. Seu avatar voltará a mostrar suas iniciais.</p>
                    </div>
                    <div className="flex min-w-0 flex-wrap justify-end gap-2">
                        <Button variant="outline" type="button" autoFocus disabled={removingPhoto} onClick={() => setRemoveDialogOpen(false)}>Cancelar</Button>
                        <Button variant="danger" type="button" disabled={removingPhoto} onClick={() => void handlePhotoRemoval()}>{removingPhoto ? "Removendo…" : "Remover foto"}</Button>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default ProfilePersonalCard;
