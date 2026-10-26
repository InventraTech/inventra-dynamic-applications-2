import Topbar from "../../components/layout/Topbar";
import TeamAccessContent from "../../components/features/TeamAccess";
import { getSession } from "../../services/authSession";

function TeamAccess() {
    const session = getSession();
    const nameParts = (session?.user.name ?? "Usuário").trim().split(/\s+/).filter(Boolean);
    const userName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}` : nameParts[0] ?? "Usuário";
    const initials = nameParts.length > 1 ? [nameParts[0], nameParts[nameParts.length - 1]] : nameParts;
    const userInitials = initials.map((part) => [...part][0]?.toLocaleUpperCase("pt-BR") ?? "").join("") || "IN";
    const profile = session?.user.profile;
    const role = typeof profile === "string" ? profile : profile?.accessType?.replaceAll("_", " ") ?? "Supervisor";

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar
                title="Equipe e acessos"
                description="Quem usa a sua cozinha e quem pediu para entrar"
                userInitials={userInitials}
                userPhotoUrl={session?.user.photoUrl}
                userName={userName}
                userRole={role}
            />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                <TeamAccessContent />
            </main>
        </div>
    );
}

export default TeamAccess;
