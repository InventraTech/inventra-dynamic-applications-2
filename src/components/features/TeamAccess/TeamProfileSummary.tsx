import type { TeamProfile, TeamUser } from "../../../types/teamAccess";
import buyerIcon from "../../../assets/icons/perfil-comprador.svg";
import stockkeeperIcon from "../../../assets/icons/perfil-estoquista.svg";
import supervisorIcon from "../../../assets/icons/perfil-supervisor.svg";
import profileIcon from "../../../assets/icons/conta.svg";
import Mascot from "../../ui/Mascot";

interface TeamProfileSummaryProps {
    profiles: TeamProfile[];
    users: TeamUser[];
}

function getProfileLabel(accessType: string): string {
    const knownLabels: Record<string, string> = {
        SUPERVISOR: "Supervisor",
        ESTOQUISTA: "Estoquista",
        COMPRADOR: "Comprador",
    };
    const normalized = accessType.toLocaleUpperCase("pt-BR");
    if (knownLabels[normalized]) return knownLabels[normalized];
    return accessType.replaceAll("_", " ").toLocaleLowerCase("pt-BR").replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function getProfileIcon(accessType: string): string {
    const normalized = accessType.toLocaleUpperCase("pt-BR");
    if (normalized === "SUPERVISOR") return supervisorIcon;
    if (normalized === "ESTOQUISTA") return stockkeeperIcon;
    if (normalized === "COMPRADOR") return buyerIcon;
    return profileIcon;
}

function TeamProfileSummary({ profiles, users }: TeamProfileSummaryProps) {
    return (
        <aside className="flex min-w-0 flex-col gap-4" aria-label="Resumo dos perfis">
            <section className="rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-labelledby="perfis-equipe-titulo">
                <h2 id="perfis-equipe-titulo" className="font-k2d text-lg font-bold text-sidebar-text">Perfis da equipe</h2>
                <p className="mt-1 font-k2d text-sm text-history-muted">O que cada acesso pode fazer.</p>
                <ul className="mt-3 divide-y divide-history-border">
                    {profiles.map((profile) => {
                        const count = users.filter((user) => user.profile.id === profile.id).length;
                        return (
                            <li className="flex min-w-0 items-center gap-3 py-3" key={profile.id}>
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-login-field">
                                    <img className="size-6 object-contain" src={getProfileIcon(profile.accessType)} alt="" aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block wrap-anywhere font-k2d text-base font-bold text-sidebar-text">{getProfileLabel(profile.accessType)}</span>
                                    {profile.description && <span className="mt-0.5 block wrap-anywhere font-k2d text-sm text-history-muted">{profile.description}</span>}
                                </span>
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-active font-k2d text-sm font-bold text-sidebar-indicator" aria-label={`${count} ${count === 1 ? "pessoa" : "pessoas"}`}>
                                    {count}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </section>
            <div className="flex min-w-0 items-center gap-3 rounded-3xl border border-sidebar-line bg-sidebar-active px-4 py-4">
                <Mascot size="compacto" className="max-w-14 shrink-0" />
                <div className="min-w-0">
                    <h2 className="wrap-anywhere font-k2d text-sm font-bold text-sidebar-text">Conta nova nasce na hora</h2>
                    <p className="mt-1 wrap-anywhere font-k2d text-sm leading-relaxed text-history-muted">
                        Não enviamos convite por e-mail. Defina uma senha inicial e compartilhe-a com a pessoa por um canal seguro.
                    </p>
                </div>
            </div>
        </aside>
    );
}

export default TeamProfileSummary;
