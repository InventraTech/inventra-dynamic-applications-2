// Página de validação servida apenas pelo Vite local; não cria sessão nem consulta a API.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "../../src/index.css";
import "@fontsource/k2d";
import { AccessibilityProvider } from "../../src/context/AccessibilityContext";
import AccessibilityTools from "../../src/components/layout/AccessibilityTools";
import RouteAccessibility from "../../src/components/layout/RouteAccessibility";
import Sidebar from "../../src/components/layout/Sidebar";
import Topbar from "../../src/components/layout/Topbar";
import HistoryCard from "../../src/components/features/History/HistoryCard";
import HistoryTabs from "../../src/components/features/History/HistoryTabs";
import Feedback from "../../src/components/ui/Feedback";
import logo from "../../src/assets/icons/logo-inventra.svg";
import type { RequisitionStatus } from "../../src/types/api";

export function Fixture() {
    const [fixed, setFixed] = useState(false);
    const [expanded, setExpanded] = useState(true);
    return <>
        <RouteAccessibility />
        <Sidebar logo={logo} logoMark="Inventra" fixo={fixed} setFixo={setFixed} menuSections={[{ sectionTitle: "Conta e preferências", menuOptions: [{ page: "Histórico", pagePath: "/historico", pageIcon: logo }, { page: "Acessibilidade", pagePath: "/acessibilidade", pageIcon: logo }, { page: "Configurações da conta", pagePath: "/configuracoes", pageIcon: logo }] }]} />
        <div className={`${fixed ? "lg:ml-70" : "lg:ml-24"} min-w-0 large-text:ml-0`}>
            <AccessibilityTools />
            <Topbar title="Validação local de acessibilidade" description="Componentes reais com dados fictícios exclusivos desta página de validação" userName="Nome completo com sobrenome muito extenso" userInitials="NC" userRole="Supervisor" />
            <main id="conteudo-principal" tabIndex={-1} className="flex min-w-0 flex-col gap-4 p-4 pb-24">
                <HistoryTabs mode="purchase" />
                <Feedback severity="error">Exemplo de erro: confira o campo informado.</Feedback>
                <Feedback severity="success">Exemplo de sucesso: alteração concluída.</Feedback>
                {(["APPROVED", "UNDER_REVIEW", "REJECTED", "CANCELLED"] as RequisitionStatus[]).map((status, index) => <HistoryCard key={status} mode="purchase" expanded={expanded} onToggle={() => setExpanded(!expanded)} request={{ id: index + 1, type: "PURCHASE", status, createdAt: "2026-10-12T10:30:00", approvedAt: null, requester: { id: "1", name: "Solicitante com sobrenome extremamente comprido" }, approver: null, reason: "Preparação da refeição para todos os integrantes da cozinha", items: [{ id: 1, quantity: 1200, product: { id: 1, name: "Produto com nome extenso para conferir a quebra de texto", brand: "Marca demonstrativa", unit: "kg" }, note: "Observação extensa, com informação que deve permanecer legível e acessível", estimatedPrice: 120.5, suggestedSupplier: null }] }} />)}
            </main>
        </div>
    </>;
}

const root = createRoot(document.getElementById("root")!);
root.render(<AccessibilityProvider><BrowserRouter><Fixture /></BrowserRouter></AccessibilityProvider>);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
