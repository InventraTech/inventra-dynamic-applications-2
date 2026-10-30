import Topbar from "../../components/layout/Topbar";
import StockFlow from "../../components/features/Stock";
import StockAccessDenied from "../../components/features/Stock/StockAccessDenied";
import { getSession } from "../../services/authSession";

function getDisplayName(name: string | undefined): { name: string; initials: string } {
    const parts = (name ?? "Usuário").trim().split(/\s+/).filter(Boolean);
    const displayName = parts.length > 1 ? `${parts[0]} ${parts.at(-1)}` : parts[0] ?? "Usuário";
    const initials = parts.length > 1 ? [parts[0], parts.at(-1)] : parts;
    return { name: displayName, initials: initials.map((part) => [...(part ?? "")][0]?.toLocaleUpperCase("pt-BR") ?? "").join("") || "IN" };
}

export default function Stock() {
    const session = getSession();
    const user = getDisplayName(session?.user.name);
    const role = typeof session?.user.profile === "string"
        ? session.user.profile
        : session?.user.profile?.accessType?.replaceAll("_", " ") ?? "Usuário";
    const accessType = typeof session?.user.profile === "string"
        ? session.user.profile
        : session?.user.profile?.accessType;
    const canAccessStock = ["SUPERVISOR", "ESTOQUISTA"].includes(accessType?.toLocaleUpperCase("pt-BR") ?? "");

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar
                title="Estoque"
                description="Acompanhe o saldo utilizável, os lotes e as movimentações da cozinha atual."
                userInitials={user.initials}
                userPhotoUrl={session?.user.photoUrl}
                userName={user.name}
                userRole={role}
            />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                {canAccessStock
                    ? <StockFlow kitchenId={session?.user.kitchen?.id ?? null} kitchenName={session?.user.kitchen?.name ?? null} canCreateKitchen={accessType?.toLocaleUpperCase("pt-BR") === "SUPERVISOR"} />
                    : <StockAccessDenied />}
            </main>
        </div>
    );
}
