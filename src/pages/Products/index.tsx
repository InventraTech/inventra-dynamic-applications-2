import { Outlet, useNavigate } from "react-router-dom";
import Topbar from "../../components/layout/Topbar";
import { getSession } from "../../services/authSession";

function Products() {
    const navigate = useNavigate();
    const session = getSession();
    const nameParts = (session?.user.name ?? "Usuário").trim().split(/\s+/).filter(Boolean);
    const userName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}` : nameParts[0] ?? "Usuário";
    const initials = nameParts.length > 1 ? [nameParts[0], nameParts[nameParts.length - 1]] : nameParts;
    const userInitials = initials.map((part) => [...part][0]?.toLocaleUpperCase("pt-BR") ?? "").join("") || "IN";
    const profile = session?.user.profile;
    const userRole = typeof profile === "string" ? profile : profile?.name ?? profile?.accessType?.replaceAll("_", " ") ?? "Supervisor";

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar
                title="Produtos"
                description="Catálogo, categorias e unidades de medida"
                userInitials={userInitials}
                userPhotoUrl={session?.user.photoUrl}
                userName={userName}
                userRole={userRole}
                searchPlaceholder="Buscar produtos..."
                onSearch={(value) => navigate(value.trim() ? `/produtos?name=${encodeURIComponent(value)}` : "/produtos")}
            />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                <Outlet />
            </main>
        </div>
    );
}

export default Products;
