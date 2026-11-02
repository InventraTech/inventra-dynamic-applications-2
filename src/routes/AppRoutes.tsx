import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";

import Historico from "../pages/Historic";
import Login from "../pages/Login";
import Register from "../pages/Register";
import KitchenRegistration from "../pages/KitchenRegistration";
import Accessibility from "../pages/Accessibility";
import NotFound from "../pages/NotFound";
import TeamAccess from "../pages/TeamAccess";
import Products from "../pages/Products";
import RouteAccessibility from "../components/layout/RouteAccessibility";
import ProfileLoadingSkeleton from "../components/features/Profile/ProfileLoadingSkeleton";
import ProfileErrorBoundary from "../components/features/Profile/ProfileErrorBoundary";
import KitchenSettingsSkeleton from "../components/features/Kitchen/KitchenSettingsSkeleton";
import { displayProfileRole, getProfileDisplayName, getProfileInitials } from "../components/features/Profile/profileHelpers";
import SupplierLoadingSkeleton from "../components/features/Suppliers/SupplierLoadingSkeleton";
import PublicLayout from "./PublicLayout";
import { getSession } from "../services/authSession";
import Topbar from "../components/layout/Topbar";

const ProductCatalog = lazy(() => import("../components/features/Products/ProductCatalog"));
const ProductEditor = lazy(() => import("../components/features/Products/ProductEditor"));
const ProductDetail = lazy(() => import("../components/features/Products/ProductDetail"));
const ProductReferenceManagement = lazy(() => import("../components/features/Products/ProductReferenceManagement"));
const Profile = lazy(() => import("../pages/Profile"));
const Requisitions = lazy(() => import("../pages/Requisitions"));
const Stock = lazy(() => import("../pages/Stock"));
const Kitchen = lazy(() => import("../pages/Kitchen"));
const Suppliers = lazy(() => import("../pages/Suppliers"));
const Dashboard = lazy(() => import("../pages/Dashboard"));

function DashboardRouteLoading() {
    return <main id="conteudo-principal" tabIndex={-1} className="min-w-0 p-4 outline-none sm:p-6" aria-busy="true"><h1 className="text-2xl font-bold text-heading">Painel</h1><p role="status" className="mt-4 text-history-muted">Carregando painel gerencial…</p><div className="mt-5 min-h-40 rounded-3xl bg-surface shadow-history-card motion-safe:animate-pulse" aria-hidden="true" /></main>;
}

function ProductRouteLoading() {
    return <section className="flex min-w-0 flex-col gap-4 px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3" aria-busy="true"><p className="sr-only" role="status" aria-live="polite">Carregando tela de produtos…</p><div className="h-12 w-full rounded-2xl bg-surface motion-safe:animate-pulse" aria-hidden="true" /><div className="min-h-72 rounded-3xl bg-surface shadow-history-card motion-safe:animate-pulse" aria-hidden="true" /></section>;
}

function withProductLoading(element: ReactNode) {
    return <Suspense fallback={<ProductRouteLoading />}>{element}</Suspense>;
}

function ProfileRouteLoading() {
    const user = getSession()?.user;
    const profile = user?.profile;
    const userName = getProfileDisplayName(user?.name ?? "Usuário");

    return (
        <>
            <Topbar
                title="Perfil"
                description="Seus dados e a segurança da sua conta"
                userInitials={getProfileInitials(userName)}
                userPhotoUrl={user?.photoUrl}
                userName={userName}
                userRole={displayProfileRole(typeof profile === "string" ? profile : profile?.accessType)}
            />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 outline-none">
                <ProfileLoadingSkeleton />
            </main>
        </>
    );
}

function withProfileLoading(element: ReactNode) {
    return <Suspense fallback={<ProfileRouteLoading />}>{element}</Suspense>;
}

function RequisitionRouteLoading() {
    return (
        <main id="conteudo-principal" tabIndex={-1} className="min-w-0 p-4 outline-none md:p-6" aria-busy="true">
            <h1 className="sr-only">Requisições</h1>
            <p role="status" aria-live="polite" className="sr-only">Carregando requisições…</p>
            <div className="min-h-28 rounded-3xl bg-surface shadow-history-card motion-safe:animate-pulse" aria-hidden="true" />
            <div className="mt-5 grid gap-4 sm:grid-cols-3" aria-hidden="true">
                <div className="h-24 rounded-2xl bg-surface motion-safe:animate-pulse" />
                <div className="h-24 rounded-2xl bg-surface motion-safe:animate-pulse" />
                <div className="h-24 rounded-2xl bg-surface motion-safe:animate-pulse" />
            </div>
            <div className="mt-5 min-h-80 rounded-3xl bg-surface shadow-history-card motion-safe:animate-pulse" aria-hidden="true" />
        </main>
    );
}

function withRequisitionLoading(element: ReactNode) {
    return <Suspense fallback={<RequisitionRouteLoading />}>{element}</Suspense>;
}

function StockRouteLoading() {
    return (
        <main id="conteudo-principal" tabIndex={-1} className="flex min-w-0 flex-col gap-4 px-4 pb-8 pt-5 outline-none sm:gap-5 sm:px-6 sm:pt-6" aria-busy="true">
            <h1 className="sr-only">Estoque</h1>
            <p role="status" aria-live="polite" className="sr-only">Carregando estoque da cozinha…</p>
            <div className="min-h-40 rounded-3xl bg-brand motion-safe:animate-pulse" aria-hidden="true" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">{[1, 2, 3, 4].map((item) => <div key={item} className="h-20 rounded-3xl bg-surface motion-safe:animate-pulse" />)}</div>
            <div className="grid gap-4 xl:grid-cols-2" aria-hidden="true"><div className="min-h-64 rounded-3xl bg-surface motion-safe:animate-pulse" /><div className="min-h-64 rounded-3xl bg-surface motion-safe:animate-pulse" /></div>
            <div className="min-h-96 rounded-3xl bg-surface motion-safe:animate-pulse" aria-hidden="true" />
        </main>
    );
}

function withStockLoading(element: ReactNode) {
    return <Suspense fallback={<StockRouteLoading />}>{element}</Suspense>;
}

function KitchenRouteLoading() {
    const session = getSession();
    const nameParts = (session?.user.name ?? "Usuário").trim().split(/\s+/).filter(Boolean);
    const initials = nameParts.length > 1 ? [nameParts[0], nameParts.at(-1)] : nameParts;
    const userInitials = initials.map((part) => [...(part ?? "")][0]?.toLocaleUpperCase("pt-BR") ?? "").join("") || "IN";
    const userName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts.at(-1)}` : nameParts[0] ?? "Usuário";
    const profile = session?.user.profile;
    const userRole = typeof profile === "string" ? profile : profile?.name ?? profile?.accessType?.replaceAll("_", " ") ?? "Membro";

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar title="Cozinha" description="Os dados, o código e a situação da sua cozinha" userInitials={userInitials} userPhotoUrl={session?.user.photoUrl} userName={userName} userRole={userRole} />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 outline-none"><KitchenSettingsSkeleton /></main>
        </div>
    );
}

function withKitchenLoading(element: ReactNode) {
    return <Suspense fallback={<KitchenRouteLoading />}>{element}</Suspense>;
}

function SupplierRouteLoading() {
    const user = getSession()?.user;
    const profile = user?.profile;
    const userName = getProfileDisplayName(user?.name ?? "Usuário");
    const accessType = typeof profile === "string" ? profile : profile?.accessType;

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar
                title="Fornecedores"
                description="Cadastros compartilhados de empresas fornecedoras"
                userInitials={getProfileInitials(userName)}
                userPhotoUrl={user?.photoUrl}
                userName={userName}
                userRole={displayProfileRole(accessType)}
            />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                <SupplierLoadingSkeleton />
            </main>
        </div>
    );
}

function withSupplierLoading(element: ReactNode) {
    return <Suspense fallback={<SupplierRouteLoading />}>{element}</Suspense>;
}

function SupervisorOnlyRoute() {
    const profile = getSession()?.user.profile;
    const accessType = typeof profile === "string" ? profile : profile?.accessType;

    return accessType?.toLocaleUpperCase("pt-BR") === "SUPERVISOR"
        ? <Outlet />
        : <Navigate to="/home" replace />;
}

function RequisitionAccessRoute() {
    const profile = getSession()?.user.profile;
    const accessType = typeof profile === "string" ? profile : profile?.accessType;
    const allowed = ["SUPERVISOR", "COMPRADOR"].includes(accessType?.toLocaleUpperCase("pt-BR") ?? "");

    return allowed ? <Outlet /> : <Navigate to="/home" replace />;
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
                    <Route path="/home" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Suspense fallback={<DashboardRouteLoading />}><Dashboard /></Suspense>} />
                    <Route path="/perfil" element={<ProfileErrorBoundary>{withProfileLoading(<Profile />)}</ProfileErrorBoundary>} />
                    <Route path="/historico" element={<Navigate to="/historico/retiradas" replace />} />
                    <Route path="/historico/retiradas" element={<Historico mode="withdrawal" />} />
                    <Route path="/historico/solicitacoes" element={<Historico mode="purchase" />} />
                    <Route element={<RequisitionAccessRoute />}>
                        <Route path="/requisicoes" element={withRequisitionLoading(<Requisitions mode="list" />)} />
                        <Route path="/requisicoes/nova" element={withRequisitionLoading(<Requisitions mode="create" />)} />
                        <Route path="/requisicoes/:requestId/editar" element={withRequisitionLoading(<Requisitions mode="edit" />)} />
                        <Route path="/requisicoes/:requestId" element={withRequisitionLoading(<Requisitions mode="detail" />)} />
                    </Route>
                    <Route path="/estoque" element={withStockLoading(<Stock />)} />
                    <Route path="/cozinha" element={withKitchenLoading(<Kitchen />)} />
                    <Route path="/fornecedores" element={withSupplierLoading(<Suppliers />)} />
                    <Route element={<SupervisorOnlyRoute />}>
                        <Route path="/equipe-acessos" element={<TeamAccess />} />
                        <Route path="/produtos" element={<Products />}>
                            <Route index element={withProductLoading(<ProductCatalog />)} />
                            <Route path="novo" element={withProductLoading(<ProductEditor mode="create" />)} />
                            <Route path="categorias-unidades" element={withProductLoading(<ProductReferenceManagement />)} />
                            <Route path=":productId" element={withProductLoading(<ProductDetail />)} />
                            <Route path=":productId/editar" element={withProductLoading(<ProductEditor mode="edit" />)} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
