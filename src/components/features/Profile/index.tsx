import { useEffect, useState } from "react";

import type { UserAccount } from "../../../types/auth";
import { getCurrentUser } from "../../../services/authService";
import { updateSessionUser } from "../../../services/authSession";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import ProfileAccessibilityCard from "./ProfileAccessibilityCard";
import ProfileAccountCard from "./ProfileAccountCard";
import ProfileLoadingSkeleton from "./ProfileLoadingSkeleton";
import ProfilePasswordCard from "./ProfilePasswordCard";
import ProfilePasswordTip from "./ProfilePasswordTip";
import ProfilePersonalCard from "./ProfilePersonalCard";
import { getProfileErrorMessage } from "./profileHelpers";

interface ProfileProps {
    onUserUpdated: (user: UserAccount) => void;
}

function Profile({ onUserUpdated }: ProfileProps) {
    const [user, setUser] = useState<UserAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => {
            if (controller.signal.aborted) return;
            setLoadError("O carregamento do perfil demorou mais que o esperado. Tente novamente.");
            setLoading(false);
            controller.abort();
        }, 30_000);

        async function loadProfile() {
            setLoading(true);
            setLoadError(null);
            try {
                const currentUser = await getCurrentUser(controller.signal);
                if (controller.signal.aborted) return;
                setUser(currentUser);
                updateSessionUser(currentUser);
                onUserUpdated(currentUser);
            } catch (error: unknown) {
                if (!controller.signal.aborted) setLoadError(getProfileErrorMessage(error, "Não foi possível carregar seu perfil. Tente novamente."));
            } finally {
                window.clearTimeout(timeoutId);
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        void loadProfile();
        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [onUserUpdated, reloadKey]);

    if (loading) return <ProfileLoadingSkeleton />;

    if (loadError || !user) {
        return (
            <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-6" aria-labelledby="perfil-erro-titulo">
                <h2 id="perfil-erro-titulo" className="font-k2d text-xl font-bold text-sidebar-text">Não foi possível abrir seu perfil</h2>
                <Feedback severity="error">{loadError ?? "Os dados do perfil não foram retornados."}</Feedback>
                <div><Button variant="standard" type="button" onClick={() => setReloadKey((value) => value + 1)}>Tentar novamente</Button></div>
            </section>
        );
    }

    function handleUserUpdated(updatedUser: UserAccount) {
        setUser(updatedUser);
        onUserUpdated(updatedUser);
    }

    return (
        <div className="min-w-0 bg-linear-to-b from-history-background-start to-history-background-end px-4 pb-10 pt-5 sm:px-6 sm:pt-6 xl:px-8 adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <div className="mx-auto grid w-full max-w-screen-2xl min-w-0 items-start gap-5 xl:grid-cols-3 large-text:grid-cols-1">
                <div className="flex min-w-0 flex-col gap-5 xl:col-span-2">
                    <ProfilePersonalCard user={user} onUserUpdated={handleUserUpdated} />
                    <ProfilePasswordCard user={user} />
                </div>
                <aside className="flex min-w-0 flex-col gap-5">
                    <ProfileAccountCard user={user} />
                    <ProfileAccessibilityCard />
                    <ProfilePasswordTip />
                </aside>
            </div>
        </div>
    );
}

export default Profile;
