export interface MenuOptions {
    page: string;
    pageIcon: string;
    pagePath: string;
}

interface SidebarProps {
    logo: string;
    menuOptions: MenuOptions[];
}

function Sidebar({logo, menuOptions=[]}: SidebarProps) {
    return (
        <aside className="bg-gray-200 flex justify-center overflow-hidden py-3 pt-6 fixed left-0 top-0 h-screen w-16 group delay-150 hover:delay-0 hover:w-64 transition-all">
            <nav className="delay-125 group-hover:delay-0 opacity-0 group-hover:opacity-100 transition-opacity ">
                <img src={logo} className="object-contain w-12" alt="Logo do site" />
                <ul className="flex flex-col gap-6 mt-12 text-left">
                    {menuOptions.map((option) => (
                        <li key={option.pagePath} className="flex flex-row">
                            <img src={option.pageIcon} alt={`Ícone da página de ${option.page}`} />
                            <a className="font-k2d text-2xl hover:bg-amber-400" href={option.pagePath}>{option.page}</a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar;