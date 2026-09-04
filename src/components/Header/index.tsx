export interface MenuOptions {
    page: string;
    pagePath: string;
}

interface HeaderProps {
    logo: string;
    menuOptions: MenuOptions[];
}

function Header({logo, menuOptions=[]}: HeaderProps) {
    return (
        <header className="bg-amber-200 py-3 px-6 flex justify-between items-center w-full">
            <img src={logo} alt="Logo do site" />
            <div className="flex gap-6">
                {menuOptions.map((option) => (
                    <a href={option.pagePath}>{option.page}</a>
                ))}
            </div>
        </header>
    )
}

export default Header;