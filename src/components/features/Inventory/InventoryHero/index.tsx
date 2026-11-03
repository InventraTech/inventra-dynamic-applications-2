import Icon from "../../../ui/Icon";
import type { ReactNode } from "react";
import hexagonPattern from "../../../../assets/images/requisition-hex-pattern.svg";
import Mascot from "../../../ui/Mascot/index";

interface InventoryHeroProps {
    kitchenName: string;
    title: string;
    description: string;
    actions?: ReactNode;
}

export default function InventoryHero({ kitchenName, title, description, actions }: InventoryHeroProps) {
    return (
        <section className="relative isolate flex min-h-44 min-w-0 flex-wrap items-center justify-between gap-5 overflow-hidden rounded-3xl bg-linear-to-br from-brand-strong to-brand px-5 py-5 text-on-brand shadow-history-card sm:px-8 sm:py-6">
            <img src={hexagonPattern} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 size-full object-cover opacity-60" />
            <div className="relative z-10 grid min-w-0 max-w-4xl gap-2">
                <span className="flex w-fit max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-semibold text-on-brand wrap-anywhere">
                    <Icon name="pin" className="size-4 shrink-0" />{kitchenName}
                </span>
                <h2 className="m-0 font-k2d text-2xl font-bold leading-tight text-on-brand sm:text-3xl">{title}</h2>
                <p className="m-0 max-w-prose text-sm leading-relaxed text-on-brand sm:text-base">{description}</p>
                {actions && <div className="mt-1 flex min-w-0 flex-wrap gap-2">{actions}</div>}
            </div>
            <Mascot size="compacto" className="relative z-10 hidden w-20 shrink-0 object-contain sm:block lg:w-24" />
        </section>
    );
}
