import Topbar from "../../components/layout/Topbar";
import RequisitionFlow from "../../components/features/Requisitions";
import { getSession } from "../../services/authSession";

export type RequisitionPageMode = "list" | "create" | "edit" | "detail";

interface RequisitionsProps {
    mode: RequisitionPageMode;
}

function getDisplayName(name: string | undefined): { name: string; initials: string } {
    const parts = (name ?? "Usuário").trim().split(/\s+/).filter(Boolean);
    const displayName = parts.length > 1 ? `${parts[0]} ${parts.at(-1)}` : parts[0] ?? "Usuário";
    const initials = parts.length > 1 ? [parts[0], parts.at(-1)] : parts;
    return { name: displayName, initials: initials.map((part) => [...(part ?? "")][0]?.toLocaleUpperCase("pt-BR") ?? "").join("") || "IN" };
}

export default function Requisitions({ mode }: RequisitionsProps) {
    const session = getSession();
    const user = getDisplayName(session?.user.name);
    const role = typeof session?.user.profile === "string"
        ? session.user.profile
        : session?.user.profile?.accessType?.replaceAll("_", " ") ?? "Usuário";

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar
                title="Requisições"
                description={session?.user.kitchen?.name ?? "Acompanhe os pedidos da sua cozinha"}
                userInitials={user.initials}
                userPhotoUrl={session?.user.photoUrl}
                userName={user.name}
                userRole={role}
            />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                <RequisitionFlow mode={mode} kitchenId={session?.user.kitchen?.id ?? null} kitchenName={session?.user.kitchen?.name ?? null} userId={session?.user.id ?? null} userName={user.name} userPhotoUrl={session?.user.photoUrl ?? null} canReview={role.toLocaleUpperCase("pt-BR") === "SUPERVISOR"} />
            </main>
        </div>
    );
}
