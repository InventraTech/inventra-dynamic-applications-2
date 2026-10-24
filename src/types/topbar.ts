export interface TopbarProps {
    title: string;
    description: string;
    userInitials?: string;
    userPhotoUrl?: string | null;
    userName?: string;
    userRole?: string;
    searchPlaceholder?: string;
    hasNotifications?: boolean;
    onSearch?: (value: string) => void;
    onNotifications?: () => void;
}
