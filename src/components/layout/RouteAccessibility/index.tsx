import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function RouteAccessibility() {
    const { pathname } = useLocation();
    const previousPath = useRef<string | null>(null);
    useEffect(() => {
        const heading = document.querySelector<HTMLElement>("h1");
        document.title = `${heading?.textContent?.trim() ?? "Página"} · Inventra`;
        const changed = previousPath.current !== null && previousPath.current !== pathname;
        previousPath.current = pathname;
        if (!changed) return;
        const frame = requestAnimationFrame(() => {
            const target = document.querySelector<HTMLElement>("h1") ?? document.getElementById("conteudo-principal");
            if (target) { target.tabIndex = -1; target.focus(); }
        });
        return () => cancelAnimationFrame(frame);
    }, [pathname]);
    return (
        <a className="fixed left-3 right-3 top-3 z-100 -translate-y-80 rounded-xl border border-history-border bg-surface px-4 py-3 font-bold text-sidebar-purple focus:translate-y-0" href="#conteudo-principal" onClick={() => document.getElementById("conteudo-principal")?.focus()}>
            Pular para o conteúdo
        </a>
    );
}

export default RouteAccessibility;
