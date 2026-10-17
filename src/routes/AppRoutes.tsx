import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
import Historico from "../pages/Historic";
import Login from "../pages/Login";
import Register from "../pages/Register";
import KitchenRegistration from "../pages/KitchenRegistration";
import Accessibility from "../pages/Accessibility";
import NotFound from "../pages/NotFound";
import RouteAccessibility from "../components/layout/RouteAccessibility";
import PublicLayout from "./PublicLayout";

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
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
