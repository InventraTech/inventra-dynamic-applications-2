import { Component, useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";

import Button from "../../../ui/Button";
import Feedback from "../../../ui/Feedback";

interface ProfileErrorBoundaryProps {
    children: ReactNode;
}

interface ProfileErrorBoundaryState {
    hasError: boolean;
}

interface ProfileErrorFallbackProps {
    onRetry: () => void;
}

function ProfileErrorFallback({ onRetry }: ProfileErrorFallbackProps) {
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        headingRef.current?.focus();
    }, []);

    return (
        <main id="conteudo-principal" tabIndex={-1} className="min-w-0 outline-none">
            <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-6" aria-labelledby="perfil-falha-titulo">
                <h1 ref={headingRef} tabIndex={-1} id="perfil-falha-titulo" className="font-k2d text-2xl font-bold text-sidebar-text">
                    Não foi possível abrir seu perfil
                </h1>
                <Feedback severity="error">Ocorreu um problema ao carregar esta tela. Tente novamente ou volte ao painel.</Feedback>
                <div className="flex min-w-0 flex-wrap gap-3">
                    <Button variant="primary" type="button" onClick={onRetry}>Tentar novamente</Button>
                    <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-history-border px-4 py-2 font-k2d text-sm font-bold text-sidebar-purple hover:bg-history-card-header focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/home">
                        Voltar ao painel
                    </Link>
                </div>
            </section>
        </main>
    );
}

class ProfileErrorBoundary extends Component<ProfileErrorBoundaryProps, ProfileErrorBoundaryState> {
    state: ProfileErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ProfileErrorBoundaryState {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <ProfileErrorFallback onRetry={() => this.setState({ hasError: false })} />;
        }

        return this.props.children;
    }
}

export default ProfileErrorBoundary;
