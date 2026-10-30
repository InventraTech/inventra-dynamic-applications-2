import Mascote from "../../ui/Mascot";

function ProfilePasswordTip() {
    return (
        <aside className="flex min-w-0 items-center gap-3 rounded-3xl border border-sidebar-line bg-sidebar-active p-4" aria-label="Dica de segurança">
            <Mascote size="amplo" className="size-16 w-16 shrink-0 object-contain" />
            <div className="min-w-0">
                <h2 className="font-k2d text-sm font-bold text-sidebar-text">Senha boa é senha longa</h2>
                <p className="mt-1 font-k2d text-sm leading-relaxed text-history-muted">Prefira uma frase fácil de lembrar, só sua. É mais difícil de adivinhar do que uma sequência curta de símbolos.</p>
            </div>
        </aside>
    );
}

export default ProfilePasswordTip;
