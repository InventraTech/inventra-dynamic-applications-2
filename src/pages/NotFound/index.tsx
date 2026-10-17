import { Link } from "react-router-dom";

function NotFound() {
    return (
        <main id="conteudo-principal" tabIndex={-1} className="flex min-h-screen min-w-0 flex-col items-center justify-center gap-4 bg-surface p-6 text-center">
            <h1 className="text-2xl font-bold text-sidebar-purple">Página não encontrada</h1>
            <p className="text-history-muted">O endereço pode ter mudado ou ainda não estar disponível.</p>
            <Link className="rounded-xl border border-history-border px-4 py-3 font-bold text-sidebar-purple hover:bg-sidebar-active" to="/login">Voltar ao início</Link>
            <Link className="rounded-xl px-4 py-3 text-sidebar-purple underline" to="/acessibilidade">Ajustar acessibilidade</Link>
        </main>
    );
}

export default NotFound;
