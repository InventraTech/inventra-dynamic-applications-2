import { Link } from "react-router-dom";

import kitchenIcon from "../../../assets/icons/cozinha.svg";
import profileIcon from "../../../assets/icons/papel-supervisor.svg";
import statusIcon from "../../../assets/icons/aprovado.svg";
import dateIcon from "../../../assets/icons/marcador-data.svg";
import infoIcon from "../../../assets/icons/info.svg";
import lockIcon from "../../../assets/icons/senha.svg";
import type { KitchenResponse } from "../../../types/kitchen";
import KitchenSectionHeading from "./KitchenSectionHeading";

interface KitchenAboutCardProps {
    kitchen: KitchenResponse;
    roleLabel: string;
    canManage: boolean;
}

interface KitchenInformationRowProps {
    icon: string;
    label: string;
    value: string;
}

function KitchenInformationRow({ icon, label, value }: KitchenInformationRowProps) {
    return (
        <div className="flex min-w-0 items-center gap-2.5 border-b border-history-border py-2.5 last:border-b-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-login-field">
                <img src={icon} alt="" aria-hidden="true" className="size-5" />
            </span>
            <dl className="grid min-w-0 flex-1 gap-1">
                <dt className="font-k2d text-xs font-medium uppercase tracking-history-header text-history-muted">{label}</dt>
                <dd className="m-0 wrap-anywhere font-k2d text-sm font-bold leading-snug text-ink">{value}</dd>
            </dl>
            <img src={lockIcon} alt="Somente leitura" className="size-4 shrink-0" />
        </div>
    );
}

function formatCoordinate(value: number | null): string | null {
    if (value === null || !Number.isFinite(value)) return null;
    return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(value);
}

function formatCreatedAt(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Não informado";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function getKitchenStatus(kitchen: KitchenResponse): string {
    if (!kitchen.active) return "Desativada";
    return kitchen.acceptingRequests ? "Ativa · aceita pedidos" : "Ativa · não aparece na descoberta";
}

function KitchenAboutCard({ kitchen, roleLabel, canManage }: KitchenAboutCardProps) {
    const latitude = formatCoordinate(kitchen.latitude);
    const longitude = formatCoordinate(kitchen.longitude);
    const location = latitude !== null && longitude !== null ? `${latitude} · ${longitude}` : "Localização ainda não calculada";

    return (
        <section className="min-w-0 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5">
            <div className="grid gap-3">
                <KitchenSectionHeading icon={kitchenIcon} title="Sobre a cozinha" description="O Inventra define estes dados. Aqui você só consulta." />
                <div className="grid min-w-0">
                    <KitchenInformationRow icon={statusIcon} label="Situação" value={getKitchenStatus(kitchen)} />
                    <KitchenInformationRow icon={kitchenIcon} label="Localização" value={location} />
                    <KitchenInformationRow icon={profileIcon} label="Seu perfil" value={roleLabel} />
                    <KitchenInformationRow icon={dateIcon} label="Criada em" value={formatCreatedAt(kitchen.createdAt)} />
                </div>
                <div className="grid min-w-0 gap-2 rounded-2xl bg-history-card-header p-3">
                    <p className="m-0 flex min-w-0 items-start gap-2 text-sm leading-snug text-history-muted">
                        <img src={infoIcon} alt="" aria-hidden="true" className="mt-0.5 shrink-0" />
                        <span>A localização vem do endereço. Aprovar pedidos de entrada fica em Equipe e acessos.</span>
                    </p>
                    {canManage && (
                        <Link className="w-fit max-w-full font-k2d text-sm font-bold text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/equipe-acessos">
                            Ir para Equipe e acessos →
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

export default KitchenAboutCard;
