export interface TopbarProps {
    title: string;
    description: string;
    userInitials?: string;
    userName?: string;
    userRole?: string;
    searchPlaceholder?: string;
    hasNotifications?: boolean;
    onSearch?: (value: string) => void;
    onNotifications?: () => void;
}
