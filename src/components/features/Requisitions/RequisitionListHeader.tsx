import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import mascotHead from "../../../assets/images/mascote-cabeca.svg";
import hexagonPattern from "../../../assets/images/requisition-hex-pattern.svg";

export default function RequisitionListHeader() {
    const navigate = useNavigate();

    return (
        <header className="relative isolate flex min-h-36 min-w-0 flex-wrap items-center justify-between gap-5 overflow-hidden rounded-3xl bg-linear-to-br from-brand-strong to-brand px-5 py-5 text-on-brand shadow-history-card sm:px-8">
            <img src={hexagonPattern} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 size-full object-cover opacity-70" />
            <div className="relative z-10 grid min-w-0 max-w-3xl gap-2">
                <h2 id="requisitions-heading" className="m-0 font-k2d text-2xl font-bold leading-tight text-on-brand sm:text-3xl">Requisições da cozinha</h2>
                <p className="m-0 max-w-prose text-sm leading-relaxed text-on-brand sm:text-base">Compras, consumo e transferências — acompanhe cada pedido até a decisão.</p>
                <Button variant="accent" type="button" onClick={() => navigate("/requisicoes/nova")} className="mt-1 w-fit">
                    <span aria-hidden="true">⊕</span>
                    Nova requisição
                </Button>
            </div>
            <img src={mascotHead} alt="" aria-hidden="true" className="relative z-10 hidden size-14 shrink-0 object-contain sm:block sm:size-20" />
        </header>
    );
}
