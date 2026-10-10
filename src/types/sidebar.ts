export interface MenuOption {
    page: string;
    pageIcon: string;
    pagePath: string;
}

export interface MenuSection {
    sectionTitle: string;
    menuOptions: MenuOption[];
}

export interface SidebarProps {
    logo: string;
    logoMark: string;
    menuSections: MenuSection[];
    fixo: boolean;
    setFixo: (valor: boolean) => void;
}
