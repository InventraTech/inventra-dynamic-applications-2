import { Outlet } from "react-router-dom";
import { Navigate, useLocation } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import type { MenuSection } from "../types/menu";
import logoInventra from "../assets/icons/favicon.svg";
import { useEffect, useState } from "react";
import { getSession, SESSION_EXPIRED_EVENT } from "../services/authSession";


function PrivateRoute() {
    const [fixo, setFixo] = useState<boolean>(false)
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getSession()));
    const location = useLocation();
    const variableSpacedMain = fixo ? "ml-70" : "ml-24";

    useEffect(() => {
        const handleSessionExpired = () => setIsAuthenticated(false);
        window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    }, []);

    const options: MenuSection[] = [
        {
            sectionTitle: "Principal",
            menuOptions: [
                {page: "Dashboard", pageIcon: logoInventra, pagePath: "/home"},
                {page: "Produtos", pageIcon: logoInventra, pagePath: "/produtos"},
                {page: "Estoque", pageIcon: logoInventra, pagePath: "/estoque"},
                {page: "Requisições", pageIcon: logoInventra, pagePath: "/requisicoes"},
                {page: "Histórico", pageIcon: logoInventra, pagePath: "/historico"},
                {page: "Pré-Listas", pageIcon: logoInventra, pagePath: "/pre-listas"}
            ]
        },
        {
            sectionTitle: "Cadastros",
            menuOptions: [
                {page: "Fornecedores", pageIcon: logoInventra, pagePath: "/fornecedores"},
                {page: "Configurações", pageIcon: logoInventra, pagePath: "/configuracoes"}
            ]
        }
    ]

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return (
        <>
            <Sidebar logo={logoInventra} logoMark="Inventra" menuSections={options} fixo={fixo} setFixo={setFixo}/>
            <main className={`${variableSpacedMain} transition-all duration-500`}>
                <Outlet />
            </main>
        </>
    )
};

export default PrivateRoute;
