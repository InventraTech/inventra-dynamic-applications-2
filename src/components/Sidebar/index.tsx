import { Link } from "react-router-dom";

interface MenuOptions {
    page: string;
    pageIcon: string;
    pagePath: string;
}

export interface MenuSections {
    sectionTitle: string;
    menuOptions: MenuOptions[];
}

interface SidebarProps {
    logo: string;
    logoMark: string;
    menuSections: MenuSections[];
    fixo: boolean;
    setFixo: (valor: boolean) => void;
}

function Sidebar({logo, logoMark, menuSections=[], fixo, setFixo}: SidebarProps) {
    const sidebarState = fixo ? "w-70" : "w-24 hover:w-70";
    const variableOpacity = fixo ? "opacity-100 max-w-50" : "opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-50";
    const variableGapSpacing = fixo ? "gap-3" : "group-hover:gap-3";
    const variableMarginLeft = fixo ? "ml-8" : "ml-3 group-hover:ml-8";

    return (
        <aside className={`overflow-y-scroll rounded-r-2xl border-r-2 border-t-2 border-b-2 border-gray-200 flex justify-center overflow-hidden py-3 pt-6 fixed left-0 top-0 h-screen w-24 hover:w-70 group group-default:transition-all  transition-all z-100 ${sidebarState}`}>
            <button className="fixed top-1 left-2 cursor-pointer" onClick={() => setFixo(!fixo)}>
                {fixo ? "X" : "O"}
            </button>
            <nav className="">
                <div className={`mb-5 flex justify-center items-center ${variableGapSpacing} text-purple-950`}>
                    <img className="object-contain w-16 shrink-0" src={logo} alt="Logo do site" />
                    <h1 className={`font-k2d text-4xl max-w-0 group-hover:max-w-50 whitespace-nowrap overflow-hidden font-bold ${variableOpacity} transition-all`}>{logoMark}</h1>
                </div>
                {menuSections.map((section) => (
                    <section key={section.sectionTitle}>
                        <h2>{section.sectionTitle}</h2>
                            <ul className={`flex flex-col ${variableMarginLeft} items-start justify-center gap-3 my-4`}>
                                {section.menuOptions.map((option) => (
                                    <li className={`flex flex-row ${variableGapSpacing}`} key={option.pagePath}>
                                        <img className="object-contain w-10 shrink-0" src={option.pageIcon} alt={`Ícone da página de ${option.page}`} />
                                        <Link className={`hover:bg-amber-400 font-k2d text-2xl h-7.5 whitespace-nowrap overflow-hidden ${variableOpacity} transition-all`} to={option.pagePath}>
                                            {option.page}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                    </section>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar;