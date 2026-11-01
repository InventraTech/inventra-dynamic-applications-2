import SupplierManagement from "../../components/features/Suppliers/SupplierManagement";
import Topbar from "../../components/layout/Topbar";
import { getSession } from "../../services/authSession";
import { displayProfileRole, getProfileDisplayName, getProfileInitials } from "../../components/features/Profile/profileHelpers";

function Suppliers() {
    const user = getSession()?.user;
    const profile = user?.profile;
    const accessType = typeof profile === "string" ? profile : profile?.accessType;
    const userName = getProfileDisplayName(user?.name ?? "Usuário");
    const canManage = accessType?.toLocaleUpperCase("pt-BR") === "SUPERVISOR";

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar
                title="Fornecedores"
                description="Cadastros compartilhados de empresas fornecedoras"
                userInitials={getProfileInitials(userName)}
                userPhotoUrl={user?.photoUrl}
                userName={userName}
                userRole={displayProfileRole(accessType)}
            />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                <SupplierManagement canManage={canManage} />
            </main>
        </div>
    );
}

export default Suppliers;
