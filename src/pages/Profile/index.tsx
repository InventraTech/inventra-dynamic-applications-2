import { useCallback, useState } from "react";

import ProfileContent from "../../components/features/Profile";
import Topbar from "../../components/layout/Topbar";
import { getSession } from "../../services/authSession";
import type { UserAccount } from "../../types/auth";
import { displayProfileRole, getProfileDisplayName, getProfileInitials } from "../../components/features/Profile/profileHelpers";

function Profile() {
    const [user, setUser] = useState<UserAccount | null>(null);
    const handleUserUpdated = useCallback((updatedUser: UserAccount) => setUser(updatedUser), []);
    const sessionUser = getSession()?.user;
    const profile = user?.profile ?? sessionUser?.profile;
    const userRole = displayProfileRole(typeof profile === "string" ? profile : profile?.accessType);
    const userName = getProfileDisplayName(user?.name ?? sessionUser?.name ?? "Usuário");

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar
                title="Perfil"
                description="Seus dados e a segurança da sua conta"
                userInitials={getProfileInitials(userName)}
                userPhotoUrl={user ? user.photoUrl : sessionUser?.photoUrl}
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
