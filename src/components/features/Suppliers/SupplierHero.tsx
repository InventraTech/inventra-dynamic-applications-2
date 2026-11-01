import type { ReactNode } from "react";
import Mascote from "../../ui/Mascot";
import Button from "../../ui/Button";
import sharedIcon from "../../../assets/icons/fornecedor.svg";
import addIcon from "../../../assets/icons/adicionar.svg";
import pattern from "../../../assets/images/requisition-hex-pattern.svg";

interface SupplierHeroProps {
    canManage: boolean;
    onCreate: () => void;
    children?: ReactNode;
}

function SupplierHero({ canManage, onCreate, children }: SupplierHeroProps) {
    return (
        <section className="relative isolate flex min-h-48 min-w-0 items-center overflow-hidden rounded-3xl bg-linear-to-r from-brand-strong to-brand px-5 py-6 text-on-brand shadow-history-card sm:px-8 md:min-h-52" aria-labelledby="supplier-hero-title">
            <img className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden h-full w-2/5 object-cover opacity-15 md:block" src={pattern} alt="" aria-hidden="true" />
            <div className="relative z-10 grid min-w-0 flex-1 gap-4">
                <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-on-brand">
                    <img className="size-4 shrink-0 brightness-0 invert" src={sharedIcon} alt="" aria-hidden="true" />
                    <span className="wrap-anywhere">Cadastro compartilhado entre cozinhas</span>
                </div>
                <div className="max-w-4xl">
                    <h2 id="supplier-hero-title" className="font-k2d text-2xl font-bold leading-tight sm:text-3xl">Fornecedores</h2>
                    <p className="mt-2 text-sm leading-relaxed text-on-brand/90 sm:text-base">Quem abastece as cozinhas do Inventra. O cadastro é compartilhado; o vínculo com produtos é feito na tela de Produtos.</p>
                </div>
                {children}
                {canManage && <Button variant="accent" type="button" onClick={onCreate} className="w-fit min-h-11 rounded-xl px-5 text-sm">
                    <img className="size-5" src={addIcon} alt="" aria-hidden="true" />
                    Novo fornecedor
                </Button>}
            </div>
            <Mascote size="amplo" className="relative z-10 ml-4 hidden shrink-0 md:block" />
        </section>
    );
}

export default SupplierHero;
