import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
import Historico from "../pages/Historico";
import Login from "../pages/Login";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Páginas Públicas */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />

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
