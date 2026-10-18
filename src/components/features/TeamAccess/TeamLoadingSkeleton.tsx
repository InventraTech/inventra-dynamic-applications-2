import teamIcon from "../../../assets/icons/equipe.svg";
import teamHexagon from "../../../assets/images/equipe-hexagono.svg";
import teamMascot from "../../../assets/images/equipe-mascote.svg";

const skeletonFilters = [
    { key: "status-all", width: "w-20" },
    { key: "status-active", width: "w-24" },
    { key: "status-inactive", width: "w-24" },
    { key: "profile-one", width: "w-28" },
    { key: "profile-two", width: "w-24" },
];

function TeamLoadingSkeleton() {
    return (
        <div className="flex min-w-0 flex-col gap-5 px-6 pb-8 pt-6 max-md:px-4 max-sm:px-3">
            <p className="sr-only" role="status" aria-live="polite">Carregando equipe, perfis e pedidos de acesso…</p>

            <div className="flex min-h-36 min-w-0 items-center gap-5 overflow-hidden rounded-3xl bg-linear-to-br from-brand-strong to-brand px-5 py-5 shadow-history-card sm:px-8" aria-hidden="true">
                <img className="size-14 shrink-0 object-contain opacity-80 sm:size-20" src={teamIcon} alt="" />
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <span className="h-7 w-64 max-w-full rounded-full bg-on-brand/20 motion-safe:animate-pulse sm:h-9" />
                    <span className="h-4 w-96 max-w-full rounded-full bg-on-brand/15 motion-safe:animate-pulse" />
                    <div className="flex flex-wrap gap-2">
                        <span className="h-9 w-36 max-w-full rounded-full bg-brand-strong/70 motion-safe:animate-pulse" />
                        <span className="h-9 w-40 max-w-full rounded-full bg-login-gold/70 motion-safe:animate-pulse" />
                    </div>
                </div>
                <div className="relative hidden h-28 w-36 shrink-0 items-center justify-center sm:flex">
                    <img className="absolute inset-y-0 right-0 h-full w-36 object-contain opacity-60" src={teamHexagon} alt="" />
                    <img className="relative z-10 h-24 w-28 object-contain" src={teamMascot} alt="" />
                </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between" aria-hidden="true">
                <div className="flex min-h-14 w-fit max-w-full gap-2 rounded-2xl bg-surface p-1.5 shadow-history-card">
                    <span className="h-11 w-32 max-w-full rounded-xl bg-sidebar-active motion-safe:animate-pulse" />
                    <span className="h-11 w-44 max-w-full rounded-xl bg-history-card-header motion-safe:animate-pulse" />
                </div>
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                    <span className="h-11 min-w-0 flex-1 rounded-full bg-surface shadow-history-card motion-safe:animate-pulse sm:w-64" />
                    <span className="h-11 w-full rounded-full bg-brand/70 motion-safe:animate-pulse sm:w-40" />
                </div>
            </div>

            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)]" aria-hidden="true">
                <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        {skeletonFilters.map(({ key, width }) => (
                            <span className={`h-10 ${width} max-w-full rounded-full bg-surface shadow-history-card motion-safe:animate-pulse`} key={key} />
                        ))}
                    </div>
                    <div className="min-w-0 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5">
                        <div className="mb-4 h-4 w-28 rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="flex flex-col divide-y divide-history-border">
                            {["1", "2", "3", "4"].map((row) => (
                                <div className="flex min-h-16 items-center gap-3 py-3" key={row}>
                                    <span className="size-10 shrink-0 rounded-xl bg-history-avatar motion-safe:animate-pulse" />
                                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                                        <span className="h-3 w-40 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                                        <span className="h-2.5 w-28 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                                    </span>
                                    <span className="hidden h-7 w-20 rounded-full bg-sidebar-active motion-safe:animate-pulse sm:block" />
                                    <span className="hidden h-7 w-16 rounded-full bg-feedback-success-bg motion-safe:animate-pulse md:block" />
                                    <span className="flex shrink-0 gap-1.5">
                                        <span className="size-9 rounded-xl bg-history-card-header motion-safe:animate-pulse" />
                                        <span className="size-9 rounded-xl bg-history-card-header motion-safe:animate-pulse" />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6">
                    <span className="h-5 w-40 rounded-full bg-history-card-header motion-safe:animate-pulse" />
                    <span className="h-3 w-48 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                    {["1", "2", "3"].map((row) => (
                        <div className="flex items-center gap-3 border-t border-history-border pt-4" key={row}>
                            <span className="size-11 shrink-0 rounded-2xl bg-history-avatar motion-safe:animate-pulse" />
                            <span className="flex min-w-0 flex-1 flex-col gap-2">
                                <span className="h-3 w-28 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                                <span className="h-2.5 w-40 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                            </span>
                            <span className="size-9 shrink-0 rounded-full bg-sidebar-active motion-safe:animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TeamLoadingSkeleton;
