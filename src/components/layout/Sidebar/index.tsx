import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { SidebarProps } from "../../../types/sidebar";
import Button from "../../ui/Button";
import fixIcon from "../../../assets/icons/fixar.svg";
import unfixIcon from "../../../assets/icons/desafixar.svg";

function Sidebar({ logo, logoMark, menuSections = [], fixo, setFixo }: SidebarProps) {
    const sidebar = useRef<HTMLElement>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    const menuButton = useRef<HTMLButtonElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [suppressHoverExpansion, setSuppressHoverExpansion] = useState(false);
    const [hoverReentryArmed, setHoverReentryArmed] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => { dialog.current?.close(); }, [pathname]);

    function handlePinPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
        if (fixo && event.pointerType === "mouse" && sidebar.current) {
            setHoverReentryArmed(false);
            setSuppressHoverExpansion(true);
        }
    }

    function togglePinned(event: ReactMouseEvent<HTMLButtonElement>) {
        setFixo(!fixo);
        if (event.detail > 0) event.currentTarget.blur();
    }

    function handleSidebarPointerLeave(event: ReactPointerEvent<HTMLElement>) {
        if (suppressHoverExpansion && event.pointerType === "mouse") setHoverReentryArmed(true);
    }

    function handleSidebarPointerEnter(event: ReactPointerEvent<HTMLElement>) {
        if (suppressHoverExpansion && hoverReentryArmed && event.pointerType === "mouse") {
            setHoverReentryArmed(false);
            setSuppressHoverExpansion(false);
        }
    }

    function brandHeader(expanded: boolean, showToggle: boolean) {
        const layout = expanded
            ? showToggle ? "justify-center gap-3 px-3 pr-14" : "justify-center gap-3 px-3"
            : "justify-center gap-0 px-3 group-hover:gap-3 group-hover:pr-14 group-focus-within:gap-3 group-focus-within:pr-14";
        const wordmark = expanded
            ? "min-w-0 flex-1 opacity-100"
            : "min-w-0 max-w-0 flex-none opacity-0 group-hover:max-w-36 group-hover:flex-1 group-hover:opacity-100 group-focus-within:max-w-36 group-focus-within:flex-1 group-focus-within:opacity-100";
        const toggleVisibility = expanded
            ? "opacity-100"
            : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100";

        return (
            <header className={`relative flex h-24 w-full shrink-0 items-center overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none dyslexia-font:h-auto dyslexia-font:min-h-24 dyslexia-font:flex-wrap dyslexia-font:justify-start dyslexia-font:gap-2 dyslexia-font:overflow-visible dyslexia-font:py-3 ${layout}`}>
                <img className="size-16 shrink-0 object-contain" src={logo} alt="Inventra" />
                <span className={`overflow-hidden whitespace-nowrap font-k2d text-sidebar-logo font-bold leading-none text-sidebar-purple sidebar-label-transition dyslexia-font:flex-1 dyslexia-font:max-w-full dyslexia-font:overflow-visible dyslexia-font:whitespace-normal dyslexia-font:wrap-anywhere ${wordmark}`}>
                    {logoMark}
                </span>
                {showToggle && (
                    <Button
                        variant="icon"
                        type="button"
                        className={`absolute right-3 top-1/2 size-11 -translate-y-1/2 rounded-2xl text-sidebar-purple transition-opacity duration-200 ease-out motion-reduce:transition-none focus-visible:outline-brand dyslexia-font:static dyslexia-font:ml-auto dyslexia-font:translate-y-0 ${toggleVisibility}`}
                        aria-label={fixo ? "Desafixar sidebar" : "Fixar sidebar"}
                        aria-pressed={fixo}
                        title={fixo ? "Desafixar sidebar" : "Fixar sidebar"}
                        onPointerDown={handlePinPointerDown}
                        onClick={togglePinned}
                    >
                        <img className="sidebar-navigation-icon size-6 rotate-12 object-contain" src={fixo ? unfixIcon : fixIcon} alt="" aria-hidden="true" />
                    </Button>
                )}
            </header>
        );
    }

    function navigation(expanded: boolean) {
        const label = expanded
            ? "max-w-50 whitespace-nowrap opacity-100 large-text:whitespace-normal"
            : "max-h-0 max-w-0 whitespace-nowrap opacity-0 group-hover:max-h-none group-hover:max-w-50 group-hover:opacity-100 group-focus-within:max-h-none group-focus-within:max-w-50 group-focus-within:opacity-100";
        const spacing = `${expanded ? "gap-4" : "gap-0 group-hover:gap-4 group-focus-within:gap-4"} sidebar-gap-transition`;
        const headingLayout = expanded
            ? "gap-3 pl-3"
            : "justify-center gap-0 group-hover:justify-start group-hover:gap-3 group-hover:pl-3 group-focus-within:justify-start group-focus-within:gap-3 group-focus-within:pl-3";
        const dividerLayout = expanded
            ? "min-w-0 flex-1"
            : "w-10 flex-none group-hover:w-auto group-hover:min-w-0 group-hover:flex-1 group-focus-within:w-auto group-focus-within:min-w-0 group-focus-within:flex-1";
        const dividerColor = expanded
            ? "bg-linear-to-r from-sidebar-line to-transparent"
            : "bg-sidebar-divider group-hover:bg-linear-to-r group-hover:from-sidebar-line group-hover:to-transparent group-focus-within:bg-linear-to-r group-focus-within:from-sidebar-line group-focus-within:to-transparent";
        return (
            <nav className="flex min-w-0 w-full flex-col gap-4" aria-label="Navegação principal">
                {menuSections.map((section) => (
                    <section className="flex min-w-0 flex-col gap-4" key={section.sectionTitle}>
                        <div className={`flex h-5 w-full items-center overflow-hidden large-text:h-auto large-text:min-h-5 dyslexia-font:h-auto dyslexia-font:min-h-5 dyslexia-font:flex-wrap dyslexia-font:overflow-visible ${headingLayout}`}>
                            <h2 className={`shrink-0 overflow-hidden font-k2d text-sidebar-label font-bold uppercase leading-5 tracking-sidebar-label text-sidebar-label sidebar-label-transition large-text:shrink dyslexia-font:h-auto dyslexia-font:min-h-5 dyslexia-font:flex-wrap dyslexia-font:overflow-visible ${label}`}>{section.sectionTitle}</h2>
                            <span className={`h-px ${dividerLayout} ${dividerColor}`} aria-hidden="true" />
                        </div>
                        <ul className="flex flex-col gap-1">
                            {section.menuOptions.map((option) => (
                                <li className="min-w-0 w-full" key={option.id}>
                                    {option.availability === "available" && option.pagePath ? (
                                        <NavLink title={option.page} aria-label={option.page} className={({ isActive }) => `relative flex w-full items-center rounded-2xl px-3.5 py-2.75 font-k2d text-sidebar-nav leading-normal transition-colors duration-200 ${spacing} ${isActive ? "bg-sidebar-active font-bold text-sidebar-purple" : "font-medium text-sidebar-text hover:bg-sidebar-active"}`} to={option.pagePath}>
                                            {({ isActive }) => <>
                                                {isActive && <span className="absolute left-0 top-4 h-7 w-1 rounded-r-sidebar-indicator bg-sidebar-indicator" aria-hidden="true" />}
                                                <img className="sidebar-navigation-icon size-8 shrink-0 object-contain" src={option.pageIcon} alt="" />
                                                <span className={`min-w-0 overflow-hidden sidebar-label-transition dyslexia-font:max-w-none dyslexia-font:overflow-visible dyslexia-font:whitespace-normal dyslexia-font:wrap-anywhere ${label}`}>{option.page}</span>
                                            </>}
                                        </NavLink>
                                    ) : (
                                        <div aria-disabled="true" aria-label={`${option.page}, em breve`} title={`${option.page} — em breve`} className={`relative flex w-full items-center rounded-2xl px-3.5 py-2.75 font-k2d text-sidebar-nav font-medium leading-normal text-sidebar-text ${spacing}`}>
                                            <img className="sidebar-navigation-icon size-8 shrink-0 object-contain" src={option.pageIcon} alt="" />
                                            <span className={`flex min-w-0 items-center overflow-hidden sidebar-label-transition dyslexia-font:max-w-none dyslexia-font:overflow-visible dyslexia-font:whitespace-normal dyslexia-font:wrap-anywhere ${label}`}>
                                                <span className="min-w-0 truncate">{option.page}</span>
                                                <span className="ml-auto shrink-0 pl-1 text-xs font-medium leading-5 text-sidebar-label">Em breve</span>
                                            </span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </nav>
        );
    }

    return (
        <>
            <aside
                ref={sidebar}
                className={`${suppressHoverExpansion ? "" : "group"} fixed inset-y-0 left-0 z-50 hidden flex-col overflow-hidden rounded-r-3xl bg-surface shadow-sidebar sidebar-width-transition lg:flex large-text:hidden adjusted-contrast:border-r-2 adjusted-contrast:border-history-border ${fixo ? "w-70" : suppressHoverExpansion ? "w-24" : "w-24 hover:w-70 focus-within:w-70"}`}
                onPointerLeave={handleSidebarPointerLeave}
                onPointerEnter={handleSidebarPointerEnter}
            >
                {brandHeader(fixo, true)}
                <div className={`sidebar-scrollbar ${fixo ? "" : "sidebar-scrollbar-collapsed"} mb-2 mr-2 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 pb-3 pt-6`}>{navigation(fixo)}</div>
            </aside>
            <div className="border-b border-history-border bg-surface p-2 lg:hidden large-text:block">
                <button ref={menuButton} className="flex min-h-11 items-center gap-2 rounded-xl px-3 font-semibold text-sidebar-purple hover:bg-sidebar-active" type="button" aria-haspopup="dialog" aria-controls="navegacao-movel" aria-expanded={menuOpen} onClick={() => { dialog.current?.showModal(); setMenuOpen(true); }}>
                    <span aria-hidden="true">☰</span> Menu
                </button>
            </div>
            <dialog ref={dialog} id="navegacao-movel" aria-labelledby="titulo-navegacao-movel" className="m-0 h-dvh max-h-dvh w-80 max-w-full border-r border-history-border bg-surface p-4 text-sidebar-text backdrop:bg-black/50" onClose={() => { setMenuOpen(false); menuButton.current?.focus(); }}>
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 id="titulo-navegacao-movel" className="font-bold">Navegação</h2>
                    <Button variant="icon" type="button" autoFocus className="min-h-11 rounded-xl px-3 text-sidebar-purple hover:bg-sidebar-active" onClick={() => dialog.current?.close()}>Fechar menu</Button>
                </div>
                {brandHeader(true, false)}
                {navigation(true)}
            </dialog>
        </>
    );
}

export default Sidebar;
