import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import AccessibilityTools from "../components/layout/AccessibilityTools";
import type { MenuSection } from "../types/sidebar";
import logoInventra from "../assets/icons/logo-inventra.svg";
import { getSession } from "../services/authSession";

interface PrivateRouteProps { allowPublic?: boolean }

const menuSections: MenuSection[] = [
    { sectionTitle: "titlo 1", menuOptions: [
        { page: "Login", pageIcon: logoInventra, pagePath: "/" },
        { page: "Início", pageIcon: logoInventra, pagePath: "/home" },
        { page: "Acessibilidade", pageIcon: logoInventra, pagePath: "/acessibilidade" },
    ] },
    { sectionTitle: "titlo 2", menuOptions: [
        { page: "Dashboard", pageIcon: logoInventra, pagePath: "/home" },
        { page: "Produtos", pageIcon: logoInventra, pagePath: "/produtos" },
        { page: "Estoque", pageIcon: logoInventra, pagePath: "/estoque" },
        { id: "cozinhas-operacao-1", page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas" },
        { id: "cozinhas-operacao-2", page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas" },
        { id: "cozinhas-operacao-3", page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas" },
    ] },
    { sectionTitle: "titlo 3", menuOptions: [
        { page: "Início", pageIcon: logoInventra, pagePath: "/" },
        { page: "Estoque", pageIcon: logoInventra, pagePath: "/estoque" },
        { id: "cozinhas-cadastros-1", page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas" },
        { id: "cozinhas-cadastros-2", page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas" },
        { id: "cozinhas-cadastros-3", page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas" },
    ] },
];

function PrivateRoute({ allowPublic = false }: PrivateRouteProps) {
    const [fixed, setFixed] = useState(false);
    const location = useLocation();
    if (!getSession()) {
        if (!allowPublic) return <Navigate to="/login" replace state={{ from: location }} />;
        return <><AccessibilityTools /><Outlet /></>;
    }
    return (
        <div className="min-w-0">
            <Sidebar logo={logoInventra} logoMark="Inventra" menuSections={menuSections} fixo={fixed} setFixo={setFixed} />
            <div className={`min-w-0 transition-all duration-300 large-text:ml-0 ${fixed ? "lg:ml-70" : "lg:ml-24"}`}>
                <AccessibilityTools />
                <Outlet />
            </div>
        </div>
    );
}

export default PrivateRoute;
