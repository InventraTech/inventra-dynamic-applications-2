import accent from "../../../assets/img/topbar-accent.svg";
import searchIcon from "../../../assets/icons/topbar-search.svg";
import notificationsIcon from "../../../assets/icons/topbar-notifications.svg";
import type { TopbarProps } from "../../../types/topbar";

function Topbar({
    title,
    description,
    userInitials = "FJ",
    userName = "fulano jr.",
    userRole = "Gerente estoque",
    searchPlaceholder = "Buscar produtos, lotes, cozinhas…",
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
                    <img src={searchIcon} alt="" aria-hidden="true" />
                    <input
                        className="min-w-0 flex-1 bg-transparent font-k2d text-topbar-search text-topbar-placeholder outline-none placeholder:text-topbar-placeholder max-md:hidden"
                        type="search"
                        aria-label="Buscar"
                        placeholder={searchPlaceholder}
                    />
                </label>

                <button className="shrink-0" type="button" aria-label="Abrir notificações">
                    <img src={notificationsIcon} alt="" aria-hidden="true" />
                </button>

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
