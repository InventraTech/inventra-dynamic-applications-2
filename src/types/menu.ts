interface MenuOptions {
    page: string;
    pageIcon: string;
    pagePath: string;
}

export interface Menu {
    sectionTitle: string;
    menuOptions: MenuOptions[];
}

export interface SidebarProps {
    logo: string;
    brandName?: string | "";
    menu: Menu[];
    fix: boolean;
    setfix: (valor: boolean) => void;
}