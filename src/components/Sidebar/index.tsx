import { Link } from "react-router-dom";

import type { SidebarProps } from "../../types/menu";
import { useAccessibility } from "../../context/AccessibilityContext";

function Sidebar({logo, brandName, menu=[], fix, setfix}: SidebarProps) {
    const { libras, toggleLibras } = useAccessibility();
    
    const styles = fix ? {
      width: "w-70",
      opacity: "opacity-100 max-w-50",
      gap: "gap-3",
      margin: "ml-8",
      scroll: "overflow-y-scroll",
    } : {
      width: "w-24 hover:w-70",
      opacity: "opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-50",
      gap: "group-hover:gap-3",
      margin: "ml-3 group-hover:ml-8",
      scroll: "hover:overflow-y-scroll",
    };

    return (
        <aside className={`rounded-r-2xl border-r-2 border-t-2 border-b-2 border-gray-200 flex justify-center overflow-hidden py-3 pt-6 fixed left-0 top-0 h-screen w-24 hover:w-70 group z-100 ${styles.width} ${styles.scroll} transition-all`}>
            <button className="fixed top-1 left-2 cursor-pointer" onClick={() => setfix(!fix)} aria-label={fix ? "Botão para desafixar sidebar" : "Botão para fixar sidebar"}>
                {fix ? "X" : "O"}
            </button>
            <button className="fixed top-4 left-2 cursor-pointer" onClick={() => toggleLibras()} aria-label={"Lugar provisório pro botão de Libras"}>
                {libras ? "X" : "O"}
            </button>
            <nav className="">
                <div className={`mb-5 flex justify-center items-center ${styles.gap} text-purple-950`}>
                    <img className="object-contain w-16 shrink-0" src={logo} alt="Logo do site" />
                    <h1 className={`font-k2d text-4xl max-w-0 group-hover:max-w-50 whitespace-nowrap overflow-hidden font-bold ${styles.opacity} transition-all`}>{brandName}</h1>
                </div>
                {menu.map((section) => (
                    <section key={section.sectionTitle}>
                        <h2>{section.sectionTitle}</h2>
                        <ul className={`flex flex-col ${styles.margin} items-start justify-center gap-3 my-4`}>
                            {section.menuOptions.map((option) => (
                                <li className={`flex flex-row ${styles.gap}`} key={option.pagePath}>
                                    <img className="object-contain w-10 shrink-0" src={option.pageIcon} alt={`Ícone da página de ${option.page}`} />
                                    <Link className={`hover:bg-amber-400 font-k2d text-2xl h-7.5 whitespace-nowrap overflow-hidden ${styles.opacity} transition-all`} to={option.pagePath}>
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