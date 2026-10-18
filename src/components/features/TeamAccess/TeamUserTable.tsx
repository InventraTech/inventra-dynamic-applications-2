import type { TeamProfile, TeamUser } from "../../../types/teamAccess";
import Button from "../../ui/Button";
import editIcon from "../../../assets/icons/editar.svg";
import activateIcon from "../../../assets/icons/ativar-usuario.svg";
import deactivateIcon from "../../../assets/icons/desativar-usuario.svg";
import supervisorAvatar from "../../../assets/images/avatar-supervisor.svg";
import stockkeeperAvatar from "../../../assets/images/avatar-estoquista.svg";
import buyerAvatar from "../../../assets/images/avatar-comprador.svg";
import inactiveAvatar from "../../../assets/images/avatar-inativo.svg";
import supervisorRoleIcon from "../../../assets/icons/papel-supervisor.svg";
import stockkeeperRoleIcon from "../../../assets/icons/papel-estoquista.svg";
import buyerRoleIcon from "../../../assets/icons/papel-comprador.svg";
import genericRoleIcon from "../../../assets/icons/conta.svg";

interface TeamUserTableProps {
    users: TeamUser[];
    allUsers: TeamUser[];
    profiles: TeamProfile[];
    currentUserId: string | undefined;
    busyUserId: string | null;
    onEdit: (user: TeamUser, trigger: HTMLButtonElement) => void;
    onChangeStatus: (user: TeamUser, active: boolean, trigger: HTMLButtonElement) => void;
}

function initials(name: string): string {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => [...part][0]?.toLocaleUpperCase("pt-BR") ?? "").join("");
}

function profileName(profile: Pick<TeamProfile, "accessType"> | undefined): string {
    if (!profile) return "Perfil indisponível";
    const names: Record<string, string> = { SUPERVISOR: "Supervisor", ESTOQUISTA: "Estoquista", COMPRADOR: "Comprador" };
    const normalized = profile.accessType.toLocaleUpperCase("pt-BR");
    return names[normalized] ?? profile.accessType.replaceAll("_", " ").toLocaleLowerCase("pt-BR").replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function profileAvatar(profile: Pick<TeamProfile, "accessType"> | undefined, active: boolean): string {
    if (!active) return inactiveAvatar;
    const accessType = profile?.accessType.toLocaleUpperCase("pt-BR");
    if (accessType === "SUPERVISOR") return supervisorAvatar;
    if (accessType === "ESTOQUISTA") return stockkeeperAvatar;
    if (accessType === "COMPRADOR") return buyerAvatar;
    return supervisorAvatar;
}

function profileIcon(profile: Pick<TeamProfile, "accessType"> | undefined): string {
    const accessType = profile?.accessType.toLocaleUpperCase("pt-BR");
    if (accessType === "SUPERVISOR") return supervisorRoleIcon;
    if (accessType === "ESTOQUISTA") return stockkeeperRoleIcon;
    if (accessType === "COMPRADOR") return buyerRoleIcon;
    return genericRoleIcon;
}

function formatLastLogin(value: string | null): string {
    if (!value) return "Nunca entrou";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Data indisponível";
    const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return `Hoje, ${time}`;
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return `Ontem, ${time}`;
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

function TeamUserTable({ users, allUsers, profiles, currentUserId, busyUserId, onEdit, onChangeStatus }: TeamUserTableProps) {
    const activeSupervisors = allUsers.filter((user) => user.active && user.profile.accessType.toLocaleUpperCase("pt-BR") === "SUPERVISOR").length;

    return (
        <section className="min-w-0 rounded-3xl bg-surface p-3 shadow-history-card sm:p-5" aria-labelledby="lista-equipe-titulo">
            <h2 id="lista-equipe-titulo" className="sr-only">Pessoas da cozinha</h2>
            <p id="lista-equipe-resumo" className="mb-3 px-2 font-k2d text-sm text-history-muted">
                Mostrando {users.length} {users.length === 1 ? "pessoa" : "pessoas"}.
            </p>
            {users.length === 0 ? (
                <p className="rounded-2xl bg-history-card-header px-4 py-10 text-center font-k2d text-history-muted" role="status">
                    Nenhuma pessoa corresponde aos filtros selecionados.
                </p>
            ) : (
                <div className="min-w-0 overflow-x-auto rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" tabIndex={0} role="region" aria-label="Lista de pessoas. Deslize horizontalmente para ver todos os dados.">
                    <table className="w-full min-w-180 border-collapse text-left font-k2d">
                        <caption className="sr-only">Usuários vinculados à cozinha e ações disponíveis para cada conta</caption>
                        <thead className="bg-history-card-header text-xs uppercase tracking-wide text-history-muted">
                            <tr>
                                <th className="rounded-l-xl px-3 py-3 font-bold" scope="col">Pessoa</th>
                                <th className="px-3 py-3 font-bold" scope="col">Perfil</th>
                                <th className="px-3 py-3 font-bold" scope="col">Situação</th>
                                <th className="px-3 py-3 font-bold" scope="col">Último acesso</th>
                                <th className="rounded-r-xl px-3 py-3 text-right font-bold" scope="col">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const profile = profiles.find((item) => item.id === user.profile.id) ?? user.profile;
                                const isSelf = user.id === currentUserId;
                                const isLastActiveSupervisor = user.active
                                    && user.profile.accessType.toLocaleUpperCase("pt-BR") === "SUPERVISOR"
                                    && activeSupervisors <= 1;
                                const statusActionLabel = user.active ? "Desativar" : "Reativar";
                                const unavailableReason = isSelf && user.active
                                    ? "Você não pode desativar a própria conta."
                                    : isLastActiveSupervisor
                                        ? "A cozinha precisa manter pelo menos um supervisor ativo."
                                        : "";

                                return (
                                    <tr className={`border-b border-history-border last:border-0 ${user.active ? "" : "text-history-muted"}`} key={user.id}>
                                        <th className="px-3 py-3 text-left font-normal" scope="row">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="relative flex h-10 w-8 shrink-0 items-center justify-center font-k2d text-xs font-bold text-sidebar-purple" aria-hidden="true">
                                                    <img className="absolute inset-0 size-full" src={profileAvatar(profile, user.active)} alt="" />
                                                    <span className="relative">{initials(user.name) || "?"}</span>
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block max-w-60 wrap-anywhere font-k2d text-sm font-bold text-sidebar-text">{user.name}</span>
                                                    {isSelf && <span className="mt-1 inline-flex rounded-full bg-sidebar-active px-2 py-0.5 font-k2d text-xs font-bold text-sidebar-purple">Você</span>}
                                                    <span className="block max-w-60 wrap-anywhere font-k2d text-xs text-history-muted">{user.email}</span>
                                                </span>
                                            </div>
                                        </th>
                                        <td className="px-3 py-3">
                                            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-sidebar-line bg-sidebar-active px-3 py-1 font-k2d text-xs font-bold text-sidebar-purple">
                                                <img className="size-4 shrink-0" src={profileIcon(profile)} alt="" aria-hidden="true" />
                                                {profileName(profile)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-k2d text-xs font-bold ${user.active ? "bg-feedback-success-bg text-feedback-success" : "bg-history-card-header text-history-muted"}`}>
                                                <span className={`size-2 rounded-full ${user.active ? "bg-feedback-success" : "bg-history-muted"}`} aria-hidden="true" />
                                                {user.active ? "Ativo" : "Inativo"}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 font-k2d text-sm text-history-muted">{formatLastLogin(user.lastLogin)}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="icon"
                                                    type="button"
                                                    className="size-10 rounded-xl bg-sidebar-active text-sidebar-purple hover:bg-sidebar-line focus-visible:outline-focus disabled:cursor-wait disabled:opacity-60"
                                                    aria-label={`Editar ${user.name}`}
                                                    title={`Editar ${user.name}`}
                                                    disabled={busyUserId === user.id}
                                                    onClick={(event) => onEdit(user, event.currentTarget)}
                                                >
                                                    <img className="size-4.5" src={editIcon} alt="" aria-hidden="true" />
                                                </Button>
                                                <Button
                                                    variant="icon"
                                                    type="button"
                                                    className={`size-10 rounded-xl border bg-surface focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 ${user.active ? "border-feedback-error/40 text-feedback-error hover:bg-feedback-error-bg" : "border-feedback-success/40 text-feedback-success hover:bg-feedback-success-bg"}`}
                                                    aria-label={`${statusActionLabel} ${user.name}`}
                                                    title={unavailableReason || `${statusActionLabel} ${user.name}`}
                                                    aria-describedby={unavailableReason ? `restricao-${user.id}` : undefined}
                                                    disabled={busyUserId === user.id || Boolean(unavailableReason)}
                                                    onClick={(event) => onChangeStatus(user, !user.active, event.currentTarget)}
                                                >
                                                    <img className="size-4.5" src={user.active ? deactivateIcon : activateIcon} alt="" aria-hidden="true" />
                                                </Button>
                                                {unavailableReason && <span className="sr-only" id={`restricao-${user.id}`}>{unavailableReason}</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default TeamUserTable;
