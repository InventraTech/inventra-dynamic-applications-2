import { useState } from "react";
import accent from "../../../assets/images/onda-topbar.svg";
import notificationIcon from "../../../assets/icons/sino.svg";
import type { TopbarProps } from "../../../types/topbar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import { useAccessibility } from "../../../context/accessibility";
import { useNotifications } from "../../../hooks/useNotifications";
import { useVoiceSearch } from "../../../hooks/useVoiceSearch";
import { searchPages } from "../../../utils/pageSearch";
import NotificationPanel from "../../features/Notifications/NotificationPanel";
import Button from "../../ui/Button";
import SearchField from "../../ui/SearchField";
import UserAvatar from "../../ui/UserAvatar";
import Icon from "../../ui/Icon";
import Feedback from "../../ui/Feedback";

export default function Topbar({ title, description, userInitials = "IN", userPhotoUrl, userName = "Usuário", userRole = "" }: TopbarProps) {
 const { session } = useAuth(); const navigate = useNavigate(); const { settings } = useAccessibility();
 const [query, setQuery] = useState(""); const [searchOpen, setSearchOpen] = useState(false); const [notificationsOpen, setNotificationsOpen] = useState(false);
 const notifications = useNotifications(session?.user.kitchen?.id ?? null);
 const profile = session?.user.profile; const role = typeof profile === "string" ? profile : profile?.accessType ?? "";
 const results = searchPages(query, role);
 const voice = useVoiceSearch(value => { setQuery(value); setSearchOpen(true); });
 function updateSearch(value: string) { setQuery(value); setSearchOpen(true); }
 return <>
  <header className="sticky top-0 z-40 isolate grid min-h-20 min-w-0 grid-cols-1 items-center gap-4 bg-topbar-surface px-10 py-4 xl:grid-cols-[minmax(0,1fr)_auto] max-lg:px-6 max-md:px-4 large-text:static large-text:grid-cols-1">
   <div className="relative z-10 min-w-0 text-ink"><h1 className="font-k2d text-topbar-title font-bold leading-tight wrap-anywhere">{title}</h1><p className="mt-1 font-k2d text-topbar-description leading-normal wrap-anywhere">{description}</p></div>
   <img className="topbar-accent pointer-events-none absolute right-0 bottom-0 -z-10 h-full w-192 max-lg:w-158 max-md:w-105 max-xl:hidden large-text:hidden" src={accent} alt="" />
   <div className="relative flex min-w-0 flex-wrap items-center gap-3 rounded-2xl bg-brand px-3 py-2 xl:bg-transparent xl:p-0 large-text:bg-brand large-text:px-3 large-text:py-2 adjusted-contrast:bg-brand adjusted-contrast:px-3 adjusted-contrast:py-2">
    <div className="relative min-w-0 flex-1 basis-56" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}>
     <form role="search" onSubmit={event => { event.preventDefault(); if (results[0]) { navigate(results[0].path); setSearchOpen(false); setQuery(""); } }}>
      <SearchField className="w-full" variant="brand" label="Buscar páginas no Inventra" placeholder="Buscar página…" value={query} onFocus={() => setSearchOpen(true)} onChange={event => updateSearch(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setSearchOpen(false); if (event.key === "ArrowDown") { event.preventDefault(); document.getElementById("topbar-first-result")?.focus(); } }} aria-expanded={searchOpen && Boolean(query.trim())} aria-controls="topbar-page-results" />
     </form>
     {searchOpen && query.trim() && <nav id="topbar-page-results" aria-label="Resultados da busca de páginas" className="absolute inset-x-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-history-border bg-surface p-2 text-ink shadow-history-card">
      {!results.length && <p role="status" className="p-3 text-sm">Nenhuma página encontrada.</p>}
      {results.map((page, index) => <Link id={index === 0 ? "topbar-first-result" : undefined} key={page.path} to={page.path} className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-focus" onClick={() => { setSearchOpen(false); setQuery(""); }}>{page.title}</Link>)}
     </nav>}
    </div>
    {settings.voiceSearch && <Button variant="icon" className="rounded-full bg-white/12 text-on-brand hover:bg-white/20" aria-label={voice.listening ? "Parar pesquisa por voz" : "Pesquisar página por voz"} aria-pressed={voice.listening} onClick={voice.toggle}><Icon name="mic" /></Button>}
    <Button className="relative shrink-0 rounded-full bg-white/12 text-on-brand hover:bg-white/20 focus-visible:outline-on-brand" variant="icon" type="button" onClick={() => { setNotificationsOpen(true); }} aria-label={`Notificações${notifications.unread ? `, ${notifications.unread} não lidas` : ""}`} aria-haspopup="dialog">
     <img className="size-6" src={notificationIcon} alt="" />{(notifications.unread > 0) && <span className="absolute right-1.5 top-1.5 size-3 rounded-full border-2 border-brand-strong bg-login-gold" aria-hidden="true" />}
    </Button>
    <Link className="flex min-h-11 min-w-0 items-center gap-3 rounded-full text-left text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand" to="/perfil" aria-label={`Abrir perfil de ${userName}`}>
     <UserAvatar className="size-11 border-2 border-white/50 bg-brand text-sm text-on-brand" name={userName} photoUrl={userPhotoUrl} fallbackText={userInitials} /><span className="min-w-0 font-k2d max-sm:hidden"><span className="block text-topbar-user font-bold leading-normal wrap-anywhere">{userName}</span><span className="block text-topbar-role leading-normal wrap-anywhere">{userRole}</span></span>
    </Link>
   </div>
   {voice.listening && <p role="status" className="text-sm text-ink xl:col-span-2">Ouvindo… Diga o nome da página.</p>}{voice.error && <Feedback severity="error" className="xl:col-span-2">{voice.error}</Feedback>}
  </header>
  <NotificationPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} notifications={notifications} hasKitchen={Boolean(session?.user.kitchen)} role={role} />
 </>;
}
