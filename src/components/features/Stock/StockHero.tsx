import { Link } from "react-router-dom";
import Button from "../../ui/Button";
import mascotHead from "../../../assets/images/mascote-cabeca.svg";
import hexagonPattern from "../../../assets/images/requisition-hex-pattern.svg";
import requisitionIcon from "../../../assets/icons/requisicao.svg";
import withdrawalIcon from "../../../assets/icons/retirada.svg";

interface StockHeroProps {
    kitchenName: string;
    onConsume: () => void;
}

export default function StockHero({ kitchenName, onConsume }: StockHeroProps) {
    return (
        <section className="relative isolate flex min-h-36 min-w-0 flex-wrap items-center justify-between gap-5 overflow-hidden rounded-3xl bg-linear-to-br from-brand-strong to-brand px-5 py-5 text-on-brand shadow-history-card sm:px-8">
            <img src={hexagonPattern} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 size-full object-cover opacity-70" />
            <div className="relative z-10 grid min-w-0 max-w-4xl gap-2">
                <span className="flex w-fit max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold text-on-brand wrap-anywhere">
                    <span aria-hidden="true">⌖</span>{kitchenName}
                </span>
                <h2 className="m-0 font-k2d text-2xl font-bold leading-tight text-on-brand sm:text-3xl">Estoque da cozinha</h2>
                <p className="m-0 max-w-prose text-sm leading-relaxed text-on-brand sm:text-base">O saldo soma só os lotes ativos e dentro da validade. Alertas e movimentações valem apenas para esta cozinha.</p>
                <div className="mt-1 flex min-w-0 flex-wrap gap-2">
                    <Link to="/requisicoes/nova" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-login-gold px-4 py-2.5 font-k2d text-sm font-bold text-brand-strong transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand">
                        <img className="size-4" src={requisitionIcon} alt="" aria-hidden="true" />
                        Nova requisição
                    </Link>
                    <Button variant="outline" type="button" className="!text-on-brand min-h-11 rounded-full border-white/35 bg-white/12 hover:bg-white/20 focus-visible:outline-on-brand" onClick={onConsume}>
                        <img className="size-4 brightness-0 invert" src={withdrawalIcon} alt="" aria-hidden="true" />
                        Registrar consumo
                    </Button>
                </div>
            </div>
            <img src={mascotHead} alt="" aria-hidden="true" className="relative z-10 hidden size-14 shrink-0 object-contain sm:block sm:size-20" />
        </section>
    );
}
