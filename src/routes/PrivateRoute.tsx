import { Navigate, Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import type { MenuSection } from "../types/sidebar";
import logoInventra from "../assets/icons/favicon.svg";
import { useState } from "react";
import { getSession } from "../services/authSession";


function PrivateRoute() {
    const [fix, setfix] = useState<boolean>(false)
    const location = useLocation();
    const isAuthenticated = Boolean(getSession());
    const compactedMain = fix ? "ml-70" : "ml-24";

    const options: MenuSection[] = [
        {
            sectionTitle: "titlo 1",
            menuOptions: [
                {page: "Login", pageIcon: logoInventra, pagePath: "/"},
                {page: "Início", pageIcon: logoInventra, pagePath: "/home"},
                {page: "Acessibilidade", pageIcon: logoInventra, pagePath: "/"}
            ]
        },
        {
            sectionTitle: "titlo 2",
            menuOptions: [
                {page: "Dashboard", pageIcon: logoInventra, pagePath: "/home"},
                {page: "Produtos", pageIcon: logoInventra, pagePath: "/produtos"},
                {page: "Estoque", pageIcon: logoInventra, pagePath: "/estoque"},
                {page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas"},
                {page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas"},
                {page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas"}
            ]
        },
        {
            sectionTitle: "titlo 3",
            menuOptions: [
                {page: "Início", pageIcon: logoInventra, pagePath: "/"},
                {page: "Estoque", pageIcon: logoInventra, pagePath: "/estoque"},
                {page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas"},
                {page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas"},
                {page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas"}
            ]
        },
    ]

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return (
        <>
            <Sidebar logo={logoInventra} logoMark="Inventra" menuSections={options} fixo={fix} setFixo={setfix}/>
            <main className={`${compactedMain} transition-all duration-500`}>
                <Outlet />
            </main>
        </>
    )
};

export default PrivateRoute;
