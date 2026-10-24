import accent from "../../../assets/images/onda-topbar.svg";
import notificationIcon from "../../../assets/icons/sino.svg";
import type { TopbarProps } from "../../../types/topbar";
import Button from "../../ui/Button";
import SearchField from "../../ui/SearchField";

function Topbar({ title, description, userInitials = "IN", userName = "Usuário", userRole = "", searchPlaceholder = "Buscar produtos, lotes, cozinhas…", hasNotifications = false, onSearch, onNotifications }: TopbarProps) {
    return (
        <header className="sticky top-0 z-40 isolate grid min-h-20 min-w-0 grid-cols-1 items-center gap-4 overflow-hidden bg-topbar-surface px-10 py-4 xl:grid-cols-[minmax(0,1fr)_auto] max-lg:px-6 max-md:px-4 large-text:grid-cols-1">
            <div className="relative z-10 min-w-0 text-ink">
                <h1 className="font-k2d text-topbar-title font-bold leading-tight wrap-anywhere">{title}</h1>
                <p className="mt-1 font-k2d text-topbar-description leading-normal wrap-anywhere">{description}</p>
            </div>
            <img className="topbar-accent pointer-events-none absolute right-0 bottom-0 -z-10 h-11/10 w-192 max-lg:w-158 max-md:w-105 max-xl:hidden large-text:hidden" src={accent} alt="" />
            <div className="relative flex min-w-0 flex-wrap items-center gap-3 rounded-2xl bg-brand px-3 py-2 xl:bg-transparent xl:p-0 large-text:bg-brand large-text:px-3 large-text:py-2 adjusted-contrast:bg-brand adjusted-contrast:px-3 adjusted-contrast:py-2">
                <SearchField className="w-75 max-w-full flex-1" variant="brand" label="Buscar no Inventra" placeholder={searchPlaceholder} onChange={(event) => onSearch?.(event.target.value)} />
                <Button className="relative min-h-11 min-w-11 shrink-0 rounded-full bg-white/12 text-on-brand hover:bg-white/20 focus-visible:outline-on-brand" variant="icon" type="button" onClick={onNotifications} aria-label={hasNotifications ? "Notificações. Há notificações." : "Notificações"}>
                    <img className="size-6" src={notificationIcon} alt="" />
                    {hasNotifications && <span className="absolute right-1.5 top-1.5 size-3 rounded-full border-2 border-brand-strong bg-login-gold" aria-hidden="true" />}
                </Button>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-white/50 bg-brand text-sm font-bold text-on-brand" aria-hidden="true">{userInitials}</div>
                <div className="min-w-0 font-k2d text-on-brand max-sm:w-full">
                    <p className="text-topbar-user font-bold leading-normal wrap-anywhere">{userName}</p>
                    <p className="text-topbar-role leading-normal wrap-anywhere">{userRole}</p>
                </div>
            </div>
        </header>
    );
}

export default Topbar;
