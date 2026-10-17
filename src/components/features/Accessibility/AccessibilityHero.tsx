import hexagon from "../../../assets/images/hexagono-decorativo.svg";
import Mascot from "../../ui/Mascot";
import Button from "../../ui/Button";

interface AccessibilityHeroProps {
    activeCount: number;
    hasChanges: boolean;
    savedMessage: string;
    onReset: () => void;
    onSave: () => void;
}

function AccessibilityHero({ activeCount, hasChanges, savedMessage, onReset, onSave }: AccessibilityHeroProps) {
    return (
        <section className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-brand-strong to-brand px-7 py-6 text-on-brand shadow-history-card max-md:px-5 max-md:py-5 max-sm:rounded-2xl max-sm:px-4">
            <img className="pointer-events-none absolute -right-4 -top-5 -z-10 w-44 opacity-20" src={hexagon} alt="" aria-hidden="true" />
            <div className="pointer-events-none absolute right-9 top-7 size-2 rotate-45 rounded-sm bg-login-gold" aria-hidden="true" />
            <div className="pointer-events-none absolute right-28 top-16 size-1.5 rotate-45 rounded-sm bg-white/60" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-8 right-36 size-2 rotate-45 rounded-sm bg-white/50" aria-hidden="true" />
            <Mascot size="amplo" className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 opacity-95 2xl:block large-text:hidden" />

            <div className="relative z-10 max-w-3xl">
                <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-k2d text-xs font-semibold text-on-brand">
                    <span className="size-2 shrink-0 rounded-full bg-login-gold" aria-hidden="true" />
                    Personalização neste dispositivo
                </span>
                <h2 className="mt-3 font-k2d text-2xl font-bold leading-tight max-sm:text-xl">Seu Inventra, do seu jeito</h2>
                <p className="mt-1 max-w-2xl font-k2d text-sm leading-relaxed text-on-brand/80">
                    Ajuste leitura, contraste, navegação e recursos de apoio. Veja as mudanças na prévia e salve quando estiver tudo certo.
                </p>
                <p className="mt-2 max-w-2xl font-k2d text-xs leading-relaxed text-on-brand/70">
                    As preferências salvas valem em todas as telas, inclusive no login e no cadastro.
                </p>
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 font-k2d text-xs text-on-brand/90" aria-live="polite">
                    <span className="font-bold text-login-gold">{activeCount}</span>
                    {activeCount === 1 ? "recurso ativo" : "recursos ativos"}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button
                        className="min-h-10 rounded-xl border border-white/35 bg-transparent px-4 py-2 font-k2d text-xs font-semibold text-on-brand hover:bg-white/10 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
                        variant="icon"
                        type="button"
                        onClick={onReset}
                    >
                        Restaurar padrão
                    </Button>
                    <Button
                        className="min-h-10 rounded-xl border border-history-border bg-surface px-5 py-2 font-k2d text-xs font-bold text-sidebar-purple hover:bg-sidebar-active focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
                        variant="icon"
                        type="button"
                        onClick={onSave}
                        disabled={!hasChanges}
                    >
                        Salvar preferências
                    </Button>
                    <span className="font-k2d text-sm text-on-brand" role="status" aria-atomic="true">{savedMessage}</span>
                </div>
            </div>
        </section>
    );
}

export default AccessibilityHero;
