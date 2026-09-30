import { BrowserRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
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
                </Route>
            </Routes>
        </BrowserRouter>
    )
}