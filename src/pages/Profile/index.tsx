import { useCallback, useState } from "react";

import ProfileContent from "../../components/features/Profile";
import Topbar from "../../components/layout/Topbar";
import { getSession } from "../../services/authSession";
import type { UserAccount } from "../../types/auth";

function displayName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0] ?? "Usuário";
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts)
        .map((part) => [...part][0]?.toLocaleUpperCase("pt-BR") ?? "")
        .join("") || "IN";
}

function Profile() {
    const [user, setUser] = useState<UserAccount | null>(null);
    const handleUserUpdated = useCallback((updatedUser: UserAccount) => setUser(updatedUser), []);
    const profile = user?.profile;
    const userRole = typeof profile === "string" ? profile : profile?.accessType?.replaceAll("_", " ") ?? "Usuário";
    const userName = displayName(user?.name ?? getSession()?.user.name ?? "Usuário");

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar
                title="Perfil"
                description="Seus dados pessoais e de acesso"
                userInitials={getInitials(userName)}
                userPhotoUrl={user ? user.photoUrl : getSession()?.user.photoUrl}
                userName={userName}
                userRole={userRole}
            />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                <ProfileContent onUserUpdated={handleUserUpdated} />
            </main>
        </div>
    );
}

export default Profile;
