import logo from "../../../assets/icons/favicon.svg";
import { inventraIcons } from "../../../assets/icons/inventra-v2";
import hexagon from "../../../assets/login/login-hexagon.svg";
import mascot from "../../../assets/login/login-mascot.svg";
import BrandConfetti from "../Auth/BrandConfetti";

type RegistrationStepIcon = "account" | "kitchen" | "team";

interface RegistrationStep {
    id: string;
    icon: RegistrationStepIcon;
    title: string;
    description: string;
}

const registrationStepIcons: Record<RegistrationStepIcon, string> = {
    account: inventraIcons.registerAccount,
    kitchen: inventraIcons.registerKitchen,
    team: inventraIcons.registerInvite,
};

const registrationSteps: RegistrationStep[] = [
    {
        id: "account",
        icon: "account",
        title: "Crie sua conta",
        description: "Nome, e-mail e senha. Leva menos de um minuto.",
    },
    {
        id: "kitchen",
        icon: "kitchen",
        title: "Crie sua cozinha",
        description: "Dê um nome e um endereço ao seu espaço.",
    },
    {
        id: "team",
        icon: "team",
        title: "Convide o seu time",
        description: "Aprove os pedidos de entrada de quem usar o código.",
    },
];

interface RegistrationStepItemProps {
    step: RegistrationStep;
}

function RegistrationStepItem({ step }: RegistrationStepItemProps) {
    return (
        <li className="flex min-w-0 items-center gap-login-feature-copy-offset">
            <span className="flex size-login-feature-icon shrink-0 items-center justify-center rounded-login-feature-icon-radius bg-login-field" aria-hidden="true">
                <img className="h-1/2 w-1/2 object-contain" src={registrationStepIcons[step.icon]} alt="" />
            </span>
            <span className="flex min-w-0 w-login-feature-copy-width flex-col gap-login-feature-copy-gap leading-tight">
                <strong className="text-login-feature-title font-bold text-white">{step.title}</strong>
                <span className="text-login-feature-copy text-login-copy">{step.description}</span>
            </span>
        </li>
    );
}

function RegisterBrandPanel() {
    return (
        <aside
            className="relative min-h-screen w-login-brand-width shrink-0 overflow-hidden bg-linear-to-br from-login-brand-start to-login-brand-end text-white max-lg:h-login-mobile-brand max-lg:min-h-login-mobile-brand max-lg:w-full max-sm:h-login-mobile-brand-small max-sm:min-h-login-mobile-brand-small"
            aria-label="Etapas para começar a usar o Inventra"
        >
            <div className="absolute left-login-logo-left top-login-logo-top z-4 flex items-center gap-login-logo-gap text-login-logo font-bold leading-none max-lg:left-6 max-lg:top-4 max-lg:gap-2 max-lg:text-xl sm:max-lg:text-2xl">
                <img className="w-login-logo-icon" src={logo} alt="" aria-hidden="true" />
                <span>Inventra</span>
            </div>

            <div className="absolute left-login-hero-left top-login-hero-top z-2 w-login-hero-width max-lg:left-6 max-lg:top-login-mobile-hero-top max-lg:w-login-mobile-hero-width max-sm:top-login-mobile-hero-top-small max-sm:w-4/5">
                <span className="mb-login-accent-gap block h-1 w-login-accent-width rounded-full bg-login-accent" aria-hidden="true" />
                <h2 className="text-login-hero font-bold leading-tight">
                    Bora montar<br />
                    <span className="text-login-gold">sua cozinha.</span>
                </h2>
                <p className="mt-login-description-top text-login-description leading-snug text-login-copy max-lg:mt-login-mobile-description max-lg:text-login-mobile-description">
                    Crie sua conta de supervisor e monte a cozinha do seu time.
                </p>
            </div>

            <ol className="absolute left-login-features-left top-login-features-top z-2 flex w-login-features-width flex-col gap-login-feature-gap max-lg:hidden">
                {registrationSteps.map((step) => <RegistrationStepItem key={step.id} step={step} />)}
            </ol>

            <div className="absolute left-login-hex-left top-login-hex-top z-0 aspect-login-hex w-login-hex-width max-lg:left-auto max-lg:right-login-mobile-hex-right max-lg:top-login-mobile-hex-top max-lg:w-login-mobile-hex-width max-sm:top-login-mobile-hex-top-small max-sm:w-login-mobile-hex-width-small" aria-hidden="true">
                <img className="size-full object-contain" src={hexagon} alt="" />
            </div>
            <div className="absolute left-login-mascot-left top-login-mascot-top z-1 aspect-login-mascot w-login-mascot-width max-lg:left-auto max-lg:right-login-mobile-mascot-right max-lg:top-login-mobile-mascot-top max-lg:w-login-mobile-mascot-width max-sm:hidden" aria-hidden="true">
                <img className="size-full object-contain" src={mascot} alt="" />
            </div>

            <BrandConfetti />
        </aside>
    );
}

export default RegisterBrandPanel;
