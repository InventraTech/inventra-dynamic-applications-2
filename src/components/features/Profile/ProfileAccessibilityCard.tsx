import { Link } from "react-router-dom";

import accessibilityIcon from "../../../assets/icons/acessibilidade.svg";
import { useAccessibility } from "../../../context/accessibility";

function ProfileAccessibilityCard() {
    const { settings } = useAccessibility();
    const activePreferences = [
        settings.fontScale !== 100,
        settings.dyslexiaFont,
        settings.letterSpacing !== 0,
        settings.lineSpacing !== 1.5,
        settings.readingRuler,
        settings.contrastMode !== "normal",
        settings.colorVisionMode !== "none",
        settings.libras,
        settings.readAloud,
        settings.reduceMotion || settings.removeMotion,
        settings.largeCursor,
        settings.keyboardFocus !== "standard",
        !settings.shortcutsEnabled,
        settings.visualAlerts !== "banner-icon",
    ].filter(Boolean).length;

    return (
        <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-labelledby="perfil-acessibilidade-titulo">
            <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-history-avatar">
                    <img className="size-6" src={accessibilityIcon} alt="" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h2 id="perfil-acessibilidade-titulo" className="font-k2d text-lg font-bold text-sidebar-text">Acessibilidade</h2>
                    <p className="font-k2d text-sm leading-relaxed text-history-muted">Fonte, contraste, Libras e atalhos configurados para facilitar o uso.</p>
                </div>
            </div>
            <p className="mt-3 inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-sidebar-purple bg-sidebar-active px-3 py-1 font-k2d text-sm font-bold text-sidebar-purple">
                <span className="size-2 shrink-0 rounded-full bg-login-gold" aria-hidden="true" />
                {activePreferences} {activePreferences === 1 ? "preferência personalizada" : "preferências personalizadas"}
            </p>
            <p className="mt-2 font-k2d text-xs leading-relaxed text-history-muted">As preferências ficam salvas neste navegador.</p>
            <Link className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-history-border bg-surface px-4 py-2 font-k2d text-sm font-bold text-sidebar-purple transition-colors hover:bg-history-card-header focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to="/acessibilidade">
                Abrir Acessibilidade
            </Link>
        </section>
    );
}

export default ProfileAccessibilityCard;
