import accent from "../../../assets/images/onda-topbar.svg";
import searchIcon from "../../../assets/icons/busca.svg";
import notificationIcon from "../../../assets/icons/sino.svg";
import type { TopbarProps } from "../../../types/topbar";
import Button from "../../ui/Button";

function Topbar({
    title,
    description,
    userInitials = "FJ",
    userName = "fulano jr.",
    userRole = "Gerente estoque",
    searchPlaceholder = "Buscar produtos, lotes, cozinhas…",
    hasNotifications = false,
}: TopbarProps) {
    return (
        <header className="relative flex h-20 min-h-20 w-full shrink-0 items-start justify-between overflow-hidden bg-topbar-surface px-10 py-4 max-lg:px-6 max-md:px-4">
            <div className="relative z-10 flex h-full shrink-0 flex-col justify-center gap-2 whitespace-nowrap text-black max-md:max-w-44">
                <h1 className="font-k2d text-topbar-title font-bold leading-none max-md:text-xl">{title}</h1>
                <p className="font-k2d text-topbar-description leading-none max-md:hidden">{description}</p>
            </div>

            <img className="topbar-accent absolute right-0 top-0 z-1" src={accent} alt="" aria-hidden="true" />

            <div className="absolute right-7 top-4 z-10 flex items-center gap-4 whitespace-nowrap max-lg:right-5 max-md:right-4 max-md:gap-2">
                <label className="flex h-11 w-75 items-center gap-2.5 overflow-hidden rounded-full border border-topbar-border bg-topbar-search px-4 max-lg:w-60 max-md:h-10 max-md:w-10 max-md:justify-center max-md:px-2.5">
                    <img className="size-4.5 shrink-0 brightness-0 invert opacity-80" src={searchIcon} alt="" aria-hidden="true" />
                    <input
                        className="min-w-0 flex-1 bg-transparent font-k2d text-topbar-search text-topbar-placeholder outline-none placeholder:text-topbar-placeholder max-md:hidden"
                        type="search"
                        aria-label="Buscar"
                        placeholder={searchPlaceholder}
                    />
                </label>

                <Button
                    className="relative size-11 shrink-0 rounded-full bg-white/12 text-white hover:bg-white/20 focus-visible:outline-white"
                    variant="icon"
                    type="button"
                    aria-label={hasNotifications ? "Abrir notificações. Há notificações." : "Abrir notificações"}
                >
                    <img className="size-6" src={notificationIcon} alt="" aria-hidden="true" />
                    {hasNotifications && (
                        <span className="absolute right-1.5 top-1.5 size-3 rounded-full border-2 border-[#3e0490] bg-login-gold" aria-hidden="true" />
                    )}
                </Button>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/35 bg-topbar-purple max-md:h-10 max-md:w-10">
                    <span className="font-k2d text-topbar-user font-bold text-white max-md:text-sm">{userInitials}</span>
                </div>

                <div className="flex flex-col items-start gap-0.5 font-k2d leading-normal max-md:hidden">
                    <span className="text-topbar-user font-bold text-white">{userName}</span>
                    <span className="text-topbar-role text-topbar-placeholder">{userRole}</span>
                </div>
            </div>
        </header>
    );
}

export default Topbar;
