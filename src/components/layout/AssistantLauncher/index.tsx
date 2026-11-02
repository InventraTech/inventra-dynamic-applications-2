import { Link, useLocation } from "react-router-dom";
import assistantIcon from "../../../assets/icons/chatbot.svg";
import { useAuth } from "../../../context/auth";
import { useAccessibility } from "../../../context/accessibility";

export default function AssistantLauncher() {
    const { pathname } = useLocation();
    const { settings } = useAccessibility();
    const { session } = useAuth();
    const profile = session?.user.profile;
    const accessType = (typeof profile === "string" ? profile : profile?.accessType ?? "").toLocaleUpperCase("pt-BR");
    const canUseAssistant = Boolean(session?.user.kitchen?.id && ["SUPERVISOR", "ESTOQUISTA", "COMPRADOR"].includes(accessType));

    const publicPaths = ["/", "/login", "/cadastro", "/cadastro/cozinha"];
    if (!canUseAssistant || publicPaths.includes(pathname) || pathname === "/assistente-ia") return null;

    const verticalPosition = settings.libras ? "bottom-24" : "bottom-6";

    return (
        <Link
            to="/assistente-ia"
            aria-label="Abrir Assistente IA"
            title="Abrir Assistente IA"
            data-testid="assistant-launcher"
            className={`fixed ${verticalPosition} right-6 z-[100] grid size-16 place-items-center rounded-full border-2 border-surface bg-brand transition-[transform,background-color] duration-200 hover:scale-105 hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus motion-reduce:transition-none motion-reduce:hover:scale-100`}
        >
            <img className="size-8 brightness-0 invert" src={assistantIcon} alt="" aria-hidden="true" />
        </Link>
    );
}
