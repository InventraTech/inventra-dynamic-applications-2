import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useAccessibility } from "../../../context/accessibility";
import { useReadAloud } from "../../../hooks/useReadAloud";
import type { FontScale } from "../../../types/accessibility";
import { getControlReadingText, getReadableText } from "../../../utils/readableText";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";

const toolButton = "min-h-11 rounded-xl border border-history-border px-3 py-2 text-sm font-semibold text-sidebar-purple hover:bg-sidebar-active";

function AccessibilityTools() {
    const { settings, librasStatus, retryLibras, updateSettings } = useAccessibility();
    const { supported, state, speak, stop, pause, resume } = useReadAloud(settings.speechRate);
    const { pathname } = useLocation();
    useEffect(() => { stop(); }, [pathname, settings.speechRate, settings.readAloud, stop]);
    const [rulerY, setRulerY] = useState(() => window.innerHeight / 2);
    const rulerHeight = { small: 32, medium: 48, large: 64 }[settings.readingRulerSize];
    const rulerColor = { gold: "border-amber-500", purple: "border-purple-500", gray: "border-slate-500" }[settings.readingRulerColor];
    const rulerSize = { small: "h-8", medium: "h-12", large: "h-16" }[settings.readingRulerSize];

    useEffect(() => {
        if (!settings.readingRuler) return;
        const move = (event: PointerEvent) => setRulerY(event.clientY);
        const focus = (event: FocusEvent) => {
            if (!(event.target instanceof HTMLElement) || event.target.closest("[data-no-read-aloud]")) return;
            const rect = event.target.getBoundingClientRect();
            setRulerY(rect.top + rect.height / 2);
        };
        const resize = () => setRulerY((current) => Math.min(current, window.innerHeight));
        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("focusin", focus);
        window.addEventListener("resize", resize);
        return () => { window.removeEventListener("pointermove", move); window.removeEventListener("focusin", focus); window.removeEventListener("resize", resize); };
    }, [settings.readingRuler]);

    useEffect(() => {
        if (!settings.shortcutsEnabled) return;
        function shortcut(event: KeyboardEvent) {
            if (!event.altKey || event.ctrlKey || event.metaKey || event.repeat || event.defaultPrevented || event.isComposing) return;
            if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
            const key = event.key.toLowerCase();
            if (!["a", "v", "l", "+", "=", "-", "_"].includes(key)) return;
            event.preventDefault();
            if (key === "a") updateSettings({ readingRuler: !settings.readingRuler });
            if (key === "v" && supported) updateSettings({ readAloud: !settings.readAloud });
            if (key === "l") updateSettings({ libras: !settings.libras });
            const scales: FontScale[] = [100, 125, 150, 200];
            const index = scales.indexOf(settings.fontScale);
            if (key === "+" || key === "=") updateSettings({ fontScale: scales[Math.min(3, index + 1)] });
            if (key === "-" || key === "_") updateSettings({ fontScale: scales[Math.max(0, index - 1)] });
        }
        window.addEventListener("keydown", shortcut);
        return () => window.removeEventListener("keydown", shortcut);
    }, [settings, supported, updateSettings]);

    useEffect(() => {
        if (!settings.readAloud) { stop(); return; }
        if (!supported || settings.speechTrigger === "manual") return;
        let timer: ReturnType<typeof setTimeout> | undefined;
        function read(event: Event) {
            if (!(event.target instanceof HTMLElement)) return;
            const element = event.target.closest<HTMLElement>("a, button, input, textarea, select, label, p, h1, h2, h3, h4, td, th, dt, dd");
            if (!element) return;
            const text = getControlReadingText(element);
            if (!text) return;
            clearTimeout(timer);
            timer = setTimeout(() => speak(text), settings.speechTrigger === "hover" ? 500 : 100);
        }
        const eventName = settings.speechTrigger === "focus" ? "focusin" : "pointerover";
        const cancelPending = () => clearTimeout(timer);
        document.addEventListener(eventName, read);
        if (settings.speechTrigger === "hover") document.addEventListener("pointerout", cancelPending);
        return () => { clearTimeout(timer); document.removeEventListener(eventName, read); document.removeEventListener("pointerout", cancelPending); stop(); };
    }, [settings.readAloud, settings.speechTrigger, supported, speak, stop]);

    if (!settings.readingRuler && (!settings.readAloud || !supported) && librasStatus !== "loading" && librasStatus !== "error") return null;
    return (
        <>
            <section className="flex flex-wrap items-center gap-2 border-b border-history-border bg-surface px-4 py-2" aria-label="Ferramentas de leitura" data-no-read-aloud>
                {librasStatus === "loading" && <p role="status" className="text-sm text-history-muted">Carregando o VLibras…</p>}
                {librasStatus === "error" && <>
                    <Feedback severity="error">O VLibras não respondeu. Confira a conexão e tente novamente.</Feedback>
                    <Button variant="icon" type="button" className={toolButton} onClick={retryLibras}>Tentar carregar VLibras novamente</Button>
                </>}
                {settings.readAloud && supported && <>
                    <Button id="ouvir-pagina" variant="icon" type="button" className={toolButton} onClick={() => {
                        const content = document.getElementById("conteudo-principal");
                        if (content) speak(getReadableText(content));
                    }}>Ouvir página</Button>
                    {(state === "reading" || state === "paused") && <>
                        <Button variant="icon" type="button" className={toolButton} onClick={state === "paused" ? resume : pause}>{state === "paused" ? "Continuar leitura" : "Pausar leitura"}</Button>
                        <Button variant="icon" type="button" className={toolButton} onClick={() => { stop(); document.getElementById("ouvir-pagina")?.focus(); }}>Parar leitura</Button>
                    </>}
                    <span className="text-sm text-history-muted" role="status">{state === "reading" ? "Lendo a página" : state === "paused" ? "Leitura pausada" : state === "error" ? "A voz do navegador não está disponível. Tente novamente." : "Leitura pronta"}</span>
                </>}
                {settings.readingRuler && <>
                    <Button variant="icon" type="button" className={toolButton} onClick={() => setRulerY((current) => Math.max(rulerHeight / 2, current - rulerHeight))}>Subir régua</Button>
                    <Button variant="icon" type="button" className={toolButton} onClick={() => setRulerY((current) => Math.min(window.innerHeight - rulerHeight / 2, current + rulerHeight))}>Descer régua</Button>
                    <Button variant="icon" type="button" className={toolButton} onClick={() => updateSettings({ readingRuler: false })}>Ocultar régua</Button>
                </>}
            </section>
            {settings.readingRuler && <div className={`pointer-events-none fixed inset-x-0 z-40 border-y-2 ${rulerColor} ${rulerSize}`} style={{ top: Math.max(0, Math.min(window.innerHeight - rulerHeight, rulerY - rulerHeight / 2)) }} aria-hidden="true" />}
        </>
    );
}

export default AccessibilityTools;
