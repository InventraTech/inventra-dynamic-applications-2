import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";

export default function StockAccessDenied() {
    const navigate = useNavigate();

    return (
        <section className="grid min-h-72 place-content-center justify-items-center gap-3 rounded-3xl bg-surface p-6 text-center shadow-history-card sm:p-8" aria-labelledby="estoque-acesso-negado-heading">
            <span className="grid size-16 place-items-center rounded-full bg-sidebar-active" aria-hidden="true">
                <svg className="size-9 text-sidebar-purple" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 3.5 34 11.5v17L20 36.5 6 28.5v-17l14-8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                    <rect x="13.5" y="18" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="2.5" />
                    <path d="M16.5 18v-3a3.5 3.5 0 1 1 7 0v3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </span>
            <h2 id="estoque-acesso-negado-heading" className="m-0 font-k2d text-xl font-bold text-ink">Você não tem acesso ao Estoque</h2>
            <p className="m-0 max-w-prose text-sm leading-relaxed text-history-muted">O Estoque é de supervisores e estoquistas da cozinha. Peça acesso ao supervisor da sua cozinha.</p>
            <Button variant="outline" type="button" onClick={() => navigate("/home")}>Voltar ao Painel</Button>
        </section>
    );
}
