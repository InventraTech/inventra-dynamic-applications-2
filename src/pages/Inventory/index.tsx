import Topbar from "../../components/layout/Topbar";
import InventoryList from "../../components/features/Inventory/InventoryList";
import { Link } from "react-router-dom";
import { getSession } from "../../services/authSession";

function getUserDisplay(name: string | undefined) {
    const parts = (name ?? "Usuário").trim().split(/\s+/).filter(Boolean);
    const displayName = parts.length > 1 ? `${parts[0]} ${parts.at(-1)}` : parts[0] ?? "Usuário";
    const initials = (parts.length > 1 ? [parts[0], parts.at(-1)] : parts)
        .map((part) => [...(part ?? "")][0]?.toLocaleUpperCase("pt-BR") ?? "").join("") || "IN";
    return { displayName, initials };
}

export default function InventoryPage() {
    const session = getSession();
    const user = session?.user;
    const profile = user?.profile;
    const role = typeof profile === "string" ? profile : profile?.accessType ?? "Membro";
    const canAccess = ["SUPERVISOR", "ESTOQUISTA"].includes(role.toLocaleUpperCase("pt-BR"));
    const display = getUserDisplay(user?.name);

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar title="Inventários" description="Confira a quantidade física por lote da cozinha atual." userInitials={display.initials} userPhotoUrl={user?.photoUrl} userName={display.displayName} userRole={role.replaceAll("_", " ")} />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                {canAccess ? <InventoryList kitchenId={user?.kitchen?.id ?? null} kitchenName={user?.kitchen?.name ?? null} /> : (
                    <section className="mx-4 my-6 grid justify-items-center gap-3 rounded-3xl bg-surface p-6 text-center shadow-history-card sm:mx-6 sm:p-8" aria-labelledby="inventory-access-title">
                        <span className="grid size-12 place-items-center rounded-2xl bg-feedback-error-bg font-k2d text-xl font-bold text-feedback-error" aria-hidden="true">!</span>
                        <h2 id="inventory-access-title" className="m-0 font-k2d text-xl font-bold text-ink">Você não tem acesso aos inventários</h2>
                        <p className="m-0 max-w-prose text-sm leading-relaxed text-history-muted">A contagem de estoque está disponível para supervisores e estoquistas da cozinha.</p>
                        <Link to="/home" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-history-border bg-surface px-4 py-2 font-k2d text-sm font-bold text-sidebar-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Voltar ao Painel</Link>
                    </section>
                )}
            </main>
        </div>
    );
}
