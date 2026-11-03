export interface KitchenNotification {
 id: number; type: string; severity: "LOW" | "MEDIUM" | "HIGH" | string;
 batch: { id: number; batchNumber: string } | null;
 product: { id: number; name: string; photoUrl: string | null } | null;
 kitchen: { id: number; name: string }; message: string; read: boolean; refKey: string | null; createdAt: string;
}

export interface NotificationControls { items: KitchenNotification[]; loading: boolean; saving: boolean; error: string | null; success: string | null; unread: number; markRead: (id?: number) => Promise<void>; refresh: () => void }
