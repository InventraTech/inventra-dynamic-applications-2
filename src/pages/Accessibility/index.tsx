import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AccessibilityCard from "../../components/features/Accessibility/AccessibilityCard";
import AccessibilityHero from "../../components/features/Accessibility/AccessibilityHero";
import AccessibilityPreview from "../../components/features/Accessibility/AccessibilityPreview";
import ChoiceGroup from "../../components/features/Accessibility/ChoiceGroup";
import SettingRow from "../../components/features/Accessibility/SettingRow";
import Topbar from "../../components/layout/Topbar";
import Toggle from "../../components/ui/Toggle";
import Feedback from "../../components/ui/Feedback";
import Button from "../../components/ui/Button";
import { useAccessibility } from "../../context/accessibility";
import type { AccessibilitySettings, ChoiceOption } from "../../types/accessibility";
import { getSession } from "../../services/authSession";

import fontIcon from "../../assets/icons/fonte.svg";
import dyslexiaIcon from "../../assets/icons/fonte-dislexia.svg";
import spacingIcon from "../../assets/icons/espacamento-texto.svg";
import rulerIcon from "../../assets/icons/regua-leitura.svg";
import contrastIcon from "../../assets/icons/alto-contraste.svg";
import colorVisionIcon from "../../assets/icons/daltonismo.svg";
import librasIcon from "../../assets/icons/libras.svg";
import speechIcon from "../../assets/icons/leitura-voz.svg";
import motionIcon from "../../assets/icons/reducao-movimento.svg";
import cursorIcon from "../../assets/icons/cursor-ampliado.svg";
import voiceIcon from "../../assets/icons/controle-voz.svg";
import eyeIcon from "../../assets/icons/rastreamento-ocular.svg";
import focusIcon from "../../assets/icons/foco-teclado.svg";
import alertsIcon from "../../assets/icons/alertas-visuais.svg";

const fontScaleOptions: ChoiceOption<AccessibilitySettings["fontScale"]>[] = [
    { value: 100, label: "100%" },
    { value: 125, label: "125%" },
    { value: 150, label: "150%" },
    { value: 200, label: "200%" },
];

const letterSpacingOptions: ChoiceOption<AccessibilitySettings["letterSpacing"]>[] = [
    { value: 0, label: "Padrão" },
    { value: 0.05, label: "Leve" },
    { value: 0.1, label: "Amplo" },
    { value: 0.15, label: "Extra" },
];

const lineSpacingOptions: ChoiceOption<AccessibilitySettings["lineSpacing"]>[] = [
    { value: 1.25, label: "1,25×" },
    { value: 1.5, label: "1,5×" },
    { value: 1.75, label: "1,75×" },
    { value: 2, label: "2×" },
];

const rulerColorOptions: ChoiceOption<AccessibilitySettings["readingRulerColor"]>[] = [
    { value: "gold", label: "Amarelo" },
    { value: "purple", label: "Roxo" },
    { value: "gray", label: "Cinza" },
];

const contrastOptions: ChoiceOption<AccessibilitySettings["contrastMode"]>[] = [
    { value: "normal", label: "Padrão" },
    { value: "dark", label: "Escuro" },
    { value: "reinforced", label: "Reforçado" },
    { value: "yellow-black", label: "Amarelo e preto" },
];

const colorVisionOptions: ChoiceOption<AccessibilitySettings["colorVisionMode"]>[] = [
    { value: "none", label: "Padrão" },
    { value: "protanopia", label: "Protanopia" },
    { value: "deuteranopia", label: "Deuteranopia" },
    { value: "tritanopia", label: "Tritanopia" },
];

const speechRateOptions: ChoiceOption<AccessibilitySettings["speechRate"]>[] = [
    { value: 0.75, label: "Mais lenta" },
    { value: 1, label: "Normal" },
    { value: 1.25, label: "Mais rápida" },
];

const speechTriggerOptions: ChoiceOption<AccessibilitySettings["speechTrigger"]>[] = [
    { value: "focus", label: "Ao focar" },
    { value: "hover", label: "Ao apontar" },
    { value: "manual", label: "Por botão" },
];

const cursorSizeOptions: ChoiceOption<AccessibilitySettings["cursorSize"]>[] = [
    { value: "medium", label: "Médio" },
    { value: "large", label: "Grande" },
    { value: "extra-large", label: "Extra grande" },
];

const cursorColors: Record<AccessibilitySettings["cursorColor"], { label: string; colorClass: string; checkClass: string }> = {
    default: { label: "Roxo padrão", colorClass: "bg-brand", checkClass: "text-on-brand" },
    yellow: { label: "Amarelo", colorClass: "bg-login-accent", checkClass: "text-ink" },
    black: { label: "Preto", colorClass: "bg-ink", checkClass: "text-on-brand" },
    white: { label: "Branco", colorClass: "border border-history-border bg-surface", checkClass: "text-brand" },
};

const focusOptions: ChoiceOption<AccessibilitySettings["keyboardFocus"]>[] = [
    { value: "standard", label: "Padrão" },
    { value: "reinforced", label: "Reforçado" },
];

const alertOptions: ChoiceOption<AccessibilitySettings["visualAlerts"]>[] = [
    { value: "banner", label: "Faixa" },
    { value: "icon-color", label: "Compacto" },
    { value: "banner-icon", label: "Faixa e ícone" },
];

const cursorSizeClasses: Record<AccessibilitySettings["cursorSize"], string> = {
    medium: "text-2xl",
    large: "text-4xl",
    "extra-large": "text-6xl",
};

const cursorColorClasses: Record<AccessibilitySettings["cursorColor"], string> = {
    default: "text-brand",
    black: "text-ink",
    yellow: "text-login-accent",
    white: "text-surface drop-shadow-md",
};

function getTopbarIdentity() {
    const session = getSession();
    const nameParts = (session?.user.name ?? "Usuário").trim().split(/\s+/).filter(Boolean);
    const userName = nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
        : nameParts[0] ?? "Usuário";
    const userInitials = (nameParts.length > 1 ? [nameParts[0], nameParts[nameParts.length - 1]] : nameParts)
        .map((part) => [...part][0]?.toLocaleUpperCase("pt-BR") ?? "")
        .join("") || "IN";
    const profile = session?.user.profile;
    const userRole = typeof profile === "string"
        ? profile
        : profile?.name ?? profile?.accessType?.replaceAll("_", " ") ?? "Usuário";

    return { userName, userInitials, userRole };
}

function Accessibility() {
    const { settings, storageAvailable, updateSettings, resetSettings } = useAccessibility();
    const [preview, setPreview] = useState({ saved: settings, values: settings });
    const draft = preview.saved === settings ? preview.values : settings;
    const [savedMessage, setSavedMessage] = useState("");
    const identity = useMemo(() => getTopbarIdentity(), []);
    const signedIn = Boolean(getSession());
    const speechSupported = "speechSynthesis" in window;
    const hasChanges = JSON.stringify(draft) !== JSON.stringify(settings);

    function updateDraft<K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) {
        setPreview({ saved: settings, values: { ...draft, [key]: value } });
        setSavedMessage("");
    }

    function savePreferences() {
        updateSettings(draft);
        setSavedMessage("Preferências aplicadas em todas as telas.");
    }

    function getFeatures(selected: AccessibilitySettings) {
        const features: string[] = [];
        if (selected.fontScale > 100) features.push("Texto ampliado");
        if (selected.dyslexiaFont) features.push("Fonte OpenDyslexic");
        if (selected.letterSpacing > 0 || selected.lineSpacing !== 1.5) features.push("Espaçamento de leitura");
        if (selected.readingRuler) features.push("Régua de leitura");
        if (selected.contrastMode !== "normal") features.push("Contraste ajustado");
        if (selected.colorVisionMode !== "none") features.push("Paleta de estados adaptada");
        if (selected.libras) features.push("Libras");
        if (selected.readAloud && speechSupported) features.push("Leitura em voz");
        if (selected.reduceMotion) features.push("Movimento reduzido");
        if (selected.largeCursor) features.push("Cursor ampliado");
        if (selected.keyboardFocus === "reinforced") features.push("Foco reforçado");
        if (selected.visualAlerts !== "banner-icon") features.push("Alertas visuais");
        return features;
    }
    const activeFeatures = getFeatures(settings);

    return (
        <div className="flex min-h-screen flex-col bg-linear-to-b from-history-background-start to-history-background-end">
            {signedIn ? <Topbar
                title="Acessibilidade"
                description="Ajuste o Inventra ao seu jeito de ver, ouvir e navegar"
                userInitials={identity.userInitials}
                userName={identity.userName}
                userRole={identity.userRole}
            /> : <header className="flex flex-wrap items-center justify-between gap-3 border-b border-history-border bg-surface px-6 py-4">
                <h1 className="text-2xl font-bold text-sidebar-purple">Acessibilidade</h1>
                <Link className="rounded-xl px-3 py-3 font-semibold text-sidebar-purple" to="/login">Voltar para entrar</Link>
            </header>}
            <main id="conteudo-principal" tabIndex={-1} className="flex min-w-0 flex-1 flex-col gap-5 px-6 pb-24 pt-6 max-lg:px-5 max-md:px-4 max-sm:px-3">
                <AccessibilityHero
                    activeCount={activeFeatures.length}
                    hasChanges={hasChanges}
                    savedMessage={savedMessage}
                    onReset={() => {
                        resetSettings();
                        setSavedMessage("Preferências restauradas em todas as telas.");
                    }}
                    onSave={savePreferences}
                />
                {!storageAvailable && <Feedback>As preferências funcionam nesta sessão. Seu navegador não permitiu salvá-las para a próxima visita.</Feedback>}
                {hasChanges && <p className="text-sm text-history-muted" role="status">Há alterações na prévia. Salve para aplicá-las em todas as telas.</p>}

                <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,0.37fr)] large-text:grid-cols-1">
                    <div className="flex min-w-0 flex-col gap-6">
                        <section aria-labelledby="vision-heading">
                            <h2 id="vision-heading" className="mb-3 font-k2d text-sm font-bold uppercase tracking-wide text-sidebar-label">Visão e leitura</h2>
                            <div className="grid min-w-0 grid-cols-1 items-start gap-4 2xl:grid-cols-2 large-text:grid-cols-1">
                                <AccessibilityCard icon={fontIcon} title="Tamanho do texto" description="Escolha um tamanho confortável para ler os conteúdos.">
                                    <ChoiceGroup name="font-scale" label="Tamanho" value={draft.fontScale} options={fontScaleOptions} onChange={(value) => updateDraft("fontScale", value)} columns={4} />
                                </AccessibilityCard>

                                <AccessibilityCard icon={dyslexiaIcon} title="Fonte OpenDyslexic" description="Use a família OpenDyslexic em todos os textos do Inventra.">
                                    <SettingRow title="Ativar OpenDyslexic" description="Aplica essa fonte em toda a interface enquanto estiver ativada.">
                                        <Toggle enabled={draft.dyslexiaFont} onToggle={() => updateDraft("dyslexiaFont", !draft.dyslexiaFont)} ariaLabel="Ativar fonte OpenDyslexic" />
                                    </SettingRow>
                                </AccessibilityCard>

                                <AccessibilityCard icon={spacingIcon} title="Espaçamento do texto" description="Aumente o espaço entre letras e linhas para acompanhar a leitura.">
                                    <ChoiceGroup name="letter-spacing" label="Espaço entre letras" value={draft.letterSpacing} options={letterSpacingOptions} onChange={(value) => updateDraft("letterSpacing", value)} columns={4} />
                                    <ChoiceGroup name="line-spacing" label="Altura entre linhas" value={draft.lineSpacing} options={lineSpacingOptions} onChange={(value) => updateDraft("lineSpacing", value)} columns={4} />
                                </AccessibilityCard>

                                <AccessibilityCard icon={rulerIcon} title="Régua de leitura" description="Acompanhe uma linha por vez sem perder o ponto do texto.">
                                    <SettingRow title="Mostrar régua" description="Acompanha o ponteiro e o foco do teclado. Os botões no início da página também movem a régua.">
                                        <Toggle enabled={draft.readingRuler} onToggle={() => updateDraft("readingRuler", !draft.readingRuler)} ariaLabel="Ativar régua de leitura" />
                                    </SettingRow>
                                    {draft.readingRuler && <>
                                        <ChoiceGroup name="ruler-color" label="Cor da faixa" value={draft.readingRulerColor} options={rulerColorOptions} onChange={(value) => updateDraft("readingRulerColor", value)} />
                                        <ChoiceGroup
                                            name="ruler-size"
                                            label="Altura da faixa"
                                            value={draft.readingRulerSize}
                                            options={[{ value: "small", label: "Fina" }, { value: "medium", label: "Média" }, { value: "large", label: "Alta" }]}
                                            onChange={(value) => updateDraft("readingRulerSize", value)}
                                        />
                                    </>}
                                </AccessibilityCard>

                                <AccessibilityCard icon={contrastIcon} title="Contraste" description="Escolha uma combinação que deixe os elementos mais fáceis de distinguir.">
                                    <ChoiceGroup name="contrast-mode" label="Modo de contraste" value={draft.contrastMode} options={contrastOptions} onChange={(value) => updateDraft("contrastMode", value)} columns={2} />
                                </AccessibilityCard>

                                <AccessibilityCard icon={colorVisionIcon} title="Visão de cores" description="Adapte as cores dos estados. O nome e o ícone sempre acompanham a cor.">
                                    <ChoiceGroup name="color-vision" label="Preferência de visualização" value={draft.colorVisionMode} options={colorVisionOptions} onChange={(value) => updateDraft("colorVisionMode", value)} columns={2} />
                                    <p className="font-k2d text-xs leading-relaxed text-history-muted">A paleta dos estados muda em toda a aplicação depois de salvar. Não é uma simulação da visão.</p>
                                </AccessibilityCard>
                            </div>
                        </section>

                        <section aria-labelledby="hearing-heading">
                            <h2 id="hearing-heading" className="mb-3 font-k2d text-sm font-bold uppercase tracking-wide text-sidebar-label">Audição e Libras</h2>
                            <div className="grid min-w-0 grid-cols-1 items-start gap-4 2xl:grid-cols-2 large-text:grid-cols-1">
                                <AccessibilityCard icon={librasIcon} title="Tradução em Libras" description="Ative o widget oficial do VLibras na posição padrão.">
                                    <SettingRow title="Mostrar VLibras" description="O widget oficial do VLibras aparecerá nas páginas do Inventra.">
                                        <Toggle enabled={draft.libras} onToggle={() => updateDraft("libras", !draft.libras)} ariaLabel="Ativar tradução em Libras" />
                                    </SettingRow>
                                </AccessibilityCard>

                                <AccessibilityCard icon={speechIcon} title="Leitura em voz" description="Use a voz disponível no navegador para ouvir textos e uma amostra.">
                                    <SettingRow title="Ativar leitura em voz" description={speechSupported ? "Depois de salvar, use Ouvir página, Pausar e Parar nas ferramentas de leitura." : "Este navegador não oferece síntese de voz. Seu leitor de tela continua funcionando."}>
                                        <Toggle disabled={!speechSupported} enabled={draft.readAloud && speechSupported} onToggle={() => updateDraft("readAloud", !draft.readAloud)} ariaLabel="Ativar leitura em voz" />
                                    </SettingRow>
                                    {draft.readAloud && speechSupported && <>
                                        <ChoiceGroup name="speech-rate" label="Velocidade da voz" value={draft.speechRate} options={speechRateOptions} onChange={(value) => updateDraft("speechRate", value)} />
                                        <ChoiceGroup name="speech-trigger" label="Quando ler" value={draft.speechTrigger} options={speechTriggerOptions} onChange={(value) => updateDraft("speechTrigger", value)} />
                                    </>}
                                </AccessibilityCard>
                            </div>
                        </section>

                        <section aria-labelledby="navigation-heading">
                            <h2 id="navigation-heading" className="mb-3 font-k2d text-sm font-bold uppercase tracking-wide text-sidebar-label">Navegação e movimento</h2>
                            <div className="grid min-w-0 grid-cols-1 items-start gap-4 2xl:grid-cols-2 large-text:grid-cols-1">
                                <AccessibilityCard icon={motionIcon} title="Movimento" description="Reduza animações e transições da interface.">
                                    <SettingRow title="Reduzir movimento" description="Diminui animações em todas as páginas. A preferência de movimento reduzido do dispositivo também é respeitada.">
                                        <Toggle enabled={draft.reduceMotion} onToggle={() => updateDraft("reduceMotion", !draft.reduceMotion)} ariaLabel="Reduzir animações e movimento" />
                                    </SettingRow>
                                    {draft.reduceMotion && (
                                        <ChoiceGroup
                                            name="remove-motion"
                                            label="Intensidade"
                                            value={draft.removeMotion ? "all" : "some"}
                                            options={[{ value: "some", label: "Reduzir" }, { value: "all", label: "Remover" }]}
                                            onChange={(value) => updateDraft("removeMotion", value === "all")}
                                            columns={2}
                                        />
                                    )}
                                </AccessibilityCard>

                                <AccessibilityCard icon={cursorIcon} title="Cursor ampliado" description="Aumente o ponteiro e escolha uma cor com mais destaque.">
                                    <SettingRow title="Ampliar cursor" description="Aplica o tamanho e a cor ao ponteiro, aos botões e aos campos de texto. Atua em dispositivos com mouse.">
                                        <Toggle enabled={draft.largeCursor} onToggle={() => updateDraft("largeCursor", !draft.largeCursor)} ariaLabel="Ativar cursor ampliado" />
                                    </SettingRow>
                                    {draft.largeCursor && <>
                                        <ChoiceGroup name="cursor-size" label="Tamanho" value={draft.cursorSize} options={cursorSizeOptions} onChange={(value) => updateDraft("cursorSize", value)} />
                                        <fieldset className="min-w-0">
                                            <legend className="mb-2 font-k2d text-xs font-semibold text-sidebar-label">Cor do cursor</legend>
                                            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                                {(Object.keys(cursorColors) as AccessibilitySettings["cursorColor"][]).map((color) => {
                                                    const option = cursorColors[color];
                                                    const selected = draft.cursorColor === color;
                                                    const optionId = `cursor-color-${color}`;

                                                    return (
                                                        <label
                                                            key={color}
                                                            className="mx-auto block w-full max-w-28 cursor-pointer"
                                                            htmlFor={optionId}
                                                        >
                                                            <input
                                                                id={optionId}
                                                                className="peer sr-only"
                                                                type="radio"
                                                                name="cursor-color"
                                                                value={color}
                                                                checked={selected}
                                                                onChange={() => updateDraft("cursorColor", color)}
                                                            />
                                                            <span className={`grid aspect-square w-full place-items-center rounded-full ring-offset-2 ring-offset-surface peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-brand ${option.colorClass} ${selected ? "ring-4 ring-brand" : "ring-1 ring-history-border"}`}>
                                                                <span className="sr-only">{option.label}</span>
                                                                {selected && <span className={`font-bold ${option.checkClass}`} aria-hidden="true">✓</span>}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </fieldset>
                                        <div className="flex min-h-16 items-center gap-3 rounded-xl border border-history-border bg-history-card-header px-4" role="img" aria-label={`Amostra do cursor ${cursorColors[draft.cursorColor].label.toLocaleLowerCase("pt-BR")}, tamanho ${draft.cursorSize === "extra-large" ? "extra grande" : draft.cursorSize === "large" ? "grande" : "médio"}`}>
                                            <span className={`font-bold leading-none ${cursorSizeClasses[draft.cursorSize]} ${cursorColorClasses[draft.cursorColor]}`} aria-hidden="true">↖</span>
                                            <span className="font-k2d text-xs text-history-muted">Amostra do cursor: {cursorColors[draft.cursorColor].label}</span>
                                        </div>
                                    </>}
                                </AccessibilityCard>

                                <AccessibilityCard icon={voiceIcon} title="Controle por voz" description="Atalhos de comando por voz para navegar sem mouse.">
                                    <p className="rounded-xl border border-history-border bg-history-card-header p-3 text-sm text-history-muted">Ainda indisponível. Você pode navegar usando o controle por voz do seu dispositivo. O Inventra não solicita acesso ao microfone.</p>
                                </AccessibilityCard>

                                <AccessibilityCard icon={eyeIcon} title="Rastreamento ocular" description="Ajustes de permanência para uma futura integração com rastreador ocular.">
                                    <p className="rounded-xl border border-history-border bg-history-card-header p-3 text-sm text-history-muted">Ainda indisponível. A calibração depende de uma integração com rastreador ocular. O Inventra não solicita acesso à câmera.</p>
                                </AccessibilityCard>

                                <AccessibilityCard icon={focusIcon} title="Foco do teclado" description="Destaque o elemento selecionado ao navegar sem mouse.">
                                    <ChoiceGroup name="keyboard-focus" label="Estilo do foco" value={draft.keyboardFocus} options={focusOptions} onChange={(value) => updateDraft("keyboardFocus", value)} columns={2} />
                                    <SettingRow title="Atalhos do Inventra" description="Ative ou desative os atalhos com Alt. Eles não atuam enquanto você digita em um campo.">
                                        <Toggle enabled={draft.shortcutsEnabled} onToggle={() => updateDraft("shortcutsEnabled", !draft.shortcutsEnabled)} ariaLabel="Ativar atalhos de teclado do Inventra" />
                                    </SettingRow>
                                </AccessibilityCard>

                                <AccessibilityCard icon={alertsIcon} title="Alertas visuais" description="Escolha como os avisos importantes aparecem na interface.">
                                    <ChoiceGroup name="visual-alerts" label="Apresentação dos avisos" value={draft.visualAlerts} options={alertOptions} onChange={(value) => updateDraft("visualAlerts", value)} />
                                    <Feedback appearance={draft.visualAlerts}>Exemplo de aviso: estoque abaixo do mínimo.</Feedback>
                                    <p className="text-xs text-history-muted">Todos os formatos mantêm a mensagem em texto.</p>
                                </AccessibilityCard>
                            </div>
                        </section>
                    </div>

                    <AccessibilityPreview settings={draft} activeFeatures={activeFeatures} />
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border border-history-border bg-surface p-4">
                    <Button variant="primary" type="button" disabled={!hasChanges} onClick={savePreferences}>Salvar preferências</Button>
                    <span className="min-w-0 text-sm text-history-muted">{hasChanges ? "Aplique as alterações em todas as telas." : savedMessage || "Suas preferências salvas já estão aplicadas."}</span>
                </div>
            </main>
        </div>
    );
}

export default Accessibility;
