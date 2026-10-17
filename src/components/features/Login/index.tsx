import LoginBrandPanel from "./LoginBrandPanel";
import LoginForm from "./LoginForm";
import AccessibilityLink from "../../ui/AccessibilityLink";

function LoginFeature() {
    return (
        <main id="conteudo-principal" tabIndex={-1} data-auth-screen="true" className="relative flex min-h-screen min-w-0 w-full bg-surface font-k2d max-lg:flex-col large-text:flex-col">
            <AccessibilityLink />
            <LoginBrandPanel />
            <LoginForm />
        </main>
    );
}

export default LoginFeature;
