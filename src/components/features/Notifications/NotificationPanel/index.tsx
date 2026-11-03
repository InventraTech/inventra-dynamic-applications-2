import { useState } from "react";
import { Link } from "react-router-dom";
import type { useNotifications } from "../../../../hooks/useNotifications";
import { notificationCategory, notificationDateLabel, notificationDestination, type NotificationCategory } from "../../../../utils/notificationPresentation";
import pattern from "../../../../assets/images/requisition-hex-pattern.svg";
import bell from "../../../../assets/icons/sino.svg";
import stock from "../../../../assets/icons/estoque.svg";
import expiry from "../../../../assets/icons/vencimento.svg";
import request from "../../../../assets/icons/requisicao.svg";
import Dialog from "../../../ui/Dialog";
import Button from "../../../ui/Button";
import Icon from "../../../ui/Icon";
import Feedback from "../../../ui/Feedback";
interface NotificationPanelProps { open: boolean; onOpenChange: (open: boolean) => void; notifications: ReturnType<typeof useNotifications>; hasKitchen: boolean; role: string }
const filters: { value: NotificationCategory; label: string }[] = [{ value: "all", label: "Todas" }, { value: "expiry", label: "Validade" }, { value: "stock", label: "Estoque" }, { value: "requests", label: "Pedidos e equipe" }];
export default function NotificationPanel({ open, onOpenChange, notifications: n, hasKitchen, role }: NotificationPanelProps) {
 const [filter, setFilter] = useState<NotificationCategory>("all"); const [page, setPage] = useState(1);
 const filtered = n.items.filter(item => filter === "all" || notificationCategory(item.type) === filter);
 const pages = Math.max(1, Math.ceil(filtered.length / 20)); const currentPage = Math.min(page, pages); const visible = filtered.slice((currentPage-1)*20, currentPage*20);
 return <Dialog open={open} onOpenChange={onOpenChange} placement="right" aria-labelledby="notifications-title">
  <div className="flex h-full min-h-0 flex-col">
   <header className="relative isolate shrink-0 overflow-hidden bg-linear-to-r from-brand-strong to-brand p-5 text-on-brand sm:p-6">
    <img src={pattern} alt="" className="pointer-events-none absolute inset-0 -z-10 size-full object-cover opacity-40" />
    <div className="mb-3 flex justify-end"><Button variant="icon" className="rounded-full text-on-brand hover:bg-white/20" aria-label="Fechar notificações" onClick={() => onOpenChange(false)}><Icon name="close" /></Button></div>
    <div className="flex min-w-0 flex-wrap items-center gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-login-gold"><img src={bell} alt="" className="size-7" /></span><div className="min-w-0 flex-1"><h2 id="notifications-title" className="text-xl font-bold sm:text-2xl">Notificações</h2><p className="mt-1 text-sm">Os avisos da sua cozinha, em um só lugar.</p></div><span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">{n.unread ? `${n.unread} novas` : "Tudo lido"}</span></div>
   </header>
   <div className="min-h-0 flex-1 overflow-y-auto">
    <div className="flex flex-wrap gap-2 p-4" role="group" aria-label="Filtrar notificações">{filters.map(option => <Button key={option.value} variant={filter === option.value ? "standard" : "outline"} className="rounded-full" aria-pressed={filter === option.value} onClick={() => { setFilter(option.value); setPage(1); }}>{option.label}{option.value === "all" ? ` · ${n.items.length}` : ""}</Button>)}</div>
    <div className="space-y-3 px-4">{!hasKitchen && <Feedback severity="info">Entre em uma cozinha para receber notificações.</Feedback>}{n.loading && <p role="status">Carregando notificações…</p>}{n.error && <><Feedback severity="error">{n.error}</Feedback><Button variant="outline" onClick={n.refresh}>Tentar novamente</Button></>}{n.success && <Feedback severity="success">{n.success}</Feedback>}</div>
    {!n.loading && hasKitchen && !n.error && !visible.length && <div className="grid justify-items-center gap-4 px-6 py-12 text-center"><h3 className="text-xl font-bold">{n.items.length ? "Nenhum aviso nesta categoria" : "Nenhuma notificação por aqui"}</h3><p className="text-sm text-history-muted">{n.items.length ? "Escolha outra categoria para consultar os demais avisos." : "Novos avisos da cozinha aparecerão aqui."}</p><Link to="/historico" onClick={() => onOpenChange(false)} className="rounded-xl border border-history-border px-4 py-3 font-bold text-brand hover:bg-sidebar-active">Ver histórico</Link></div>}
    <ul>{visible.map((item, index) => {
     const category = notificationCategory(item.type); const destination = notificationDestination(item, role.toUpperCase()); const group = notificationDateLabel(item.createdAt); const severity = ["CRITICAL", "HIGH"].includes(item.severity) ? "Crítico" : item.severity === "MEDIUM" ? "Atenção" : "Informação";
     const date = new Date(item.createdAt); const timestamp = Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date) : "Data não informada";
     return <li key={item.id}>{(index === 0 || notificationDateLabel(visible[index-1].createdAt) !== group) && <h3 className="flex items-center gap-3 px-5 pb-2 pt-5 text-xs font-bold uppercase tracking-wide text-history-muted">{group}<span className="h-px flex-1 bg-history-border" /></h3>}
      <article className={`relative flex min-w-0 gap-3 px-5 py-5 ${item.read ? "bg-surface" : "bg-history-card-header"}`}>
       {!item.read && <span className="absolute bottom-5 left-0 top-5 w-1 rounded-r bg-brand" aria-hidden="true" />}
       <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sidebar-active"><img src={category === "expiry" ? expiry : category === "stock" ? stock : request} className="size-6" alt="" /></span>
       <div className="min-w-0 flex-1 space-y-2"><p className="text-base font-bold leading-snug wrap-anywhere">{item.message}</p><div className="flex flex-wrap items-center gap-2 text-xs"><span className={`rounded-full px-2 py-1 font-bold ${severity === "Crítico" ? "bg-feedback-error-bg text-feedback-error" : severity === "Atenção" ? "bg-history-status-observation-bg text-history-status-observation-text" : "bg-feedback-info-bg text-feedback-info"}`}>{severity}</span><time dateTime={item.createdAt} className="text-history-muted">{timestamp}</time><span className="text-history-muted">{item.read ? "Lida" : "Não lida"}</span></div>
        {item.product && <p className="text-sm text-history-muted">{item.product.name}{item.batch ? ` · Lote ${item.batch.batchNumber}` : ""}</p>}
        <div className="flex flex-wrap items-center gap-2">{destination && <Link to={destination.path} onClick={() => onOpenChange(false)} className="inline-flex min-h-10 items-center gap-2 rounded-lg font-bold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-focus">{destination.label}<Icon name="arrow" className="size-4 rotate-180" /></Link>}{!item.read && <Button variant="ghost" className="text-sm text-history-muted hover:bg-sidebar-active" disabled={n.saving} onClick={() => void n.markRead(item.id)}>Marcar como lida</Button>}</div>
       </div>
      </article>
     </li>;
    })}</ul>
   </div>
   <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-history-border p-4"><Button variant="ghost" className="text-brand hover:bg-sidebar-active" disabled={!n.unread || n.saving} onClick={() => void n.markRead()}><Icon name="check" />{n.saving ? "Salvando…" : "Marcar todas como lidas"}</Button><Button variant="outline" onClick={n.refresh} disabled={n.loading}>Atualizar</Button>{pages > 1 && <div className="flex w-full items-center justify-between gap-2"><Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage-1)}>Anterior</Button><p role="status" className="text-xs">{currentPage} de {pages}</p><Button variant="outline" disabled={currentPage === pages} onClick={() => setPage(currentPage+1)}>Próxima</Button></div>}</footer>
  </div>
 </Dialog>;
}
