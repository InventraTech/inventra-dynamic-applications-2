import { Navigate } from "react-router-dom";

import RegisterFeature from "../../components/features/Register";
import { getSession } from "../../services/authSession";

function KitchenRegistration() {
    const session = getSession();
    if (!session) return <Navigate to="/cadastro" replace />;
    if (session.user.kitchen) return <Navigate to="/historico" replace />;

    const profile = session.user.profile;
    const accessType = typeof profile === "string" ? profile : profile?.accessType;
    if (accessType?.toLocaleLowerCase("pt-BR") !== "supervisor") {
        return <Navigate to="/historico" replace />;
    }

    return <RegisterFeature step="kitchen" />;
}

export default KitchenRegistration;
