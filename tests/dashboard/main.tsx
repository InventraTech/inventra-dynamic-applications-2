import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AccessibilityProvider } from "../../src/context/AccessibilityContext";
import PrivateRoute from "../../src/routes/PrivateRoute";
import RouteAccessibility from "../../src/components/layout/RouteAccessibility";
import Dashboard from "../../src/pages/Dashboard";
import "../../src/index.css";
import "@fontsource/k2d";
import ValidationControls from "./ValidationControls";

createRoot(document.getElementById("root")!).render(<StrictMode><AccessibilityProvider><MemoryRouter initialEntries={["/dashboard"]}><RouteAccessibility /><p className="bg-feedback-info-bg p-3 text-center text-sm font-bold text-feedback-info">Validação isolada: dados fictícios, sem conexão com a API.</p><ValidationControls /><Routes><Route element={<PrivateRoute />}><Route path="*" element={<Dashboard />} /></Route></Routes></MemoryRouter></AccessibilityProvider></StrictMode>);
