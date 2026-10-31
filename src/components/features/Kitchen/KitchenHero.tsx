import kitchenAvatar from "../../../assets/icons/cozinha-supervisor.svg";
import kitchenHexagon from "../../../assets/images/hexagono-cozinha.svg";
import type { KitchenResponse } from "../../../types/kitchen";

interface KitchenHeroProps {
    kitchen: KitchenResponse;
    roleLabel: string;
}

function KitchenHero({ kitchen, roleLabel }: KitchenHeroProps) {
    return (
        <section className="relative isolate flex min-h-48 min-w-0 flex-wrap items-center gap-5 overflow-hidden rounded-4xl bg-linear-to-r from-brand-strong via-brand to-brand px-5 py-6 text-on-brand shadow-history-card sm:gap-7 sm:px-8 sm:py-8">
            <img src={kitchenHexagon} alt="" aria-hidden="true" className="pointer-events-none absolute -top-7 right-14 -z-10 opacity-90 max-sm:right-0" />
            <img src={kitchenAvatar} alt="" aria-hidden="true" className="shrink-0" />
            <div className="relative z-10 grid min-w-0 flex-1 gap-2.5">
                <h2 className="m-0 wrap-anywhere font-k2d text-2xl font-bold leading-tight text-on-brand sm:text-3xl">{kitchen.name}</h2>
                <p className="m-0 max-w-3xl text-sm leading-relaxed text-on-brand/85 sm:text-base">
                    Aqui ficam os dados e o código de convite. Quem é supervisor edita; o restante da equipe consulta.
                </p>
                <div className="mt-1 flex min-w-0 flex-wrap gap-2.5">
                    <span className="inline-flex min-h-10 max-w-full items-center gap-2.5 rounded-full bg-brand-strong/70 px-4 py-2 font-k2d text-sm font-bold text-on-brand sm:text-base">
                        <span className="size-2.5 shrink-0 rounded-full bg-login-gold" aria-hidden="true" />
                        {kitchen.active ? "Cozinha ativa" : "Cozinha desativada"}
                    </span>
                    <span className="inline-flex min-h-10 max-w-full items-center gap-2.5 rounded-full bg-brand-strong/70 px-4 py-2 font-k2d text-sm font-bold text-on-brand sm:text-base">
                        <span className="size-2.5 shrink-0 rounded-full bg-login-gold" aria-hidden="true" />
                        {roleLabel}
                    </span>
                </div>
            </div>
        </section>
    );
}

export default KitchenHero;
