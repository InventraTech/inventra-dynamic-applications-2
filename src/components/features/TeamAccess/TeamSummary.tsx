import teamIcon from "../../../assets/icons/equipe.svg";
import teamMascot from "../../../assets/images/equipe-mascote.svg";
import teamHexagon from "../../../assets/images/equipe-hexagono.svg";

interface TeamSummaryProps {
    memberCount: number;
    pendingRequestCount: number | null;
}

function TeamSummary({ memberCount, pendingRequestCount }: TeamSummaryProps) {
    return (
        <section
            aria-labelledby="resumo-equipe-titulo"
            className="relative isolate flex min-h-36 min-w-0 items-center gap-5 overflow-hidden rounded-3xl bg-linear-to-br from-brand-strong to-brand px-5 py-5 text-on-brand shadow-history-card sm:px-8"
        >
            <img className="size-14 shrink-0 object-contain sm:size-20" src={teamIcon} alt="" aria-hidden="true" />
            <div className="relative z-10 min-w-0 flex-1">
                <h2 id="resumo-equipe-titulo" className="wrap-anywhere font-k2d text-2xl font-bold leading-tight sm:text-3xl">
                    Sua equipe, sua cozinha.
                </h2>
                <p className="mt-1 max-w-prose wrap-anywhere font-k2d text-sm text-login-copy sm:text-base">
                    Crie contas, ajuste acessos e decida quem entra na cozinha.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Resumo da equipe">
                    <li className="inline-flex min-h-9 items-center gap-2 rounded-full bg-brand-strong px-3.5 py-2 font-k2d text-sm font-bold text-on-brand">
                        <span className="size-2 shrink-0 rounded-full bg-login-gold" aria-hidden="true" />
                        {memberCount} {memberCount === 1 ? "pessoa na equipe" : "pessoas na equipe"}
                    </li>
                    <li className="inline-flex min-h-9 items-center gap-2 rounded-full bg-login-gold px-3.5 py-2 font-k2d text-sm font-bold text-brand-strong">
                        <span className="size-2 shrink-0 rounded-full bg-brand-strong" aria-hidden="true" />
                        {pendingRequestCount === null
                            ? "Carregando pedidos…"
                            : `${pendingRequestCount} ${pendingRequestCount === 1 ? "pedido pendente" : "pedidos pendentes"}`}
                    </li>
                </ul>
            </div>
            <div className="relative hidden h-28 w-36 shrink-0 items-center justify-center sm:flex" aria-hidden="true">
                <img className="absolute inset-y-0 right-0 h-full w-36 object-contain opacity-60" src={teamHexagon} alt="" />
                <img className="relative z-10 h-24 w-28 object-contain" src={teamMascot} alt="" />
            </div>
        </section>
    );
}

export default TeamSummary;
