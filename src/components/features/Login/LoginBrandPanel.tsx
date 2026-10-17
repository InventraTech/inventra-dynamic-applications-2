import logo from "../../../assets/icons/logo-inventra.svg";
import hexagon from "../../../assets/images/mascote-hexagono.svg";
import mascot from "../../../assets/images/mascote-inventra.svg";
import stockIcon from "../../../assets/icons/caixa.svg";
import expiryIcon from "../../../assets/icons/vencimento.svg";
import requisitionIcon from "../../../assets/icons/requisicao.svg";
import LoginFeatureItem from "./LoginFeatureItem";

function LoginBrandPanel() {
    return (
        <aside className="relative min-h-screen w-login-brand-width large-text:hidden shrink-0 overflow-hidden bg-linear-to-br from-brand-strong to-brand text-on-brand max-lg:h-login-mobile-brand max-lg:min-h-login-mobile-brand max-lg:w-full max-sm:h-login-mobile-brand-small max-sm:min-h-login-mobile-brand-small dyslexia-font:flex dyslexia-font:h-auto dyslexia-font:min-h-0 dyslexia-font:flex-col dyslexia-font:gap-8 dyslexia-font:overflow-visible dyslexia-font:pt-28 dyslexia-font:px-8 dyslexia-font:pb-8 lg:dyslexia-font:min-h-screen max-lg:dyslexia-font:gap-6 max-lg:dyslexia-font:pt-20 max-lg:dyslexia-font:px-6 max-lg:dyslexia-font:pb-6" aria-label="Sobre a plataforma Inventra">
            <div className="absolute left-login-logo-left top-login-logo-top z-4 flex items-center gap-login-logo-gap text-login-logo font-bold leading-none max-lg:left-6 max-lg:top-4 max-lg:gap-2 max-lg:text-xl sm:max-lg:text-2xl">
                <img className="w-login-logo-icon" src={logo} alt="" aria-hidden="true" />
                <span>Inventra</span>
            </div>

            <div className="absolute left-login-hero-left top-login-hero-top z-2 w-login-hero-width max-lg:left-6 max-lg:top-login-mobile-hero-top max-lg:w-login-mobile-hero-width max-sm:top-login-mobile-hero-top-small max-sm:w-4/5 dyslexia-font:static dyslexia-font:w-auto dyslexia-font:max-w-none">
                <span className="mb-login-accent-gap block h-1 w-login-accent-width rounded-full bg-login-accent" aria-hidden="true" />
                <h2 className="text-login-hero font-bold leading-tight">Seu estoque,<br />sob <span className="text-login-gold">controle total.</span></h2>
                <p className="mt-login-description-top text-login-description leading-snug text-login-copy max-lg:mt-login-mobile-description max-lg:text-login-mobile-description">Gestão de produtos, requisições e vencimentos em um só lugar</p>
            </div>

            <div className="absolute left-login-features-left top-login-features-top z-2 flex w-login-features-width flex-col gap-login-feature-gap max-lg:hidden dyslexia-font:static dyslexia-font:w-auto dyslexia-font:max-w-none">
                <LoginFeatureItem
                    icon={stockIcon}
                    title="Estoque em tempo real"
                    description="Produtos, lotes e níveis mínimos sempre à vista."
                />
                <LoginFeatureItem
                    icon={expiryIcon}
                    title="Vencimentos sob vigia"
                    description="Alertas antes do produto virar prejuízo."
                />
                <LoginFeatureItem
                    icon={requisitionIcon}
                    title="Requisições e compras"
                    description="Pedidos e baixas validados pelo supervisor."
                />
            </div>

            <div className="absolute left-login-hex-left top-login-hex-top z-0 aspect-login-hex w-login-hex-width max-lg:left-auto max-lg:right-login-mobile-hex-right max-lg:top-login-mobile-hex-top max-lg:w-login-mobile-hex-width max-sm:top-login-mobile-hex-top-small max-sm:w-login-mobile-hex-width-small dyslexia-font:hidden" aria-hidden="true">
                <img className="size-full object-contain" src={hexagon} alt="" />
            </div>
            <div className="absolute left-login-mascot-left top-login-mascot-top z-1 aspect-login-mascot w-login-mascot-width max-lg:left-auto max-lg:right-login-mobile-mascot-right max-sm:hidden dyslexia-font:static dyslexia-font:mt-4 dyslexia-font:w-40 dyslexia-font:self-center" aria-hidden="true">
                <img className="size-full object-contain" src={mascot} alt="" />
            </div>

            <div className="pointer-events-none absolute inset-0 max-lg:hidden dyslexia-font:hidden" aria-hidden="true">
                <span className="absolute left-login-confetti-one-left top-login-confetti-one-top size-login-confetti-size rotate-45 rounded-sm bg-login-gold" />
                <span className="absolute left-login-confetti-two-left top-login-confetti-two-top size-login-confetti-small rotate-45 rounded-sm bg-login-confetti-white" />
                <span className="absolute left-login-confetti-three-left top-login-confetti-three-top size-login-confetti-small rotate-45 rounded-sm bg-login-confetti-white" />
                <span className="absolute left-login-confetti-four-left top-login-confetti-four-top size-login-confetti-small rotate-45 rounded-sm bg-login-confetti-white" />
                <span className="absolute left-login-confetti-five-left top-login-confetti-five-top size-login-confetti-small rotate-45 rounded-sm bg-login-confetti-soft" />
                <span className="absolute left-login-confetti-six-left top-login-confetti-six-top size-login-confetti-small rotate-45 rounded-sm bg-login-confetti-gold" />
                <span className="absolute left-login-confetti-seven-left top-login-confetti-seven-top size-login-confetti-size rotate-45 rounded-sm bg-login-gold" />
                <span className="absolute left-login-confetti-eight-left top-login-confetti-eight-top size-login-confetti-small rotate-45 rounded-sm bg-login-gold" />
                <span className="absolute left-login-confetti-nine-left top-login-confetti-nine-top size-login-confetti-size rotate-45 rounded-sm bg-login-gold" />
            </div>
        </aside>
    );
}

export default LoginBrandPanel;
