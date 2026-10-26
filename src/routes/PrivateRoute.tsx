import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import AccessibilityTools from "../components/layout/AccessibilityTools";
import type { MenuSection } from "../types/sidebar";
import logoInventra from "../assets/icons/logo-inventra.svg";
import dashboardIcon from "../assets/icons/dashboard.svg";
import requisitionIcon from "../assets/icons/requisicao.svg";
import stockIcon from "../assets/icons/estoque.svg";
import inventoryIcon from "../assets/icons/pre-lista.svg";
import productIcon from "../assets/icons/produto.svg";
import supplierIcon from "../assets/icons/fornecedor.svg";
import historyIcon from "../assets/icons/historico.svg";
import kitchenIcon from "../assets/icons/cozinha.svg";
import teamIcon from "../assets/icons/equipe-linha.svg";
import settingsIcon from "../assets/icons/config.svg";
import accessibilityIcon from "../assets/icons/acessibilidade.svg";
import { getSession } from "../services/authSession";
import { readSidebarFixedPreference, saveSidebarFixedPreference } from "../utils/sidebarPreferences";

interface PrivateRouteProps { allowPublic?: boolean }

const menuSections: MenuSection[] = [
    { sectionTitle: "Visão geral", menuOptions: [
        { id: "painel", page: "Painel", pageIcon: dashboardIcon, pagePath: "/home", availability: "available" },
    ] },
    { sectionTitle: "Operação", menuOptions: [
        { id: "requisicoes", page: "Requisições", pageIcon: requisitionIcon, availability: "coming-soon" },
        { id: "estoque", page: "Estoque", pageIcon: stockIcon, availability: "coming-soon" },
        { id: "inventarios", page: "Inventários", pageIcon: inventoryIcon, availability: "coming-soon" },
        { id: "produtos", page: "Produtos", pageIcon: productIcon, pagePath: "/produtos", availability: "available" },
        { id: "fornecedores", page: "Fornecedores", pageIcon: supplierIcon, availability: "coming-soon" },
        { id: "historico", page: "Histórico", pageIcon: historyIcon, pagePath: "/historico", availability: "available" },
    ] },
    { sectionTitle: "Administração", menuOptions: [
        { id: "cozinha", page: "Cozinha", pageIcon: kitchenIcon, availability: "coming-soon" },
        { id: "equipe-acessos", page: "Equipe e acessos", pageIcon: teamIcon, pagePath: "/equipe-acessos", availability: "available" },
    ] },
    { sectionTitle: "Preferências", menuOptions: [
        { id: "configuracoes-conta", page: "Configurações da conta", pageIcon: settingsIcon, pagePath: "/perfil", availability: "available" },
        { id: "acessibilidade", page: "Acessibilidade", pageIcon: accessibilityIcon, pagePath: "/acessibilidade", availability: "available" },
    ] },
];

function PrivateRoute({ allowPublic = false }: PrivateRouteProps) {
    const [fixed, setFixedState] = useState(readSidebarFixedPreference);
    const location = useLocation();

    function setFixed(value: boolean) {
        setFixedState(value);
        saveSidebarFixedPreference(value);
    }

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
