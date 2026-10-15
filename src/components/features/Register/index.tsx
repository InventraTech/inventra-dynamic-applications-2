import RegisterBrandPanel from "./RegisterBrandPanel";
import RegisterForm from "./RegisterForm";
import KitchenSetupForm from "./KitchenSetupForm";
import AccessibilityLink from "../../ui/AccessibilityLink";

interface RegisterFeatureProps {
    step?: "account" | "kitchen";
}

function RegisterFeature({ step = "account" }: RegisterFeatureProps) {
    return (
        <main id="conteudo-principal" tabIndex={-1} data-auth-screen="true" data-register-screen="true" className="relative flex h-screen min-h-0 min-w-0 w-full overflow-hidden bg-surface font-k2d max-lg:flex-col large-text:flex-col">
            <AccessibilityLink />
            <RegisterBrandPanel />
            {step === "account" ? <RegisterForm /> : <KitchenSetupForm />}
        </main>
    );
}

export default RegisterFeature;
