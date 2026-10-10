import { NavLink } from "react-router-dom";
import type { SidebarProps } from "../../../types/menu";

function Sidebar({ logo, logoMark, menuSections = [], fixo, setFixo }: SidebarProps) {
    const sidebarState = fixo ? "w-70" : "w-24 hover:w-70";
    const labelState = fixo
        ? "max-w-50 opacity-100"
        : "max-w-0 opacity-0 group-hover:max-w-50 group-hover:opacity-100";
    const labelTransition = "sidebar-label-transition";
    const expandedSpacing = `${fixo ? "gap-4" : "gap-0 group-hover:gap-4"} sidebar-gap-transition`;
    const dividerStyle = fixo
        ? "bg-linear-to-r from-sidebar-line to-transparent"
        : "bg-sidebar-divider group-hover:bg-linear-to-r group-hover:from-sidebar-line group-hover:to-transparent";
    const dividerThickness = fixo ? "h-px" : "h-0.5";
    const sectionHeadingLayout = fixo
        ? "gap-3 pl-3"
        : "justify-center gap-0 group-hover:justify-start group-hover:gap-3 group-hover:pl-3";
    const dividerLayout = fixo
        ? "min-w-0 flex-1"
        : "w-10 flex-none group-hover:min-w-0 group-hover:flex-1 group-hover:w-auto";
    const scrollbarState = fixo ? "sidebar-scrollbar" : "sidebar-scrollbar sidebar-scrollbar-collapsed";

    return (
        <aside className={`group fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden rounded-r-3xl bg-white shadow-sidebar sidebar-width-transition ${sidebarState}`}>
            <button
                className="absolute left-2 top-1 z-20 cursor-pointer text-sidebar-purple"
                onClick={() => setFixo(!fixo)}
                type="button"
                aria-label={fixo ? "Desafixar sidebar" : "Fixar sidebar"}
            >
                {fixo ? "X" : "O"}
            </button>

            <div className={`${scrollbarState} my-2 mr-2 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-3 pt-6`}>
                <nav className="flex w-full flex-col gap-7" aria-label="Navegação principal">
                    <header className={`flex w-full shrink-0 items-center justify-center overflow-hidden pb-2 text-sidebar-purple ${expandedSpacing}`}>
                        <img className="h-16 w-16 shrink-0 object-contain" src={logo} alt="Logo do site" />
                        <span className={`overflow-hidden whitespace-nowrap font-k2d text-sidebar-logo font-bold leading-none ${labelTransition} ${labelState}`}>
                            {logoMark}
                        </span>
                    </header>

                    {menuSections.map((section) => (
                        <section className="flex w-full flex-col gap-2.5" key={section.sectionTitle}>
                            <div className={`flex w-full items-center overflow-hidden ${sectionHeadingLayout}`}>
                                <h2 className={`shrink-0 overflow-hidden font-k2d text-sidebar-label font-bold uppercase tracking-sidebar-label ${labelTransition} ${labelState}`}>
                                    {section.sectionTitle}
                                </h2>
                                <span className={`${dividerThickness} ${dividerLayout} ${dividerStyle}`} aria-hidden="true" />
                            </div>

                            <ul className="flex w-full flex-col gap-1">
                                {section.menuOptions.map((option) => (
                                    <li className="w-full" key={option.pagePath}>
                                        <NavLink
                                            className={({ isActive }) => `relative flex w-full items-center rounded-2xl px-3.5 py-2.75 font-k2d text-sidebar-nav leading-normal ${expandedSpacing} transition-colors duration-200 ${
                                                isActive
                                                    ? "bg-sidebar-active font-bold text-sidebar-purple"
                                                    : "font-medium text-sidebar-text hover:bg-sidebar-active"
                                            }`}
                                            to={option.pagePath}
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    {isActive && (
                                                        <span
                                                            className="absolute left-0 top-4 h-7 w-1 rounded-r-sidebar-indicator bg-sidebar-indicator"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                    <img
                                                        className="h-9.5 w-10.75 shrink-0 object-contain"
                                                        src={option.pageIcon}
                                                        alt=""
                                                        aria-hidden="true"
                                                    />
                                                    <span className={`overflow-hidden whitespace-nowrap ${labelTransition} ${labelState}`}>
                                                        {option.page}
                                                    </span>
                                                </>
                                            )}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </nav>
            </div>
        </aside>
    );
}

export default Sidebar;
