import Topbar from "../../components/layout/Topbar";
import AssistantFlow from "../../components/features/AI/Assistant/index";
import { displayProfileRole, getProfileDisplayName, getProfileInitials } from "../../components/features/Profile/profileHelpers";
import { useAuth } from "../../context/auth";

export default function Assistant() {
    const { session } = useAuth();
    const user = session?.user;
    const userName = getProfileDisplayName(user?.name ?? "Usuário");
    const profile = user?.profile;
    const accessType = typeof profile === "string" ? profile : profile?.accessType;

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start 2xl:h-dvh 2xl:min-h-0 2xl:overflow-hidden large-text:h-auto large-text:overflow-visible">
            <Topbar
                title="Assistente IA"
                description="Sua cozinha, com respostas e ações sob controle"
                userName={userName}
                userInitials={getProfileInitials(userName)}
                userPhotoUrl={user?.photoUrl}
                userRole={displayProfileRole(accessType)}
            />
            <main id="conteudo-principal" tabIndex={-1} className="min-h-0 min-w-0 flex-1 outline-none 2xl:overflow-hidden large-text:overflow-visible">
                <AssistantFlow />
            </main>
        </div>
    );
}
