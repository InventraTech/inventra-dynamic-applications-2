import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import type { AuthUser } from "../../../types/auth";
import type { AccessRequestStatus, CreateTeamUserRequest, KitchenAccessRequest, TeamProfile, TeamUser, TeamUserFormValues } from "../../../types/teamAccess";
import { ApiError } from "../../../services/api";
import { updateSessionKitchen } from "../../../services/authSession";
import { getCurrentUser } from "../../../services/authService";
import {
    activateTeamUser,
    approveKitchenAccess,
    createTeamUser,
    deactivateTeamUser,
    getKitchenAccessRequests,
    getTeamProfiles,
    getTeamUsers,
    rejectKitchenAccess,
    updateTeamUser,
} from "../../../services/teamAccess";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import SearchField from "../../ui/SearchField";
import TeamSummary from "./TeamSummary";
import TeamProfileSummary from "./TeamProfileSummary";
import TeamUserTable from "./TeamUserTable";
import AccessRequestList from "./AccessRequestList";
import TeamLoadingSkeleton from "./TeamLoadingSkeleton";
import { RejectRequestDialog, UserAccountDialog, UserStatusDialog } from "./TeamDialogs";
import usersIcon from "../../../assets/icons/usuarios.svg";
import accessRequestIcon from "../../../assets/icons/pedido-acesso.svg";
import addIcon from "../../../assets/icons/adicionar.svg";

type TeamTab = "members" | "requests";
type UserStatusFilter = "all" | "active" | "inactive";
type RequestStatusFilter = "ALL" | AccessRequestStatus;

const emptyUsers: TeamUser[] = [];
const emptyProfiles: TeamProfile[] = [];
const emptyRequests: KitchenAccessRequest[] = [];

interface FilterButtonProps {
    selected: boolean;
    children: import("react").ReactNode;
    onClick: () => void;
}

interface TeamPageData {
    currentUser: AuthUser;
    kitchen: { id: number; name: string } | null;
    users: TeamUser[];
    profiles: TeamProfile[];
    requests: KitchenAccessRequest[];
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e se a URL está configurada.";
    return fallback;
}

function FilterButton({ selected, children, onClick }: FilterButtonProps) {
    return (
        <button
            className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 font-k2d text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none ${selected ? "border-sidebar-indicator bg-sidebar-active text-sidebar-purple" : "border-history-border bg-surface text-history-muted hover:bg-history-card-header"}`}
            type="button"
            aria-pressed={selected}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

function TeamAccessContent() {
    const [data, setData] = useState<TeamPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [tab, setTab] = useState<TeamTab>("members");
    const [query, setQuery] = useState("");
    const [userStatus, setUserStatus] = useState<UserStatusFilter>("all");
    const [profileFilter, setProfileFilter] = useState<number | null>(null);
    const [requestStatus, setRequestStatus] = useState<RequestStatusFilter>("PENDING");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
    const [userDialogError, setUserDialogError] = useState<string | null>(null);
    const [savingUser, setSavingUser] = useState(false);
    const [statusTarget, setStatusTarget] = useState<{ user: TeamUser; activate: boolean } | null>(null);
    const [statusDialogError, setStatusDialogError] = useState<string | null>(null);
    const [busyUserId, setBusyUserId] = useState<string | null>(null);
    const [rejectTarget, setRejectTarget] = useState<KitchenAccessRequest | null>(null);
    const [requestDialogError, setRequestDialogError] = useState<string | null>(null);
    const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
    const returnFocusTarget = useRef<HTMLElement | null>(null);
    const createButtonRef = useRef<HTMLButtonElement>(null);
    const tabButtons = useRef<{ members: HTMLButtonElement | null; requests: HTMLButtonElement | null }>({ members: null, requests: null });

    function selectTab(nextTab: TeamTab, moveFocus = false) {
        setTab(nextTab);
        setQuery("");
        if (moveFocus) tabButtons.current[nextTab]?.focus();
    }

    function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "Home" || event.key === "End") {
            event.preventDefault();
            const nextTab = event.key === "Home"
                ? "members"
                : event.key === "End"
                    ? "requests"
                    : tab === "members"
                        ? "requests"
                        : "members";
            selectTab(nextTab, true);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        async function loadData() {
            try {
                const currentUser = await getCurrentUser(controller.signal);
                if (controller.signal.aborted) return;

                if (!currentUser.kitchen) {
                    setData({ currentUser, kitchen: null, users: [], profiles: [], requests: [] });
                    return;
                }

                updateSessionKitchen(currentUser.kitchen);
                const [users, profiles, requests] = await Promise.all([
                    getTeamUsers(controller.signal),
                    getTeamProfiles(controller.signal),
                    getKitchenAccessRequests(controller.signal),
                ]);
                if (controller.signal.aborted) return;
                setData({ currentUser, kitchen: currentUser.kitchen, users, profiles, requests });
            } catch (error: unknown) {
                if (!controller.signal.aborted) setLoadError(getErrorMessage(error, "Não foi possível carregar a equipe. Tente novamente."));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        void loadData();
        return () => controller.abort();
    }, [reloadKey]);

    const members = data?.users ?? emptyUsers;
    const profiles = data?.profiles ?? emptyProfiles;
    const requests = data?.requests ?? emptyRequests;
    const pendingRequestCount = data ? requests.filter((request) => request.status === "PENDING").length : null;
    const activeCount = members.filter((user) => user.active).length;
    const inactiveCount = members.length - activeCount;

    // Filtragem local evita requisições repetidas: a API lista todos os usuários da cozinha atual.
    const visibleMembers = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
        return members.filter((user) => {
            const matchesQuery = !normalizedQuery || [user.name, user.email].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
            const matchesStatus = userStatus === "all" || (userStatus === "active" ? user.active : !user.active);
            const matchesProfile = profileFilter === null || user.profile.id === profileFilter;
            return matchesQuery && matchesStatus && matchesProfile;
        });
    }, [members, profileFilter, query, userStatus]);

    const visibleRequests = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
        return requests
            .filter((request) => requestStatus === "ALL" || request.status === requestStatus)
            .filter((request) => !normalizedQuery || [request.user.name, request.user.email, request.kitchen.name].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery)))
            .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
    }, [query, requestStatus, requests]);

    function retryLoad() {
        setLoadError(null);
        setLoading(true);
        setReloadKey((key) => key + 1);
    }

    function openCreateDialog(trigger?: HTMLButtonElement) {
        returnFocusTarget.current = trigger ?? createButtonRef.current;
        setEditingUser(null);
        setUserDialogError(null);
        setUserDialogOpen(true);
    }

    function openEditDialog(user: TeamUser, trigger: HTMLButtonElement) {
        returnFocusTarget.current = trigger;
        setEditingUser(user);
        setUserDialogError(null);
        setUserDialogOpen(true);
    }

    function closeUserDialog() {
        setUserDialogOpen(false);
        setEditingUser(null);
        requestAnimationFrame(() => returnFocusTarget.current?.focus());
    }

    async function saveUser(values: TeamUserFormValues) {
        if (!data?.kitchen) return;
        setSavingUser(true);
        setUserDialogError(null);
        try {
            if (editingUser) {
                const updatedUser = await updateTeamUser(editingUser.id, {
                    name: values.name.trim(),
                    profileId: Number(values.profileId),
                });
                setData((current) => current ? { ...current, users: current.users.map((user) => user.id === updatedUser.id ? updatedUser : user) } : current);
                setSuccessMessage(`Os dados de ${updatedUser.name} foram atualizados.`);
            } else {
                const request: CreateTeamUserRequest = {
                    name: values.name.trim(),
                    email: values.email.trim().toLocaleLowerCase("pt-BR"),
                    password: values.password,
                    kitchenId: data.kitchen.id,
                    profileId: Number(values.profileId),
                };
                const createdUser = await createTeamUser(request);
                setData((current) => current ? { ...current, users: [...current.users, createdUser] } : current);
                setSuccessMessage(`A conta de ${createdUser.name} foi criada.`);
            }
            closeUserDialog();
            retryLoad();
        } catch (error: unknown) {
            setUserDialogError(getErrorMessage(error, "Não foi possível salvar a conta. Confira os dados e tente novamente."));
        } finally {
            setSavingUser(false);
        }
    }

    function openStatusDialog(user: TeamUser, activate: boolean, trigger: HTMLButtonElement) {
        returnFocusTarget.current = trigger;
        setStatusDialogError(null);
        setStatusTarget({ user, activate });
    }

    function closeStatusDialog() {
        setStatusTarget(null);
        requestAnimationFrame(() => returnFocusTarget.current?.focus());
    }

    async function confirmStatusChange() {
        if (!statusTarget) return;
        const { user, activate } = statusTarget;
        setBusyUserId(user.id);
        setStatusDialogError(null);
        try {
            if (activate) await activateTeamUser(user.id);
            else await deactivateTeamUser(user.id);
            setData((current) => current ? {
                ...current,
                users: current.users.map((item) => item.id === user.id ? { ...item, active: activate } : item),
            } : current);
            setSuccessMessage(`A conta de ${user.name} foi ${activate ? "reativada" : "desativada"}.`);
            setStatusTarget(null);
            retryLoad();
        } catch (error: unknown) {
            setStatusDialogError(getErrorMessage(error, "Não foi possível atualizar a situação da conta."));
        } finally {
            setBusyUserId(null);
        }
    }

    async function approveRequest(request: KitchenAccessRequest) {
        setBusyRequestId(request.id);
        setSuccessMessage(null);
        try {
            const updatedRequest = await approveKitchenAccess(request.id);
            setData((current) => current ? { ...current, requests: current.requests.map((item) => item.id === updatedRequest.id ? updatedRequest : item) } : current);
            setSuccessMessage(`O pedido de ${request.user.name} foi aprovado e a pessoa foi vinculada à cozinha.`);
            retryLoad();
        } catch (error: unknown) {
            setLoadError(getErrorMessage(error, "Não foi possível aprovar o pedido. Atualize a lista e tente novamente."));
        } finally {
            setBusyRequestId(null);
        }
    }

    function openRejectDialog(request: KitchenAccessRequest, trigger: HTMLButtonElement) {
        returnFocusTarget.current = trigger;
        setRequestDialogError(null);
        setRejectTarget(request);
    }

    function closeRejectDialog() {
        setRejectTarget(null);
        requestAnimationFrame(() => returnFocusTarget.current?.focus());
    }

    async function confirmReject(reason: string) {
        if (!rejectTarget) return;
        setBusyRequestId(rejectTarget.id);
        setRequestDialogError(null);
        try {
            const updatedRequest = await rejectKitchenAccess(rejectTarget.id, reason || undefined);
            setData((current) => current ? { ...current, requests: current.requests.map((item) => item.id === updatedRequest.id ? updatedRequest : item) } : current);
            setSuccessMessage(`O pedido de ${rejectTarget.user.name} foi rejeitado.`);
            closeRejectDialog();
            retryLoad();
        } catch (error: unknown) {
            setRequestDialogError(getErrorMessage(error, "Não foi possível rejeitar o pedido. Atualize a lista e tente novamente."));
        } finally {
            setBusyRequestId(null);
        }
    }

    if (loading && !data) {
        return <TeamLoadingSkeleton />;
    }

    if (!data && loadError) {
        return (
            <section className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-3xl bg-surface px-5 py-10 text-center">
                <h2 className="font-k2d text-xl font-bold text-sidebar-text">Não foi possível carregar esta tela</h2>
                <Feedback severity="error" className="max-w-120 text-left">{loadError}</Feedback>
                <Button variant="primary" type="button" onClick={retryLoad}>Tentar novamente</Button>
            </section>
        );
    }

    const pendingCount = requests.filter((request) => request.status === "PENDING").length;

    return (
        <section className="flex min-w-0 flex-col gap-5 px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3" aria-busy={loading}>
            <TeamSummary memberCount={members.length} pendingRequestCount={pendingRequestCount} />

            {loadError && <Feedback severity="error">{loadError}</Feedback>}
            {successMessage && <Feedback severity="success">{successMessage}</Feedback>}
            {loading && data && <p className="font-k2d text-sm text-history-muted" role="status" aria-live="polite">Atualizando os dados…</p>}

            {!data?.kitchen ? (
                <section className="flex min-w-0 flex-col items-center gap-3 rounded-3xl bg-surface px-5 py-12 text-center shadow-history-card" aria-labelledby="cozinha-ausente-titulo">
                    <h2 id="cozinha-ausente-titulo" className="font-k2d text-xl font-bold text-sidebar-text">Sua conta ainda não está vinculada a uma cozinha</h2>
                    <p className="max-w-120 font-k2d text-sm leading-relaxed text-history-muted">Crie uma cozinha para gerenciar a equipe e receber pedidos de acesso.</p>
                    <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 py-2.5 font-k2d text-sm font-bold text-on-brand hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/cadastro/cozinha">Criar cozinha</Link>
                </section>
            ) : (
                <>
                    <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-2xl bg-surface p-1.5 shadow-history-card" role="tablist" aria-label="Visualização da equipe" onKeyDown={handleTabKeyDown}>
                            <button
                                ref={(element) => { tabButtons.current.members = element; }}
                                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2 font-k2d text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:px-4 ${tab === "members" ? "bg-brand text-on-brand shadow-history-tab" : "text-history-muted hover:bg-history-card-header"}`}
                                type="button"
                                role="tab"
                                id="equipe-tab"
                                aria-selected={tab === "members"}
                                aria-controls="equipe-panel"
                                tabIndex={tab === "members" ? 0 : -1}
                                onClick={() => selectTab("members")}
                            >
                                <img className={`size-4 ${tab === "members" ? "brightness-0 invert" : ""}`} src={usersIcon} alt="" aria-hidden="true" />
                                Equipe <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{members.length}</span>
                            </button>
                            <button
                                ref={(element) => { tabButtons.current.requests = element; }}
                                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2 font-k2d text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:px-4 ${tab === "requests" ? "bg-brand text-on-brand shadow-history-tab" : "text-history-muted hover:bg-history-card-header"}`}
                                type="button"
                                role="tab"
                                id="pedidos-tab"
                                aria-selected={tab === "requests"}
                                aria-controls="pedidos-panel"
                                tabIndex={tab === "requests" ? 0 : -1}
                                onClick={() => selectTab("requests")}
                            >
                                <img className={`size-4 ${tab === "requests" ? "brightness-0 invert" : ""}`} src={accessRequestIcon} alt="" aria-hidden="true" />
                                Pedidos de acesso <span className="rounded-full bg-login-gold px-2 py-0.5 text-xs text-brand-strong">{pendingCount}</span>
                            </button>
                        </div>
                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                            <SearchField
                                className="min-w-0 flex-1 sm:w-64"
                                label={tab === "members" ? "Buscar pessoas da equipe" : "Buscar pedidos de acesso"}
                                placeholder="Buscar por nome ou e-mail"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                            {tab === "members" && (
                                <Button
                                    ref={createButtonRef}
                                    variant="primary"
                                    type="button"
                                    className="min-h-11 shrink-0 rounded-full px-4 py-2.5 font-k2d text-sm"
                                    onClick={(event) => openCreateDialog(event.currentTarget)}
                                >
                                    <img className="mr-2 size-4 brightness-0 invert" src={addIcon} alt="" aria-hidden="true" />
                                    Criar usuário
                                </Button>
                            )}
                        </div>
                    </div>

                    <div id="equipe-panel" role="tabpanel" aria-labelledby="equipe-tab" tabIndex={0} hidden={tab !== "members"}>
                        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)]">
                            <div className="flex min-w-0 flex-col gap-3">
                                <div className="flex min-w-0 flex-wrap items-center gap-2" role="group" aria-label="Filtrar pessoas">
                                    <FilterButton selected={userStatus === "all"} onClick={() => setUserStatus("all")}>Todos <span>{members.length}</span></FilterButton>
                                    <FilterButton selected={userStatus === "active"} onClick={() => setUserStatus("active")}>Ativos <span>{activeCount}</span></FilterButton>
                                    <FilterButton selected={userStatus === "inactive"} onClick={() => setUserStatus("inactive")}>Inativos <span>{inactiveCount}</span></FilterButton>
                                    {profiles.length > 0 && <span className="mx-1 hidden h-7 w-px bg-history-border sm:block" aria-hidden="true" />}
                                    {profiles.map((profile) => (
                                        <FilterButton selected={profileFilter === profile.id} onClick={() => setProfileFilter(profileFilter === profile.id ? null : profile.id)} key={profile.id}>
                                            {profile.accessType.replaceAll("_", " ")}
                                        </FilterButton>
                                    ))}
                                </div>
                                <TeamUserTable
                                    users={visibleMembers}
                                    allUsers={members}
                                    profiles={profiles}
                                    currentUserId={data.currentUser.id}
                                    busyUserId={busyUserId}
                                    onEdit={openEditDialog}
                                    onChangeStatus={openStatusDialog}
                                />
                            </div>
                            <TeamProfileSummary profiles={profiles} users={members} />
                        </div>
                    </div>
                    <div id="pedidos-panel" role="tabpanel" aria-labelledby="pedidos-tab" tabIndex={0} hidden={tab !== "requests"}>
                        <section className="flex min-w-0 flex-col gap-4" aria-labelledby="pedidos-acesso-titulo">
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 id="pedidos-acesso-titulo" className="font-k2d text-lg font-bold text-sidebar-text">Pedidos da cozinha</h2>
                                    <p className="mt-1 font-k2d text-sm text-history-muted">Aprove ou rejeite pedidos de entrada enviados pelos usuários.</p>
                                </div>
                                <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar pedidos">
                                    {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((status) => {
                                        const labels: Record<RequestStatusFilter, string> = { PENDING: "Pendentes", APPROVED: "Aprovados", REJECTED: "Rejeitados", ALL: "Todos" };
                                        const count = status === "ALL" ? requests.length : requests.filter((request) => request.status === status).length;
                                        return <FilterButton selected={requestStatus === status} onClick={() => setRequestStatus(status)} key={status}>{labels[status]} <span>{count}</span></FilterButton>;
                                    })}
                                </div>
                            </div>
                            <AccessRequestList requests={visibleRequests} busyRequestId={busyRequestId} onApprove={approveRequest} onReject={openRejectDialog} />
                        </section>
                    </div>
                </>
            )}

            {userDialogOpen && <UserAccountDialog
                open={userDialogOpen}
                user={editingUser}
                profiles={profiles}
                saving={savingUser}
                error={userDialogError}
                onClose={closeUserDialog}
                onSave={saveUser}
            />}
            <UserStatusDialog
                open={Boolean(statusTarget)}
                user={statusTarget?.user ?? null}
                activate={statusTarget?.activate ?? false}
                busy={Boolean(statusTarget && busyUserId === statusTarget.user.id)}
                error={statusDialogError}
                onClose={closeStatusDialog}
                onConfirm={confirmStatusChange}
            />
            {rejectTarget && <RejectRequestDialog
                open={Boolean(rejectTarget)}
                request={rejectTarget}
                busy={Boolean(rejectTarget && busyRequestId === rejectTarget.id)}
                error={requestDialogError}
                onClose={closeRejectDialog}
                onConfirm={confirmReject}
            />}
        </section>
    );
}

export default TeamAccessContent;
