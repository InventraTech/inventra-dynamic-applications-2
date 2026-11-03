import { useCallback, useEffect, useState } from "react";
import { getNotifications, readNotification, readAllNotifications } from "../services/notifications";
import type { KitchenNotification, NotificationControls } from "../types/notifications";
export function useNotifications(kitchenId: number | null): NotificationControls {
 const [state, setState] = useState<{ items: KitchenNotification[]; loading: boolean; saving: boolean; error: string | null; success: string | null }>({ items: [], loading: false, saving: false, error: null, success: null });
 const [retry, setRetry] = useState(0);
 useEffect(() => {
  const controller = new AbortController();
  setState({ items: [], loading: kitchenId !== null, saving: false, error: null, success: null });
  if (kitchenId === null) return;
  const load = async () => {
   try { const items = await getNotifications(kitchenId, controller.signal); if (!controller.signal.aborted) setState(s => ({ ...s, items: [...items].sort((a,b) => b.createdAt.localeCompare(a.createdAt)), loading: false, error: null })); }
   catch (error) { if (!controller.signal.aborted) setState(s => ({ ...s, loading: false, error: error instanceof Error ? error.message : "Erro ao carregar notificações." })); }
  };
  void load(); const interval = window.setInterval(() => { if (!document.hidden) void load(); }, 60000);
  return () => { controller.abort(); window.clearInterval(interval); };
 }, [kitchenId, retry]);
 const markRead = useCallback(async (id?: number) => {
  if (kitchenId === null) return;
  setState(s => ({ ...s, saving: true, error: null, success: null }));
  try {
   if (id === undefined) await readAllNotifications(kitchenId); else await readNotification(id);
   setState(s => ({ ...s, saving: false, items: s.items.map(item => id === undefined || item.id === id ? { ...item, read: true } : item), success: "Notificações atualizadas." }));
  } catch(error) { setState(s => ({ ...s, saving: false, error: error instanceof Error ? error.message : "Erro ao atualizar notificações." })); }
 }, [kitchenId]);
 return { ...state, unread: state.items.filter(item => !item.read).length, markRead, refresh: () => setRetry(n => n+1) };
}
