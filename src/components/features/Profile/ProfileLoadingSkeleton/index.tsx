function ProfileLoadingSkeleton() {
    return (
        <div className="min-w-0 bg-linear-to-b from-history-background-start to-history-background-end px-4 pb-10 pt-5 sm:px-6 sm:pt-6 xl:px-8 adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start" aria-busy="true">
            <p className="sr-only" role="status" aria-live="polite">Carregando seus dados de perfil…</p>
            <div className="mx-auto grid w-full max-w-screen-2xl min-w-0 gap-5 xl:grid-cols-3 large-text:grid-cols-1" aria-hidden="true">
                <div className="flex min-w-0 flex-col gap-5 xl:col-span-2">
                    <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-history-card-header motion-safe:animate-pulse" />
                            <div className="flex flex-1 flex-col gap-2"><div className="h-5 w-32 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-4 w-64 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" /></div>
                        </div>
                        <div className="mt-5 grid min-w-0 gap-5 sm:grid-cols-[7rem_minmax(0,1fr)] large-text:grid-cols-1">
                            <div className="flex items-center gap-3 sm:flex-col"><div className="size-20 rounded-3xl bg-history-card-header motion-safe:animate-pulse" /><div className="h-10 w-full rounded-xl bg-history-card-header motion-safe:animate-pulse" /></div>
                            <div className="flex min-w-0 flex-col gap-3"><div className="h-4 w-28 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-12 rounded-xl bg-history-card-header motion-safe:animate-pulse" /><div className="h-4 w-72 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" /><div className="h-14 rounded-xl bg-history-card-header motion-safe:animate-pulse" /></div>
                        </div>
                    </section>

                    <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6">
                        <div className="flex items-center gap-3"><div className="size-12 rounded-2xl bg-history-card-header motion-safe:animate-pulse" /><div className="flex flex-col gap-2"><div className="h-5 w-36 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-4 w-64 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" /></div></div>
                        <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-3 large-text:grid-cols-1">
                            <div className="flex flex-col gap-2"><div className="h-4 w-24 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" /></div>
                            <div className="flex flex-col gap-2"><div className="h-4 w-20 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" /><div className="h-1.5 rounded-full bg-history-card-header motion-safe:animate-pulse" /></div>
                            <div className="flex flex-col gap-2"><div className="h-4 w-36 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" /></div>
                        </div>
                        <div className="mt-5 h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" />
                    </section>
                </div>

                <aside className="flex min-w-0 flex-col gap-5">
                    <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6">
                        <div className="h-5 w-28 rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="mt-2 h-4 w-52 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="mt-4 divide-y divide-history-border">
                            {Array.from({ length: 4 }, (_, index) => <div key={index} className="flex items-center gap-3 py-3 first:pt-0"><div className="size-11 rounded-2xl bg-history-card-header motion-safe:animate-pulse" /><div className="flex flex-1 flex-col gap-2"><div className="h-3 w-20 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-4 w-full rounded-full bg-history-card-header motion-safe:animate-pulse" /></div></div>)}
                        </div>
                        <div className="mt-4 h-20 rounded-2xl bg-history-card-header motion-safe:animate-pulse" />
                    </section>
                    <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6">
                        <div className="flex items-center gap-3"><div className="size-12 rounded-2xl bg-history-card-header motion-safe:animate-pulse" /><div className="flex flex-1 flex-col gap-2"><div className="h-5 w-28 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-4 w-full rounded-full bg-history-card-header motion-safe:animate-pulse" /></div></div>
                        <div className="mt-4 h-9 w-48 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="mt-4 h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" />
                    </section>
                    <div className="h-28 rounded-3xl bg-sidebar-active motion-safe:animate-pulse" />
                </aside>
            </div>
        </div>
    );
}

export default ProfileLoadingSkeleton;
