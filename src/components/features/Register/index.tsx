import RegisterBrandPanel from "./RegisterBrandPanel";
import RegisterForm from "./RegisterForm";
import KitchenSetupForm from "./KitchenSetupForm";

interface RegisterFeatureProps {
    step?: "account" | "kitchen";
}

function RegisterFeature({ step = "account" }: RegisterFeatureProps) {
    return (
        <main className="flex min-h-screen min-w-0 w-full bg-white font-k2d max-lg:flex-col">
            <RegisterBrandPanel />
            {step === "account" ? <RegisterForm /> : <KitchenSetupForm />}
        </main>
    );
}

export default RegisterFeature;
