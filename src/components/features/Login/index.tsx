import LoginBrandPanel from "./LoginBrandPanel";
import LoginForm from "./LoginForm";

function LoginFeature() {
    return (
        <main className="flex min-h-screen w-full bg-white font-k2d max-lg:flex-col">
            <LoginBrandPanel />
            <LoginForm />
        </main>
    );
}

export default LoginFeature;
