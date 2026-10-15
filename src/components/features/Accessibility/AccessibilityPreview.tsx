import type { AccessibilitySettings } from "../../../types/accessibility";
import { useAccessibility } from "../../../context/accessibility";

interface AccessibilityPreviewProps {
    settings: AccessibilitySettings;
    activeFeatures: string[];
}

const contrastPreview = {
    normal: "border-history-border bg-surface text-sidebar-text",
    dark: "border-slate-800 bg-slate-950 text-on-brand",
    reinforced: "border-black bg-surface text-ink ring-1 ring-black",
    "yellow-black": "border-yellow-300 bg-black text-yellow-300",
} as const;

const shortcuts = [
    { keys: "Alt + A", action: "Ativar ou ocultar a régua de leitura" },
    { keys: "Alt + V", action: "Ligar ou desligar a leitura em voz" },
    { keys: "Alt + L", action: "Mostrar ou ocultar Libras" },
    { keys: "Alt + + / −", action: "Aumentar ou reduzir o texto" },
];

function AccessibilityPreview({ settings, activeFeatures }: AccessibilityPreviewProps) {
    const { settings: applied } = useAccessibility();
    const scale = settings.fontScale / applied.fontScale;

    return (
        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-5 lg:self-start large-text:static">
            <section className="rounded-3xl border border-history-border bg-surface p-5 shadow-history-card max-sm:rounded-2xl max-sm:p-4">
                <div className="mb-4 flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="font-k2d text-base font-bold text-sidebar-text">Prévia ao vivo</h2>
                        <p className="mt-1 font-k2d text-xs text-history-muted">As opções aparecem aqui antes de salvar.</p>
                    </div>
                    <span className="rounded-full bg-sidebar-active px-2.5 py-1 font-k2d text-xs font-semibold text-sidebar-purple">Exemplo</span>
                </div>

                <article
                    data-accessibility-preview
                    className={`relative min-w-0 rounded-2xl border p-4 transition-colors ${contrastPreview[settings.contrastMode]}`}
                    style={{
                        fontSize: `${scale}em`,
                        letterSpacing: `${settings.letterSpacing}em`,
                        lineHeight: settings.lineSpacing,
                        fontFamily: settings.dyslexiaFont ? "var(--font-opendyslexic)" : "var(--font-k2d)",
                        backgroundColor: settings.contrastMode === "dark" ? "#0f172a" : settings.contrastMode === "yellow-black" ? "#000000" : "#ffffff",
                        color: settings.contrastMode === "dark" ? "#ffffff" : settings.contrastMode === "yellow-black" ? "#ffef00" : "#221b2e",
                    }}
                    aria-label="Prévia de um cartão de produto fictício"
                >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="font-bold">Arroz natural</p>
                            <p className="mt-0.5 opacity-70">Camil · 1,5 kg</p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-sidebar-active px-2 py-1 font-bold text-sidebar-purple">19 un.</span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 border-t border-current/30 pt-3 sm:grid-cols-2 large-text:grid-cols-1">
                        <div><p className="opacity-65">Estoque mínimo</p><p className="mt-0.5 font-semibold">7 unidades</p></div>
                        <div><p className="opacity-65">Validade</p><p className="mt-0.5 font-semibold">12 jun. · 3 dias</p></div>
                    </div>
                    {settings.readingRuler && (
                        <span
                            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-y border-sidebar-purple/30 bg-login-gold/25"
                            style={{ height: settings.readingRulerSize === "small" ? 24 : settings.readingRulerSize === "large" ? 48 : 36 }}
                            aria-hidden="true"
                        />
                    )}
                </article>
                <p className="mt-3 font-k2d text-xs leading-relaxed text-history-muted">Conteúdo fictício apenas para visualizar os ajustes; não consulta o estoque.</p>

                {settings.readAloud && typeof window !== "undefined" && "speechSynthesis" in window && (
                    <button data-no-read-aloud
                        className="mt-4 min-h-10 w-full rounded-xl border border-history-border px-3 py-2 font-k2d text-xs font-semibold text-sidebar-purple transition-colors hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-purple"
                        type="button"
                        onClick={() => {
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance("Arroz natural, Camil, 19 unidades. Validade em três dias.");
                            utterance.lang = "pt-BR";
                            utterance.rate = settings.speechRate;
                            window.speechSynthesis.speak(utterance);
                        }}
                    >
                        Ouvir exemplo
                    </button>
                )}
            </section>

            <section className="rounded-3xl border border-history-border bg-surface p-5 shadow-history-card max-sm:rounded-2xl max-sm:p-4">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="font-k2d text-base font-bold text-sidebar-text">Recursos ativos</h2>
                        <p className="mt-1 font-k2d text-xs text-history-muted">Preferências já salvas e aplicadas</p>
                    </div>
                    <span className="rounded-full bg-sidebar-active px-2.5 py-1 font-k2d text-xs font-bold text-sidebar-purple">{activeFeatures.length}</span>
                </div>
                {activeFeatures.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                        {activeFeatures.map((feature) => (
                            <li className="rounded-full border border-history-border bg-history-card-header px-3 py-1.5 font-k2d text-xs font-medium text-sidebar-text" key={feature}>
                                {feature}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-4 rounded-xl bg-history-card-header px-3 py-3 font-k2d text-xs leading-relaxed text-history-muted">
                        Nenhum recurso opcional está ligado. Você pode escolher apenas os que ajudam no seu uso.
                    </p>
                )}
            </section>

            <section className="rounded-3xl border border-history-border bg-surface p-5 shadow-history-card max-sm:rounded-2xl max-sm:p-4">
                <h2 className="font-k2d text-base font-bold text-sidebar-text">Atalhos de teclado</h2>
                <p className="mt-1 font-k2d text-xs text-history-muted">{applied.shortcutsEnabled ? "Disponíveis fora dos campos de digitação." : "Atalhos desativados nas preferências salvas."}</p>
                <ul className="mt-4 flex flex-col gap-3">
                    {shortcuts.map((shortcut) => (
                        <li className="flex flex-wrap items-center justify-between gap-3" key={shortcut.keys}>
                            <span className="min-w-0 font-k2d text-xs leading-relaxed text-sidebar-text">{shortcut.action}</span>
                            <kbd className="shrink-0 rounded-lg border border-history-border bg-history-card-header px-2 py-1 font-k2d text-xs font-semibold text-sidebar-purple">{shortcut.keys}</kbd>
                        </li>
                    ))}
                </ul>
            </section>
        </aside>
    );
}

export default AccessibilityPreview;
