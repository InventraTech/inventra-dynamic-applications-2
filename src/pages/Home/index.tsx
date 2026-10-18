import { Link } from "react-router-dom";

function Home() {
    return (
        <main id="conteudo-principal" tabIndex={-1} className="flex min-h-screen min-w-0 flex-col items-start justify-center gap-4 bg-surface p-6">
            <h1 className="text-2xl font-bold text-sidebar-purple">Painel</h1>
            <p className="max-w-prose text-history-muted">As métricas do painel estão em preparação. Você já pode consultar o histórico e personalizar a acessibilidade.</p>
            <Link className="rounded-xl border border-history-border px-4 py-3 font-bold text-sidebar-purple hover:bg-sidebar-active" to="/historico">Abrir histórico</Link>
            <Link className="rounded-xl px-4 py-3 font-semibold text-sidebar-purple" to="/acessibilidade">Ajustar acessibilidade</Link>
        </main>
    );
}

export default Home;
