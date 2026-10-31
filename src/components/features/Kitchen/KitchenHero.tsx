import kitchenAvatar from "../../../assets/icons/cozinha-supervisor.svg";
import kitchenHexagon from "../../../assets/images/hexagono-cozinha.svg";
import type { KitchenResponse } from "../../../types/kitchen";

interface KitchenHeroProps {
    kitchen: KitchenResponse;
    roleLabel: string;
}

function KitchenHero({ kitchen, roleLabel }: KitchenHeroProps) {
    return (
        <section className="relative isolate flex min-h-40 min-w-0 flex-wrap items-center gap-4 overflow-hidden rounded-3xl bg-linear-to-r from-brand-strong via-brand to-brand px-4 py-4 text-on-brand shadow-history-card sm:gap-5 sm:px-6 sm:py-5">
            <img src={kitchenHexagon} alt="" aria-hidden="true" className="pointer-events-none absolute -top-7 right-14 -z-10 opacity-90 max-sm:right-0" />
            <img src={kitchenAvatar} alt="" aria-hidden="true" className="size-14 shrink-0 object-contain sm:size-16" />
            <div className="relative z-10 grid min-w-0 flex-1 gap-2">
                <h2 className="m-0 wrap-anywhere font-k2d text-xl font-bold leading-tight text-on-brand sm:text-2xl">{kitchen.name}</h2>
                <p className="m-0 max-w-3xl text-sm leading-snug text-on-brand/85">
                    Aqui ficam os dados e o código de convite. Quem é supervisor edita; o restante da equipe consulta.
                </p>
                <div className="flex min-w-0 flex-wrap gap-2">
                    <span className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full bg-brand-strong/70 px-3 py-1.5 font-k2d text-sm font-bold text-on-brand">
                        <span className="size-2.5 shrink-0 rounded-full bg-login-gold" aria-hidden="true" />
                        {kitchen.active ? "Cozinha ativa" : "Cozinha desativada"}
                    </span>
                    <span className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full bg-brand-strong/70 px-3 py-1.5 font-k2d text-sm font-bold text-on-brand">
                        <span className="size-2.5 shrink-0 rounded-full bg-login-gold" aria-hidden="true" />
                        {roleLabel}
                    </span>
                </div>
            </div>
        </section>
    );
}

export default KitchenHero;
