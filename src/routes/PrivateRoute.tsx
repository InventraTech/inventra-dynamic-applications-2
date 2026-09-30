import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import type { Menu } from "../types/menu";
import logoInventra from "../assets/img/favicon.svg";
import { useState } from "react";


function PrivateRoute() {
    const [fix, setfix] = useState<boolean>(false)
    const compactedMain = fix ? "ml-70" : "ml-24";

    const options: Menu[] = [
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
                {page: "Início", pageIcon: logoInventra, pagePath: "/"},
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

    return (
        <>
            <Sidebar logo={logoInventra} brandName="Inventra" menu={options} fix={fix} setfix={setfix}/>
            <main className={`${compactedMain} transition-all duration-500`}>
                <Outlet />
            </main>
        </>
    )
};

export default PrivateRoute;