import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import type { MenuSections } from "../components/Sidebar";
import logoInventra from "../assets/img/favicon.svg";
import { useState } from "react";


function PrivateRoute() {
    const [fixo, setFixo] = useState<boolean>(false)
    const variableSpacedMain = fixo ? "ml-70" : "ml-24";

    const options: MenuSections[] = [
        {
            sectionTitle: "Tolete",
            menuOptions: [
                {page: "Início", pageIcon: logoInventra, pagePath: "/"},
                {page: "Estoque", pageIcon: logoInventra, pagePath: "/estoque"},
                {page: "Cozinhas", pageIcon: logoInventra, pagePath: "/cozinhas"}
            ]
        }
    ]

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