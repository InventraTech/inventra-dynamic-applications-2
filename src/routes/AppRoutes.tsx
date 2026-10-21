import { BrowserRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
import Historico from "../pages/Historic";
import Login from "../pages/Login";
import Register from "../pages/Register";
import KitchenRegistration from "../pages/KitchenRegistration";
import Accessibility from "../pages/Accessibility";
import NotFound from "../pages/NotFound";
import TeamAccess from "../pages/TeamAccess";
import Products from "../pages/Products";
import ProductCatalog from "../components/features/Products/ProductCatalog";
import ProductEditor from "../components/features/Products/ProductEditor";
import RouteAccessibility from "../components/layout/RouteAccessibility";
import PublicLayout from "./PublicLayout";
import { getSession } from "../services/authSession";

function SupervisorOnlyRoute() {
    const profile = getSession()?.user.profile;
    const accessType = typeof profile === "string" ? profile : profile?.accessType;

    return accessType?.toLocaleUpperCase("pt-BR") === "SUPERVISOR"
        ? <Outlet />
        : <Navigate to="/home" replace />;
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <RouteAccessibility />
            <Routes>
                {/* Páginas Públicas */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Register />} />
                    <Route path="/cadastro/cozinha" element={<KitchenRegistration />} />
                    <Route path="/accessibilityconfig" element={<Navigate to="/acessibilidade" replace />} />
                    <Route path="*" element={<NotFound />} />
                </Route>

                <Route element={<PrivateRoute allowPublic />}>
                    <Route path="/acessibilidade" element={<Accessibility />} />
                </Route>

                {/* Páginas Privadas */}
                <Route element={<PrivateRoute />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/historico" element={<Navigate to="/historico/retiradas" replace />} />
                    <Route path="/historico/retiradas" element={<Historico mode="withdrawal" />} />
                    <Route path="/historico/solicitacoes" element={<Historico mode="purchase" />} />
                    <Route element={<SupervisorOnlyRoute />}>
                        <Route path="/equipe-acessos" element={<TeamAccess />} />
                        <Route path="/produtos" element={<Products />}>
                            <Route index element={<ProductCatalog />} />
                            <Route path="novo" element={<ProductEditor mode="create" />} />
                            <Route path=":productId/editar" element={<ProductEditor mode="edit" />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
