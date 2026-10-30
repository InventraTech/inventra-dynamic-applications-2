import type { UserAccount } from "../../../types/auth";
import emailIcon from "../../../assets/icons/email.svg";
import kitchenIcon from "../../../assets/icons/cozinha.svg";
import roleIcon from "../../../assets/icons/papel-supervisor.svg";
import dateIcon from "../../../assets/icons/marcador-data.svg";
import lockIcon from "../../../assets/icons/senha.svg";
import { Link } from "react-router-dom";
import { displayProfileRole, formatProfileDate } from "./profileHelpers";

interface ProfileAccountCardProps {
    user: UserAccount;
}

function ProfileAccountCard({ user }: ProfileAccountCardProps) {
    const role = displayProfileRole(user.profile?.accessType);
    const isSupervisor = user.profile?.accessType?.toLocaleUpperCase("pt-BR") === "SUPERVISOR";
    const accountItems = [
        { label: "E-mail", icon: emailIcon, value: user.email },
        { label: "Cozinha", icon: kitchenIcon, value: user.kitchen?.name ?? "Sem cozinha vinculada" },
        { label: "Perfil de acesso", icon: roleIcon, value: role },
        { label: "Conta criada em", icon: dateIcon, value: formatProfileDate(user.createdAt) },
    ];

    return (
        <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-labelledby="perfil-conta-titulo">
            <h2 id="perfil-conta-titulo" className="font-k2d text-lg font-bold text-sidebar-text">Sua conta</h2>
            <p className="mt-1 font-k2d text-sm leading-relaxed text-history-muted">Dados vinculados à sua conta. Aqui você só consulta.</p>

            <dl className="mt-4 min-w-0 divide-y divide-history-border">
                {accountItems.map(({ label, icon, value }) => (
                    <div key={label} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-history-avatar">
                            <img className="size-5" src={icon} alt="" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <dt className="font-k2d text-xs font-bold uppercase tracking-wide text-history-muted">{label}</dt>
                            <dd className="mt-0.5 wrap-anywhere font-k2d text-sm font-bold text-sidebar-text">{value}</dd>
                        </div>
                        <img className="size-4 shrink-0 opacity-60" src={lockIcon} alt="" aria-hidden="true" />
                    </div>
                ))}
            </dl>

            <div className="mt-4 rounded-2xl bg-history-card-header p-3">
                <p className="font-k2d text-xs leading-relaxed text-history-muted">O e-mail é fixo. Cozinha e perfil de acesso são gerenciados pela equipe da cozinha.</p>
                {isSupervisor
                    ? <Link className="mt-2 inline-flex min-h-11 items-center font-k2d text-sm font-bold text-sidebar-purple underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/equipe-acessos">Ir para Equipe e acessos <span aria-hidden="true" className="ml-1">→</span></Link>
                    : <p className="mt-2 font-k2d text-xs leading-relaxed text-history-muted">Para alterar esses dados, peça ajuda ao supervisor da cozinha.</p>}
            </div>
        </section>
    );
}

export default ProfileAccountCard;
